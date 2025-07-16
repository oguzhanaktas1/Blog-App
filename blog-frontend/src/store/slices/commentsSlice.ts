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
    items: [],
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
        state.items = action.payload;
      })
      .addCase(fetchCommentsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addCommentThunk.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(deleteCommentThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((c: any) => c.id !== action.payload);
      });
  },
});

export default commentsSlice.reducer; 