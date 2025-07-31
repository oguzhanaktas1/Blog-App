// blog-backend/src/controllers/SearchController.ts
import { Request, Response } from 'express';
import { prisma } from "../prisma/client";

// Arama sonuçları için arayüz tanımı (Bu kalsın)
export interface SearchPostResult {
    id: number;
    title: string;
    createdAt: Date; // Prisma Date objesi döner
    // *** BURAYI EKLEDIK: content alanını search sonuçlarına dahil ediyoruz ***
    content: string; // PostContentBoxPost'un beklediği content alanı
    author?: {
        id: number;
        name?: string | null; // PostContentBoxPost'un author.name beklediği için ekledik
        username?: string | null;
        email: string; // PostContentBoxPost'un author.email beklediği için ekledik
        profilePhoto?: string | null;
    };
    // readTime backend'de yoksa buraya eklemeyin, frontend'de opsiyonel kalsın.
}

/**
 * Dinamik post başlığı arama işlemini yönetir.
 * @param req Express isteği (query parametresi olarak 'q' içerir)
 * @param res Express yanıtı (SearchPostResult[] döner)
 */
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
                content: true, // <--- BURAYI EKLEDIK: content'i de seçiyoruz
                author: {
                    select: {
                        id: true,
                        name: true, // <--- BURAYI EKLEDIK: author name'i de seçiyoruz
                        username: true,
                        email: true, // <--- BURAYI EKLEDIK: author email'i de seçiyoruz
                        profilePhoto: true,
                    },
                },
            },
            take: 10,
        });

        // Backend'de Date objesi döner. JSON'a serialize edilirken stringe dönüşür.
        // Frontend'de bu string'i Date objesine parse edip kullanmalısınız.
        res.json(posts as SearchPostResult[]);
    } catch (error) {
        console.error('Post arama hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası.' } as any);
    }
};