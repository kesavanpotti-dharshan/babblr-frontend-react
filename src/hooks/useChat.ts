import { useEffect } from 'react';
import { signalRService } from '../services/signalr';
import { useChatStore } from '../store/useChatStore';
import { useRoomStore } from '../store/useRoomStore';
import { Message } from '../types';

export const useChat = (roomId?: string) => {
  const {
    addMessage,
    updateMessage,
    deleteMessage,
    setUserTyping,
    removeUserTyping,
    addUserOnline,
    removeUserOffline,
  } = useChatStore();
  const { updateRoomMemberCount } = useRoomStore();

  useEffect(() => {
    if (!roomId) return;

    const handleReceiveMessage = (message: Message) => {
      addMessage(message.roomId, message);
    };

    const handleMessageEdited = ({ messageId, newContent, editedAt, roomId: msgRoomId }: any) => {
      updateMessage(msgRoomId, messageId, newContent, editedAt);
    };

    const handleMessageDeleted = ({ messageId, roomId: msgRoomId }: any) => {
      deleteMessage(msgRoomId, messageId);
    };

    const handleUserJoined = ({ roomId: joinedRoomId }: any) => {
      updateRoomMemberCount(joinedRoomId, 1);
    };

    const handleUserLeft = ({ roomId: leftRoomId }: any) => {
      updateRoomMemberCount(leftRoomId, -1);
    };

    const handleUserOnline = (userId: string) => {
      addUserOnline(userId);
    };

    const handleUserOffline = (userId: string) => {
      removeUserOffline(userId);
    };

    const handleUserTyping = ({ userId, roomId: typingRoomId, displayName }: any) => {
      setUserTyping(typingRoomId, userId, displayName);
    };

    const handleUserStoppedTyping = ({ userId, roomId: typingRoomId }: any) => {
      removeUserTyping(typingRoomId, userId);
    };

    signalRService.invoke('JoinRoom', roomId);

    signalRService.on('ReceiveMessage', handleReceiveMessage);
    signalRService.on('MessageEdited', handleMessageEdited);
    signalRService.on('MessageDeleted', handleMessageDeleted);
    signalRService.on('UserJoined', handleUserJoined);
    signalRService.on('UserLeft', handleUserLeft);
    signalRService.on('UserOnline', handleUserOnline);
    signalRService.on('UserOffline', handleUserOffline);
    signalRService.on('UserTyping', handleUserTyping);
    signalRService.on('UserStoppedTyping', handleUserStoppedTyping);

    return () => {
      signalRService.invoke('LeaveRoom', roomId);
      signalRService.off('ReceiveMessage', handleReceiveMessage);
      signalRService.off('MessageEdited', handleMessageEdited);
      signalRService.off('MessageDeleted', handleMessageDeleted);
      signalRService.off('UserJoined', handleUserJoined);
      signalRService.off('UserLeft', handleUserLeft);
      signalRService.off('UserOnline', handleUserOnline);
      signalRService.off('UserOffline', handleUserOffline);
      signalRService.off('UserTyping', handleUserTyping);
      signalRService.off('UserStoppedTyping', handleUserStoppedTyping);
    };
  }, [roomId, addMessage, updateMessage, deleteMessage, updateRoomMemberCount, addUserOnline, removeUserOffline, setUserTyping, removeUserTyping]);

  const sendMessage = async (content: string) => {
    if (!roomId) return;
    await signalRService.invoke('SendMessage', { roomId, content });
  };

  const startTyping = () => {
    if (!roomId) return;
    signalRService.invoke('TypingStarted', roomId);
  };

  const stopTyping = () => {
    if (!roomId) return;
    signalRService.invoke('TypingStopped', roomId);
  };

  return { sendMessage, startTyping, stopTyping };
};
