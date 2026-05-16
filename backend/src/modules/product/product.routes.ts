import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import {
  handleProductImageUpload,
  processProductImages,
} from "../../middleware/upload";
import { validate } from "../../middleware/validate";
import * as productController from "./product.controller";
import {
  createProductSchema,
  getProductsQuerySchema,
  productIdParamSchema,
} from "./product.validation";

const router = Router();

router.post(
  "/",
  authenticate,
  handleProductImageUpload,
  processProductImages,
  validate(createProductSchema),
  productController.createProduct
);

router.get(
  "/",
  validate(getProductsQuerySchema, "query"),
  productController.getAllProducts
);

router.get(
  "/:id",
  validate(productIdParamSchema, "params"),
  productController.getProductById
);

router.delete(
  "/:id",
  authenticate,
  validate(productIdParamSchema, "params"),
  productController.deleteProduct
);

export default router;
