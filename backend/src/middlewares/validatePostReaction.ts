import { Request, Response, NextFunction } from "express";

const validPostReactions = ["like", "love", "haha", "sad", "angry"];

export const validatePostReaction = (req: Request, res: Response, next: NextFunction): void => {
  const { reaction } = req.body;

  if (!reaction || typeof reaction !== "string") {
    res.status(400).json({ message: "Gönderi tepkisi geçerli değil." });
    return;
  }

  if (!validPostReactions.includes(reaction)) {
    res.status(400).json({ message: `Tepki '${reaction}' geçerli değil.` });
    return;
  }

  next();
};
