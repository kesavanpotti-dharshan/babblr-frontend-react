import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setAuth = useAuthStore((state) => state.setAuth);
  const logoutStore = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const login = async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.login(data);
      setAuth(response.data, response.data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.userMessage || err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.register(data);
      setAuth(response.data, response.data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.userMessage || err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    logoutStore();
    navigate('/login');
  };

  return { login, register, logout, isLoading, error };
};
