import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { getValidated } from "../../middleware/validate";
import * as productService from "./product.service";
import {
  CreateProductBody,
  GetProductsQuery,
} from "./product.validation";

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.createProduct(req.user!.userId, {
    ...getValidated<CreateProductBody>(req, "body"),
    images: req.uploadedImageUrls ?? [],
  });
  res.status(201).json({ success: true, data: product });
});

export const getAllProducts = asyncHandler(async (req: Request, res: Response) => {
  const result = await productService.getAllProducts(
    getValidated<GetProductsQuery>(req, "query")
  );
  res.json({
    success: true,
    data: result.products,
    pagination: result.pagination,
  });
});

export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = getValidated<{ id: string }>(req, "params");
  const product = await productService.getProductById(id);
  res.json({ success: true, data: product });
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = getValidated<{ id: string }>(req, "params");
  await productService.deleteProduct(id, req.user!.userId);
  res.json({ success: true, message: "Product deleted successfully" });
});
