import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import categoryRoutes from "../modules/category/category.routes";
import productRoutes from "../modules/product/product.routes";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ success: true, message: "Server is running" });
});

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);

export default router;
