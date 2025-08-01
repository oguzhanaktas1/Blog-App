// blog-backend/src/controllers/SearchController.ts
import { Request, Response } from 'express';
import { prisma } from "../prisma/client";

// Arama sonuçları için arayüz tanımı (Bu kalsın)
export interface SearchPostResult {
    id: number;
    title: string;
    createdAt: Date;
    content: string;
    author?: {
        id: number;
        name?: string | null;
        username?: string | null;
        email: string;
        profilePhoto?: string | null;
    };
}

export const searchPostsByTitle = async (
    req: Request,
    res: Response<SearchPostResult[]>
) => {
    try {
        const query = req.query.q as string;

        if (!query || query.trim().length === 0) {
            return res.status(200).json([]);
        }

        const posts = await prisma.post.findMany({
            where: {
                title: {
                    contains: query,
                    mode: 'insensitive',
                },
            },
            select: {
                id: true,
                title: true,
                createdAt: true,
                content: true,
                author: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        email: true,
                        profilePhoto: true,
                    },
                },
            },
            take: 10,
        });

        res.json(posts as SearchPostResult[]);
    } catch (error) {
        console.error('Post arama hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası.' } as any);
    }
};