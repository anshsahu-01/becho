import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { AppError } from "../utils/AppError";

type RequestSource = "body" | "query" | "params";

declare global {
  namespace Express {
    interface Request {
      validated?: Partial<Record<RequestSource, unknown>>;
    }
  }
}

export function getValidated<T>(req: Request, source: RequestSource): T {
  const value = req.validated?.[source];
  if (value === undefined) {
    throw new AppError(`Validated ${source} is missing`, 500);
  }
  return value as T;
}

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

    req.validated = { ...req.validated, [source]: result.data };
    next();
  };
}
