import { useEffect } from 'react';
import { roomsApi, authApi } from '../services/api';
import { useRoomStore } from '../store/useRoomStore';
import { useChatStore } from '../store/useChatStore';

export const useRooms = () => {
  const { rooms, setRooms, setLoading, addRoom } = useRoomStore();
  const { setOnlineUsers } = useChatStore();

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const [roomsRes, onlineRes] = await Promise.all([
        roomsApi.getRooms(),
        authApi.getOnlineUsers(),
      ]);
      setRooms(roomsRes.data);
      setOnlineUsers(onlineRes.data.onlineUsers);
    } catch (err) {
      console.error('Failed to fetch rooms', err);
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async (data: { name: string; description: string; isPrivate: boolean }) => {
    try {
      const response = await roomsApi.createRoom(data);
      addRoom(response.data);
      return response.data;
    } catch (err) {
      console.error('Failed to create room', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  return { rooms, fetchRooms, createRoom };
};
