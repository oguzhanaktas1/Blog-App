export interface Comment {
    id: number;
    text: string;
    createdAt: string;
    postId: number;
    author?: {
      id: number;
      name: string;
      email: string;
    } | null;
  }