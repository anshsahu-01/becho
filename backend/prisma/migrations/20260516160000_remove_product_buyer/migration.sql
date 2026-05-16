-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT IF EXISTS "Product_buyerId_fkey";

-- DropIndex
DROP INDEX IF EXISTS "Product_buyerId_idx";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN IF EXISTS "buyerId";
