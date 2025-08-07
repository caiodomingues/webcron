import { Request, Response, NextFunction } from "express";
import { ZodTypeAny } from "zod";
import { ValidationError } from "../errors/ValidationError";

export function validateBody(schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(new ValidationError("Invalid request body", result.error.issues));
    }
    req.body = result.data;
    next();
  };
}
