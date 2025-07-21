import { Request, Response, NextFunction } from "express";

export function validateComment(req: Request, res: Response, next: NextFunction): void {
  const { text } = req.body;
  if (!text || typeof text !== "string" || text.trim() === "") {
    return next({ status: 400, message: "Yorum boş olamaz" });
  }
  next();
} 