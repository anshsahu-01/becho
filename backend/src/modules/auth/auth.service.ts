import { prisma } from "../../config/prisma";
import { signToken } from "../../utils/jwt";
import { AppError } from "../../utils/AppError";

// Extend with register/login when implementing auth endpoints
export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, createdAt: true },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
}

export function createAuthToken(userId: string): string {
  return signToken({ userId });
}
