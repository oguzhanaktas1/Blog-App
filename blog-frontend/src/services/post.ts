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
  const token = localStorage.getItem("token");

  const res = await axios.post<Post>('/posts', postData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const likePost = async (postId: number): Promise<{ liked: boolean }> => {
  const token = localStorage.getItem("token");
  const res = await axios.post<{ liked: boolean }>(`/posts/${postId}/like`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const unlikePost = async (postId: number): Promise<{ liked: boolean }> => {
  const token = localStorage.getItem("token");
  const res = await axios.delete<{ liked: boolean }>(`/posts/${postId}/like`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const isPostLiked = async (postId: number): Promise<{ liked: boolean }> => {
  const token = localStorage.getItem("token");
  const res = await axios.get<{ liked: boolean }>(`/posts/${postId}/like`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getLikedPosts = async (): Promise<Post[]> => {
  const token = localStorage.getItem("token");
  const res = await axios.get<Post[]>(`/posts/liked`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

