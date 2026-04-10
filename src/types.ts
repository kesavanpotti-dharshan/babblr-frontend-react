export interface User {
  userId: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  token?: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
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
  senderDisplayName?: string;
  senderAvatarUrl?: string;
  roomId: string;
  sentAt: string;
  editedAt?: string;
  isEdited?: boolean;
  isDeleted: boolean;
}

export interface OnlineUsersResponse {
  onlineUserIds: string[];
  count: number;
}

export interface TypingIndicator {
  userId: string;
  roomId: string;
  displayName: string;
}

export interface Pagination {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasMore: boolean;
}

export interface PaginatedMessages {
  messages: Message[];
  pagination: Pagination;
}
