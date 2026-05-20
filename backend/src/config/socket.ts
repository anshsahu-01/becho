import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { verifyToken as verifyClerkToken } from "@clerk/backend";
import { prisma } from "./prisma";

let io: Server;

async function resolveSocketUserId(token: string) {
  if (!process.env.CLERK_SECRET_KEY) {
    console.warn("[socket] Clerk secret key missing during socket auth");
    return null;
  }

  try {
    const payload = await verifyClerkToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    const clerkId = payload.sub;

    if (!clerkId) {
      console.warn("[socket] Clerk token missing subject");
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        isDeleted: true,
        deletedAt: true,
      },
    });

    if (!user) {
      console.warn("[socket] Clerk-authenticated user not found in Prisma", { clerkId });
      return null;
    }

    if (user.isDeleted || user.deletedAt !== null) {
      console.warn("[socket] Clerk user is deleted", { clerkId, userId: user.id });
      return null;
    }

    console.info("[socket] Authenticated with Clerk token", { clerkId, userId: user.id });
    return user.id;
  } catch (error) {
    console.warn("[socket] Clerk socket auth failed", error);
    return null;
  }
}

function registerSocketHandlers(socket: Socket, userId: string) {
  socket.join(`user_${userId}`);

  socket.on("join_chat", (chatId: string) => {
    socket.join(`chat_${chatId}`);
  });

  socket.on("leave_chat", (chatId: string) => {
    socket.leave(`chat_${chatId}`);
  });

  socket.on("typing", (chatId: string) => {
    socket.to(`chat_${chatId}`).emit("typing", { chatId, userId });
  });

  socket.on("stop_typing", (chatId: string) => {
    socket.to(`chat_${chatId}`).emit("stop_typing", { chatId, userId });
  });

  socket.on("mark_delivered", async ({ chatId, messageIds }: { chatId: string; messageIds: string[] }) => {
    try {
      await prisma.message.updateMany({
        where: {
          id: { in: messageIds },
          conversationId: chatId,
          deliveredAt: null,
        },
        data: {
          deliveredAt: new Date(),
        },
      });
      socket.to(`chat_${chatId}`).emit("message_delivered", { chatId, messageIds, userId });
    } catch (err) {
      console.error("Error marking messages as delivered:", err);
    }
  });

  socket.on("mark_seen", async ({ chatId, messageIds }: { chatId: string; messageIds: string[] }) => {
    try {
      await prisma.message.updateMany({
        where: {
          id: { in: messageIds },
          conversationId: chatId,
          seenAt: null,
        },
        data: {
          seenAt: new Date(),
        },
      });

      socket.to(`chat_${chatId}`).emit("message_seen", { chatId, messageIds, userId });
    } catch (err) {
      console.error("Error marking messages as seen:", err);
    }
  });

  socket.on("disconnect", (reason) => {
    console.info("[socket] Disconnected", { userId, socketId: socket.id, reason });
  });
}

export function initSocket(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: "*", // allow all in dev, restrict in prod
    },
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      console.warn("[socket] Missing auth token");
      return next(new Error("Authentication error"));
    }

    const userId = await resolveSocketUserId(token);
    if (!userId) {
      return next(new Error("Authentication error"));
    }

    socket.data.userId = userId;
    next();
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId;
    console.info("[socket] Connected", { userId, socketId: socket.id });
    registerSocketHandlers(socket, userId);
  });

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}
