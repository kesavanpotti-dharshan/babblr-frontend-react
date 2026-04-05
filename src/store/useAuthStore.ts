import { create } from 'zustand';
import { User } from '../types';
import { setAuthToken } from '../services/api';
import { signalRService } from '../services/signalr';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  setAuth: (user, token) => {
    setAuthToken(token);
    set({ user, token, isAuthenticated: true });
    signalRService.startConnection(token);
  },
  logout: () => {
    setAuthToken(null);
    set({ user: null, token: null, isAuthenticated: false });
    signalRService.stopConnection();
  },
}));
