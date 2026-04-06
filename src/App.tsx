import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { RoomListPage } from './pages/RoomListPage';
import { ChatRoomPage } from './pages/ChatRoomPage';
import { ProtectedLayout } from './components/ProtectedLayout';
import { useAuthStore } from './store/useAuthStore';

export default function App() {
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    const savedTheme = localStorage.getItem('babblr-theme') || 'dark';
    const root = window.document.documentElement;
    if (savedTheme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }

    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth-unauthorized', handleUnauthorized);
  }, [logout]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<RoomListPage />} />
          <Route path="/rooms/:id" element={<ChatRoomPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
