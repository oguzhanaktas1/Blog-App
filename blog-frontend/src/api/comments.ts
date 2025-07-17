import axios from "../utils/axios";

export const fetchComments = (postId: number) =>
  axios.get(`/api/posts/${postId}/comments`).then((res) => res.data);

export const addComment = (postId: number, text: string) =>
  axios.post(`/api/posts/${postId}/comments`, { text }).then((res) => res.data);

export const deleteComment = (commentId: number) =>
  axios.delete(`/api/comments/${commentId}`).then((res) => res.data); 