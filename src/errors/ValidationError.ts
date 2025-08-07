import { AppError } from "./AppError";
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 422, details);
    this.name = "ValidationError";
  }
}
