import { useEffect } from 'react';
import { useChatStore } from '../store/useChatStore';
import { signalRService } from '../services/signalr';
import { authApi } from '../services/api';

export const usePresence = () => {
  const { onlineUsers, setOnlineUsers, addUserOnline, removeUserOffline } = useChatStore();

  useEffect(() => {
    const fetchInitialPresence = async () => {
      try {
        const res = await authApi.getOnlineUsers();
        setOnlineUsers(res.data.onlineUserIds);
      } catch (err) {
        console.error('Failed to fetch initial presence', err);
      }
    };

    // Only fetch if we don't have any online users yet (optional optimization)
    // if (onlineUsers.size === 0) {
    fetchInitialPresence();
    // }

    const handleUserOnline = (userId: string) => {
      console.log('SignalR: User Online', userId);
      addUserOnline(userId);
    };

    const handleUserOffline = (userId: string) => {
      console.log('SignalR: User Offline', userId);
      removeUserOffline(userId);
    };

    // Listen for SignalR events
    signalRService.on('UserOnline', handleUserOnline);
    signalRService.on('UserOffline', handleUserOffline);

    return () => {
      signalRService.off('UserOnline', handleUserOnline);
      signalRService.off('UserOffline', handleUserOffline);
    };
  }, [setOnlineUsers, addUserOnline, removeUserOffline]);

  const isUserOnline = (userId: string) => onlineUsers.has(userId);

  return {
    onlineUserIds: Array.from(onlineUsers),
    isUserOnline,
    onlineCount: onlineUsers.size
  };
};
