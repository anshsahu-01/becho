import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as productService from "./product.service";
import {
  CreateProductBody,
  GetProductsQuery,
} from "./product.validation";

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.createProduct(req.user!.userId, {
    ...(req.body as CreateProductBody),
    images: req.uploadedImageUrls ?? [],
  });
  res.status(201).json({ success: true, data: product });
});

export const getAllProducts = asyncHandler(async (req: Request, res: Response) => {
  const result = await productService.getAllProducts(
    req.query as unknown as GetProductsQuery
  );
  res.json({
    success: true,
    data: result.products,
    pagination: result.pagination,
  });
});

export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const product = await productService.getProductById(id);
  res.json({ success: true, data: product });
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  await productService.deleteProduct(id, req.user!.userId);
  res.json({ success: true, message: "Product deleted successfully" });
});
