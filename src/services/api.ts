import axios from 'axios';
import { AuthResponse, Message, OnlineUsersResponse, Room, User } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5174';

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor to add token
api.interceptors.request.use((config) => {
  // Token will be managed by the auth store and injected here
  // We'll use a setter from the store to update this or just read from a variable
  return config;
});

// Interceptor for errors and ProblemDetails
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;

    if (status === 401) {
      window.dispatchEvent(new CustomEvent('auth-unauthorized'));
    }

    let message = 'An unexpected error occurred';

    if (status === 500) {
      message = 'Something went wrong. Please try again.';
    } else if (status === 404) {
      message = 'Not found';
    } else {
      message = data?.detail || data?.message || data?.title || message;
    }

    return Promise.reject({ ...error, userMessage: message });
  }
);

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const authApi = {
  register: (data: any) => api.post<AuthResponse>('/api/auth/register', data),
  login: (data: any) => api.post<AuthResponse>('/api/auth/login', data),
  getMe: () => api.get<User>('/api/users/me'),
  updateMe: (data: { displayName: string; avatarUrl?: string }) =>
    api.put<User>('/api/users/me', data),
  getOnlineUsers: () => api.get<OnlineUsersResponse>('/api/users/online'),
};

export const roomsApi = {
  getRooms: () => api.get<Room[]>('/api/rooms'),
  getRoom: (id: string) => api.get<Room>(`/api/rooms/${id}`),
  createRoom: (data: any) => api.post<Room>('/api/rooms', data),
  discoverRooms: () => api.get<Room[]>('/api/rooms/discover'),
  joinRoom: (id: string) => api.post(`/api/rooms/${id}/join`),
  leaveRoom: (id: string) => api.post(`/api/rooms/${id}/leave`),
};

export const messagesApi = {
  getRoomMessages: (roomId: string, page = 1, pageSize = 20) =>
    api.get<Message[]>(`/api/messages/room/${roomId}`, { params: { page, pageSize } }),
  editMessage: (id: string, content: string) =>
    api.put(`/api/messages/${id}`, { content }),
  deleteMessage: (id: string) => api.delete(`/api/messages/${id}`),
  searchMessages: (roomId: string, query: string) =>
    api.get<Message[]>(`/api/messages/room/${roomId}/search`, { params: { q: query } }),
};

export const uploadsApi = {
  uploadFile: (file: File, onUploadProgress?: (progressEvent: any) => void) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ url: string }>('/api/uploads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    });
  },
};

export default api;
