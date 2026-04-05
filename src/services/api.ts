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

// Interceptor for 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('auth-unauthorized'));
    }
    return Promise.reject(error);
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
  getOnlineUsers: () => api.get<OnlineUsersResponse>('/api/users/online'),
};

export const roomsApi = {
  getRooms: () => api.get<Room[]>('/api/rooms'),
  getRoom: (id: string) => api.get<Room>(`/api/rooms/${id}`),
  createRoom: (data: any) => api.post<Room>('/api/rooms', data),
};

export const messagesApi = {
  getRoomMessages: (roomId: string, page = 1, pageSize = 20) =>
    api.get<Message[]>(`/api/messages/room/${roomId}`, { params: { page, pageSize } }),
  editMessage: (id: string, content: string) =>
    api.put(`/api/messages/${id}`, { content }),
  deleteMessage: (id: string) => api.delete(`/api/messages/${id}`),
};

export default api;
