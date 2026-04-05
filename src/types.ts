export interface User {
  userId: string;
  displayName: string;
  email: string;
  token?: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  displayName: string;
  email: string;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  isPrivate: boolean;
  memberCount: number;
}

export interface Message {
  messageId: string;
  content: string;
  senderId: string;
  senderName: string;
  roomId: string;
  sentAt: string;
  editedAt?: string;
  isDeleted: boolean;
}

export interface OnlineUsersResponse {
  onlineUsers: string[];
  count: number;
}

export interface TypingIndicator {
  userId: string;
  roomId: string;
  displayName: string;
}
