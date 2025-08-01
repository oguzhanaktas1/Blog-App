/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchComments, addComment, deleteComment } from "../../api/comments";
import type { Comment } from "../../types/Comment";

export const fetchCommentsThunk = createAsyncThunk(
  "comments/fetchComments",
  async (postId: number) => {
    return await fetchComments(postId);
  }
);

export const addCommentThunk = createAsyncThunk(
  "comments/addComment",
  async ({ postId, text }: { postId: number; text: string }) => {
    return await addComment(postId, text);
  }
);

export const deleteCommentThunk = createAsyncThunk(
  "comments/deleteComment",
  async (commentId: number) => {
    await deleteComment(commentId);
    return commentId;
  }
);

const commentsSlice = createSlice({
  name: "comments",
  initialState: {
    items: {},
    loading: false,
    error: null,
  } as any,
  reducers: {
    addCommentFromSocket: (state, action) => {
      const { postId, comment } = action.payload;
      if (!state.items[postId]) {
        state.items[postId] = [];
      }
    
      const exists = state.items[postId].some((c: Comment) => c.id === comment.id);
      if (!exists) {
        state.items[postId].push(comment);
      }
    },    
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCommentsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCommentsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.items[action.meta.arg] = action.payload;
      })
      .addCase(fetchCommentsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addCommentThunk.fulfilled, (state, action) => {
        const payload = action.payload as { id: number; text: string; createdAt: string; postId: number; author?: any };
        const postId = payload.postId;
        if (!state.items[postId]) state.items[postId] = [];
        state.items[postId].push(payload);
      })
      .addCase(deleteCommentThunk.fulfilled, (state, action) => {
        const commentId = action.payload as number;
        for (const postId in state.items) {
          state.items[postId] = state.items[postId].filter((c: any) => c.id !== commentId);
        }
      });
  },
});
export const { addCommentFromSocket } = commentsSlice.actions;
export default commentsSlice.reducer; 