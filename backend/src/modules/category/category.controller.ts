import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as categoryService from "./category.service";
import { CreateCategoryInput } from "./category.validation";

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.createCategory(
    req.body as CreateCategoryInput
  );
  res.status(201).json({ success: true, data: category });
});

export const getAllCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await categoryService.getAllCategories();
  res.json({ success: true, data: categories });
});
