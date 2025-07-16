import { Request, Response, NextFunction } from "express";

export function validateComment(req: Request, res: Response, next: NextFunction): void {
  const { text } = req.body;
  if (!text || typeof text !== "string" || text.trim() === "") {
    res.status(400).json({ error: "Yorum boş olamaz" });
    return;
  }
  next();
} 