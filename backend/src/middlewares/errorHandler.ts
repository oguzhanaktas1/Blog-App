import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

// Centralized error handler middleware
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  // 1. Explicit status/message from controller
  let status = err.status || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors;

  // 2. Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    status = 400;
    message = err.message || "Database error";
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    status = 400;
    message = "Validation error";
    errors = err.message;
  }

  // 3. JWT errors
  if (err instanceof JsonWebTokenError) {
    status = 401;
    message = "Invalid token";
  } else if (err instanceof TokenExpiredError) {
    status = 401;
    message = "Token expired";
  }

  // 4. Express-validator errors (from controller)
  if (Array.isArray(errors)) {
    return res.status(status).json({ error: message, errors });
  }

  // 5. Default error response
  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}