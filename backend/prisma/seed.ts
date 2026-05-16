import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
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
];

async function main() {
  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log(`Seeded ${categories.length} categories`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
