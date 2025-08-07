import { AppError } from "../errors/AppError";

export function errorResponse(err: unknown) {
  if (err instanceof AppError) {
    return {
      error: err.message,
      details: err.details,
      status: err.status,
      type: err.name,
    };
  }
  if (err instanceof Error) {
    return {
      error: err.message,
      status: 500,
      type: err.name,
    };
  }
  return {
    error: "Unknown error",
    status: 500,
    type: "UnknownError",
  };
}
