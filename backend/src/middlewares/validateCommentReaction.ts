import { Request, Response, NextFunction } from "express";

const validCommentReactions = ["like", "dislike", "laugh"];

export const validateCommentReaction = (req: Request, res: Response, next: NextFunction): void => {
  const { reaction } = req.body;

  if (!reaction || typeof reaction !== "string") {
    res.status(400).json({ message: "Yorum tepkisi geçerli değil." });
    return;
  }

  if (!validCommentReactions.includes(reaction)) {
    res.status(400).json({ message: `Tepki '${reaction}' geçerli değil.` });
    return;
  }

  next();
};
