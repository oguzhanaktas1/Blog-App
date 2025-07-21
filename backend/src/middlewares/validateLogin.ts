import Joi from "joi";
import { Request, Response, NextFunction } from "express";

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export function validateLogin(req: Request, res: Response, next: NextFunction) {
  const { error } = loginSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return next({ status: 400, message: "Validation error", errors: error.details });
  }
  next();
} 