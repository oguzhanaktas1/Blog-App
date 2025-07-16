import api from "./axios";

export const fetchComments = (postId: number) =>
  api.get(`/api/posts/${postId}/comments`).then((res) => res.data);

export const addComment = (postId: number, text: string) =>
  api.post(`/api/posts/${postId}/comments`, { text }).then((res) => res.data);

export const deleteComment = (commentId: number) =>
  api.delete(`/api/comments/${commentId}`).then((res) => res.data); 