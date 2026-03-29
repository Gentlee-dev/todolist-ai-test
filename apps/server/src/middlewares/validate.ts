import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { AppError } from "./error-handler";

export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.errors.map((e) => e.message).join(", ");
      throw new AppError(400, "VALIDATION_ERROR", message);
    }
    req.body = result.data;
    next();
  };
}

export function parseQuery<T>(schema: ZodSchema<T>, query: Record<string, unknown>): T {
  const result = schema.safeParse(query);
  if (!result.success) {
    const message = result.error.errors.map((e) => e.message).join(", ");
    throw new AppError(400, "VALIDATION_ERROR", message);
  }
  return result.data;
}
