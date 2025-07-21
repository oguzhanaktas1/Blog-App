import Joi from "joi";
import { Request, Response, NextFunction } from "express";

const postSchema = Joi.object({
  title: Joi.string().allow("").optional(), // Başlık zorunlu değil
  content: Joi.string().min(1).required(),   // İçerik zorunlu
});

export function validatePost(req: Request, res: Response, next: NextFunction) {
  const { error } = postSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return next({ status: 400, message: "Validation error", errors: error.details });
  }
  next();
} 