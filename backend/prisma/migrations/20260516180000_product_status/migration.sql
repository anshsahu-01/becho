-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'SOLD', 'HIDDEN');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE';

-- Migrate existing isSold flag to status
UPDATE "Product" SET "status" = 'SOLD' WHERE "isSold" = true;

-- CreateIndex
CREATE INDEX "Product_status_idx" ON "Product"("status");
