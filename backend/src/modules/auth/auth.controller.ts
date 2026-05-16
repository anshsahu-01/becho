import { Request, Response } from "express";
import * as authService from "./auth.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { LoginInput, RegisterInput } from "./auth.validation";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.register(req.body as RegisterInput);
  res.status(201).json({ success: true, data: user });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body as LoginInput);
  res.json({ success: true, data: result });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getUserById(req.user!.userId);
  res.json({ success: true, data: user });
});
