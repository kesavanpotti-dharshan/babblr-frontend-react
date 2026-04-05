import { useEffect } from 'react';
import { roomsApi, authApi } from '../services/api';
import { useRoomStore } from '../store/useRoomStore';
import { useChatStore } from '../store/useChatStore';
import { signalRService } from '../services/signalr';

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
      // Join the SignalR hub for the new room
      await signalRService.invoke('JoinRoom', response.data.id);
      return response.data;
    } catch (err) {
      console.error('Failed to create room', err);
      throw err;
    }
  };

  const discoverRooms = async () => {
    try {
      const response = await roomsApi.discoverRooms();
      return response.data;
    } catch (err) {
      console.error('Failed to discover rooms', err);
      throw err;
    }
  };

  const joinRoom = async (roomId: string) => {
    try {
      await roomsApi.joinRoom(roomId);
      await fetchRooms(); // Refresh the list of joined rooms
      // Join the SignalR hub for the joined room
      await signalRService.invoke('JoinRoom', roomId);
    } catch (err) {
      console.error('Failed to join room', err);
      throw err;
    }
  };

  const leaveRoom = async (roomId: string) => {
    try {
      await roomsApi.leaveRoom(roomId);
      await fetchRooms(); // Refresh the list of joined rooms
      // Leave the SignalR hub for the left room
      await signalRService.invoke('LeaveRoom', roomId);
    } catch (err) {
      console.error('Failed to leave room', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  return { rooms, fetchRooms, createRoom, discoverRooms, joinRoom, leaveRoom };
};
