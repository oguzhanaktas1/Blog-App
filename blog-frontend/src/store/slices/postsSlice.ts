/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { getPosts, createPost, type Post } from "../../services/post";
import type { RootState } from "../";
import api from "../../api/axios";

interface PostsState {
  posts: Post[];
  loading: boolean;
  error: string | null;
}

const initialState: PostsState = {
  posts: [],
  loading: false,
  error: null,
};

export const fetchPostsThunk = createAsyncThunk<
  Post[],
  void,
  { rejectValue: string }
>("posts/fetch", async (_, { rejectWithValue }) => {
  try {
    return await getPosts();
  } catch (err) {
    return rejectWithValue("Postları alırken hata oluştu");
  }
});

export const addPostThunk = createAsyncThunk<
  Post,
  { title: string; content: string },
  { rejectValue: string }
>("posts/add", async (data, { rejectWithValue }) => {
  try {
    return await createPost(data);
  } catch (err) {
    return rejectWithValue("Post ekleme başarısız");
  }
});

export const updatePostThunk = createAsyncThunk<Post, { id: number; title: string; content: string }>(
  'posts/updatePost',
  async ({ id, title, content }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');

      // Axios tipli response
      const response = await api.put<Post>(
        `/posts/${id}`,
        { title, content },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to update post');
    }
  }
);

export const deletePostThunk = createAsyncThunk<
  number, // Dönen veri tipi (silen postId)
  number, // Parametre olarak verilen postId
  { rejectValue: string }
>("posts/deletePost", async (postId, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token");
    await api.delete(`/posts/${postId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return postId;
  } catch (error) {
    return rejectWithValue("Post silinemedi.");
  }
});

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPostsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchPostsThunk.fulfilled,
        (state, action: PayloadAction<Post[]>) => {
          state.posts = action.payload;
          state.loading = false;
          state.error = null;
        }
      )
      .addCase(fetchPostsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Post yükleme hatası";
      })
      .addCase(addPostThunk.fulfilled, (state, action: PayloadAction<Post>) => {
        state.posts.unshift(action.payload);
      })
      .addCase(deletePostThunk.fulfilled, (state, action) => {
        state.posts = state.posts.filter((p) => p.id !== action.payload);
      })
      .addCase(updatePostThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updatePostThunk.fulfilled,
        (state, action: PayloadAction<Post>) => {
          state.loading = false;
          const index = state.posts.findIndex(
            (p) => p.id === action.payload.id
          );
          if (index !== -1) {
            state.posts[index] = action.payload; // güncel postu direkt store'da güncelle
          }
        }
      )
      .addCase(updatePostThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default postsSlice.reducer;
// postsSlice.ts dosyasının en altına ekle
export const selectPosts = (state: RootState) => state.posts.posts;
export const selectPostsLoading = (state: RootState) => state.posts.loading;
export const selectPostsError = (state: RootState) => state.posts.error;
