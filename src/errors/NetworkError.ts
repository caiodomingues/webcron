import { AppError } from "./AppError";
export class NetworkError extends AppError {
  constructor(message: string, status = 500, details?: unknown) {
    super(message, status, details);
    this.name = "NetworkError";
  }
}
