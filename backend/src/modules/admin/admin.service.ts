import { Request } from "express";
import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";

const ALLOWED_ADMIN_EMAIL = "anshsahu.dev@gmail.com";

export async function assertAdminAccess(req: Request) {
  const userId = req.user?.userId;
  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!user || user.email?.toLowerCase() !== ALLOWED_ADMIN_EMAIL.toLowerCase()) {
    throw new AppError("Forbidden", 403);
  }
}