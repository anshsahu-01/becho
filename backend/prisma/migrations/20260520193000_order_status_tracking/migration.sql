CREATE TYPE "OrderStatus" AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');

ALTER TABLE "Order"
ADD COLUMN "orderStatus" "OrderStatus" NOT NULL DEFAULT 'pending';

UPDATE "Order"
SET "orderStatus" = CASE
  WHEN "paymentStatus" = 'confirmed' THEN 'processing'
  WHEN "paymentStatus" = 'cancelled' THEN 'cancelled'
  ELSE 'pending'
END;

CREATE INDEX "Order_orderStatus_idx" ON "Order"("orderStatus");
