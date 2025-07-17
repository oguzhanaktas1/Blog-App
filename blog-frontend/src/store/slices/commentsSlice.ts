/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchComments, addComment, deleteComment } from "../../api/comments";

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
    items: {}, // { [postId]: Comment[] }
    loading: false,
    error: null,
  } as any,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCommentsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCommentsThunk.fulfilled, (state, action) => {
        state.loading = false;
        // action.meta.arg is postId
        state.items[action.meta.arg] = action.payload;
      })
      .addCase(fetchCommentsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addCommentThunk.fulfilled, (state, action) => {
        // action.payload should be a comment with postId (now always present)
        const payload = action.payload as { id: number; text: string; createdAt: string; postId: number; author?: any };
        const postId = payload.postId;
        if (!state.items[postId]) state.items[postId] = [];
        state.items[postId].push(payload);
      })
      .addCase(deleteCommentThunk.fulfilled, (state, action) => {
        // action.payload should be commentId
        const commentId = action.payload as number;
        for (const postId in state.items) {
          state.items[postId] = state.items[postId].filter((c: any) => c.id !== commentId);
        }
      });
  },
});

export default commentsSlice.reducer; 