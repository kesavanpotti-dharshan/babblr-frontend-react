import { create } from 'zustand';
import { Message, TypingIndicator } from '../types';

interface ChatState {
  messages: Record<string, Message[]>; // roomId -> messages
  typingUsers: Record<string, TypingIndicator[]>; // roomId -> typing users
  onlineUsers: Set<string>;
  addMessage: (roomId: string, message: Message) => void;
  setMessages: (roomId: string, messages: Message[]) => void;
  updateMessage: (roomId: string, messageId: string, content: string, editedAt: string) => void;
  deleteMessage: (roomId: string, messageId: string) => void;
  setUserTyping: (roomId: string, userId: string, displayName: string) => void;
  removeUserTyping: (roomId: string, userId: string) => void;
  setOnlineUsers: (userIds: string[]) => void;
  addUserOnline: (userId: string) => void;
  removeUserOffline: (userId: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: {},
  typingUsers: {},
  onlineUsers: new Set(),

  addMessage: (roomId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [roomId]: [...(state.messages[roomId] || []), message],
      },
    })),

  setMessages: (roomId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [roomId]: messages,
      },
    })),

  updateMessage: (roomId, messageId, content, editedAt) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [roomId]: (state.messages[roomId] || []).map((m) =>
          m.messageId === messageId ? { ...m, content, editedAt } : m
        ),
      },
    })),

  deleteMessage: (roomId, messageId) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [roomId]: (state.messages[roomId] || []).map((m) =>
          m.messageId === messageId ? { ...m, isDeleted: true, content: 'This message was deleted' } : m
        ),
      },
    })),

  setUserTyping: (roomId, userId, displayName) =>
    set((state) => {
      const currentTyping = state.typingUsers[roomId] || [];
      if (currentTyping.find((u) => u.userId === userId)) return state;
      return {
        typingUsers: {
          ...state.typingUsers,
          [roomId]: [...currentTyping, { userId, roomId, displayName }],
        },
      };
    }),

  removeUserTyping: (roomId, userId) =>
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [roomId]: (state.typingUsers[roomId] || []).filter((u) => u.userId !== userId),
      },
    })),

  setOnlineUsers: (userIds) => set({ onlineUsers: new Set(userIds) }),
  addUserOnline: (userId) =>
    set((state) => {
      const newSet = new Set(state.onlineUsers);
      newSet.add(userId);
      return { onlineUsers: newSet };
    }),
  removeUserOffline: (userId) =>
    set((state) => {
      const newSet = new Set(state.onlineUsers);
      newSet.delete(userId);
      return { onlineUsers: newSet };
    }),
}));
