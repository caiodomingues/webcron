import { AppError } from "../errors/AppError";

export function errorResponse(err: unknown) {
  if (err instanceof AppError) {
    return {
      message: err.message,
      details: err.details,
      status: err.status,
      type: err.name,
    };
  }
  if (err instanceof Error) {
    return {
      message: err.message,
      status: 500,
      type: err.name,
    };
  }
  return {
    message: "Unknown error",
    status: 500,
    type: "UnknownError",
  };
}
