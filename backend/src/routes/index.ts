import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ success: true, message: "Server is running" });
});

router.use("/auth", authRoutes);

export default router;
