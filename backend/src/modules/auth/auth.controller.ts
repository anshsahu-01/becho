import { Request, Response } from "express";
import * as authService from "./auth.service";
import { asyncHandler } from "../../utils/asyncHandler";

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getUserById(req.user!.userId);
  res.json({ success: true, data: user });
});
