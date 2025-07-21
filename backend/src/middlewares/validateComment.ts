import Joi from "joi";
import { Request, Response, NextFunction } from "express";

const commentSchema = Joi.object({
  text: Joi.string().min(1).required(), // Yorum zorunlu ve boş olamaz
});

export function validateComment(req: Request, res: Response, next: NextFunction) {
  const { error } = commentSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return next({ status: 400, message: "Validation error", errors: error.details });
  }
  next();
} 