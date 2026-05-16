import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import * as authController from "./auth.controller";

const router = Router();

router.get("/me", authenticate, authController.getMe);

export default router;
