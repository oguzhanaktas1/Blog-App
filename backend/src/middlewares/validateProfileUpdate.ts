import Joi from "joi";
import { Request, Response, NextFunction } from "express";

const profileUpdateSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  profilePhoto: Joi.string().optional(),
});

export function validateProfileUpdate(req: Request, res: Response, next: NextFunction) {
  const { error } = profileUpdateSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return next({ status: 400, message: "Validation error", errors: error.details });
  }
  next();
} 