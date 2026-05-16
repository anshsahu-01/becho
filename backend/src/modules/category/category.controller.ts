import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { getValidated } from "../../middleware/validate";
import * as categoryService from "./category.service";
import { CreateCategoryInput } from "./category.validation";

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.createCategory(
    getValidated<CreateCategoryInput>(req, "body")
  );
  res.status(201).json({ success: true, data: category });
});

export const getAllCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await categoryService.getAllCategories();
  res.json({ success: true, data: categories });
});
