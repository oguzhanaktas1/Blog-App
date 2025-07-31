export interface Author {
    name?: string | null;
    username?: string | null;
    email?: string | null;
    profilePhoto?: string | null;
  }
  
  export interface PostContentBoxPost {
    id: number;
    title: string;
    content: string;
    createdAt: string;
    author?: Author;
    authorId?: number;
    images?: {
      id: number;
      url: string;
    }[];
  }