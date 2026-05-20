import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import { CreateCategoryInput } from "./category.validation";

const defaultCategoryNames = [
  "Books",
  "Calculators",
  "Drafter",
  "Electronics",
  "Lab Equipment",
  "Hostel Items",
  "Cycles",
  "Notes",
  "Accessories",
  "Others",
] as const;

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
  let categories = await prisma.category.findMany({
    select: categorySelect,
    orderBy: { name: "asc" },
  });

  if (categories.length === 0) {
    console.warn("[category] Category table empty, seeding defaults");
    await prisma.category.createMany({
      data: defaultCategoryNames.map((name) => ({ name })),
      skipDuplicates: true,
    });

    categories = await prisma.category.findMany({
      select: categorySelect,
      orderBy: { name: "asc" },
    });
  }

  return categories;
}
