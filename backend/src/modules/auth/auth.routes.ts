import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import * as authController from "./auth.controller";
import { loginSchema, registerSchema } from "./auth.validation";

const router = Router();

router.post(
  "/register",
  validate(registerSchema),
  authController.register
);

router.post("/login", validate(loginSchema), authController.login);

router.get("/me", authenticate, authController.getMe);

export default router;
