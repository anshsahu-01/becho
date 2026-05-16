import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import { CreateCategoryInput } from "./category.validation";

const categorySelect = {
  id: true,
  name: true,
  createdAt: true,
} as const;

export async function createCategory(input: CreateCategoryInput) {
  const name = input.name.trim();

  const existing = await prisma.category.findUnique({
    where: { name },
    select: { id: true },
  });

  if (existing) {
    throw new AppError("Category already exists", 409);
  }

  return prisma.category.create({
    data: { name },
    select: categorySelect,
  });
}

export async function getAllCategories() {
  return prisma.category.findMany({
    select: categorySelect,
    orderBy: { name: "asc" },
  });
}
