import { Request, Response } from "express";
import { prisma } from "../prisma/client";

// GET /api/reactions/users?reaction=like&postId=1  veya &commentId=5
export const getReactionUsers = async (req: Request, res: Response): Promise<void> => {
  const { reaction, postId, commentId } = req.query;

  try {
    const where = {
      type: reaction as string,
      ...(postId ? { postId: Number(postId) } : {}),
      ...(commentId ? { commentId: Number(commentId) } : {}),
    };

    const reactions = await prisma.reaction.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
          },
        },
      },
    });

    const users = reactions.map((r: { user: any; }) => r.user);

    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ message: "Tepki verenler alınamadı." });
  }
};
