import Joi from "joi";
import { Request, Response, NextFunction } from "express";

const signupSchema = Joi.object({
  name: Joi.string().min(2).required(),
  username: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export function validateSignup(req: Request, res: Response, next: NextFunction) {
  const { error } = signupSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return next({ status: 400, message: "Validation error", errors: error.details });
  }
  next();
} 