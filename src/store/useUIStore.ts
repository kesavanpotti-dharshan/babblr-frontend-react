import { create } from 'zustand';

interface UIState {
  isSidebarOpen: boolean;
  isCreateRoomModalOpen: boolean;
  isDiscoverRoomsModalOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  openSidebar: () => void;
  setCreateRoomModalOpen: (open: boolean) => void;
  setDiscoverRoomsModalOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: false,
  isCreateRoomModalOpen: false,
  isDiscoverRoomsModalOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),
  openSidebar: () => set({ isSidebarOpen: true }),
  setCreateRoomModalOpen: (open) => set({ isCreateRoomModalOpen: open }),
  setDiscoverRoomsModalOpen: (open) => set({ isDiscoverRoomsModalOpen: open }),
}));
