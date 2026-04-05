import { create } from 'zustand';
import { Room } from '../types';

interface RoomState {
  rooms: Room[];
  currentRoom: Room | null;
  isLoading: boolean;
  setRooms: (rooms: Room[]) => void;
  setCurrentRoom: (room: Room | null) => void;
  addRoom: (room: Room) => void;
  updateRoomMemberCount: (roomId: string, delta: number) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  rooms: [],
  currentRoom: null,
  isLoading: false,
  setRooms: (rooms) => set({ rooms }),
  setCurrentRoom: (room) => set({ currentRoom: room }),
  addRoom: (room) => set((state) => ({ rooms: [...state.rooms, room] })),
  updateRoomMemberCount: (roomId, delta) =>
    set((state) => ({
      rooms: state.rooms.map((r) =>
        r.id === roomId ? { ...r, memberCount: Math.max(0, r.memberCount + delta) } : r
      ),
      currentRoom:
        state.currentRoom?.id === roomId
          ? { ...state.currentRoom, memberCount: Math.max(0, state.currentRoom.memberCount + delta) }
          : state.currentRoom,
    })),
  setLoading: (isLoading) => set({ isLoading }),
}));
