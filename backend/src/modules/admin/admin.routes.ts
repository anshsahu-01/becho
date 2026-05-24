import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import * as adminController from "./admin.controller";

const router = Router();

router.get("/stats", authenticate, adminController.getStats);
router.get("/users", authenticate, adminController.getUsers);
router.get("/products", authenticate, adminController.getProducts);
router.get("/orders", authenticate, adminController.getOrders);

export default router;