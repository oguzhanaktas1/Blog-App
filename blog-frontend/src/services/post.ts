import axios from '../utils/axios';

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
  author?: User;  // Eğer backend'den geliyorsa, opsiyonel olarak ekle
  createdAt: string;
}

export const getPosts = async (): Promise<Post[]> => {
  const res = await axios.get<Post[]>('/posts');  // Generic tip verildi
  return res.data;
};

export const createPost = async (postData: { title: string; content: string }): Promise<Post> => {
  const res = await axios.post<Post>('/posts', postData);  // Generic tip verildi
  return res.data;
};
