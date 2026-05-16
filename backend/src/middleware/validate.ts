import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { AppError } from "../utils/AppError";

type RequestSource = "body" | "query" | "params";

export function validate(schema: ZodSchema, source: RequestSource = "body") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join(", ");
      next(new AppError(message, 400));
      return;
    }

    req[source] = result.data;
    next();
  };
}
