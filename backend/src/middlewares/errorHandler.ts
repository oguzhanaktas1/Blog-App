import { Request, Response, NextFunction } from "express";
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/library";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  let status = err.status || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors;

  if (err instanceof PrismaClientKnownRequestError) {
    status = 400;
    message = err.message || "Database error";
  } else if (err instanceof PrismaClientValidationError) {
    status = 400;
    message = "Validation error";
    errors = err.message;
  }

  if (err instanceof JsonWebTokenError) {
    status = 401;
    message = "Invalid token";
  } else if (err instanceof TokenExpiredError) {
    status = 401;
    message = "Token expired";
  }

  if (Array.isArray(errors)) {
    return res.status(status).json({ error: message, errors });
  }

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}
