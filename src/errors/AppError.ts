export class AppError extends Error {
  public status: number;
  public details?: unknown;
  constructor(message: string, status = 500, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.details = details;
    Error.captureStackTrace(this, AppError);
  }
}
