import { Request, Response } from "express";
import * as authService from "./auth.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { getValidated } from "../../middleware/validate";
import { LoginInput, RegisterInput } from "./auth.validation";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.register(getValidated<RegisterInput>(req, "body"));
  res.status(201).json({ success: true, data: user });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(getValidated<LoginInput>(req, "body"));
  res.json({ success: true, data: result });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getUserById(req.user!.userId);
  res.json({ success: true, data: user });
});
