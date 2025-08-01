/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/axios";
import type { RootState } from "../index";

export type Notification = {
  isRead: any;
  id: number;
  content: string;
  createdAt: string;
  receiverId: number; // Bildirimin kime gittiği
};

type NotificationState = {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
};

const initialState: NotificationState = {
  notifications: [],
  loading: false,
  error: null,
};

// Bildirimleri çek
export const fetchNotificationsThunk = createAsyncThunk(
  "notifications/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/api/notifications");
      return res.data as Notification[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Bildirimler alınamadı");
    }
  }
);

// Bildirimi sil
export const deleteNotificationThunk = createAsyncThunk(
  "notifications/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/notifications/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Silme başarısız");
    }
  }
);

// Yeni: Bildirim oluştur
export const createNotificationThunk = createAsyncThunk(
  "notifications/create",
  async (
    {
      content,
      receiverId,
    }: { content: string; receiverId: number },
    { rejectWithValue }
  ) => {
    try {
      const res = await axios.post("/api/notifications", {
        content,
        receiverId,
      });
      return res.data as Notification;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Bildirim oluşturulamadı");
    }
  }
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotificationFromSocket: (state, action) => {
      state.notifications.unshift(action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotificationsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotificationsThunk.fulfilled, (state, action) => {
        state.notifications = action.payload;
        state.loading = false;
      })
      .addCase(fetchNotificationsThunk.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      })
      .addCase(deleteNotificationThunk.fulfilled, (state, action) => {
        state.notifications = state.notifications.filter((n) => n.id !== action.payload);
      })
      .addCase(createNotificationThunk.fulfilled, (state, action) => {
        state.notifications.unshift(action.payload);
      });
  },
});

export const {
  addNotificationFromSocket,
  clearNotifications,
} = notificationSlice.actions;

export const selectNotifications = (state: RootState) => state.notifications;

export default notificationSlice.reducer;
