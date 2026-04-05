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

    signalRService.invoke('JoinRoom', roomId);

    signalRService.on('ReceiveMessage', (message: Message) => {
      addMessage(message.roomId, message);
    });

    signalRService.on('MessageEdited', ({ messageId, newContent, editedAt, roomId: msgRoomId }) => {
      updateMessage(msgRoomId, messageId, newContent, editedAt);
    });

    signalRService.on('MessageDeleted', ({ messageId, roomId: msgRoomId }) => {
      deleteMessage(msgRoomId, messageId);
    });

    signalRService.on('UserJoined', ({ roomId: joinedRoomId }) => {
      updateRoomMemberCount(joinedRoomId, 1);
    });

    signalRService.on('UserLeft', ({ roomId: leftRoomId }) => {
      updateRoomMemberCount(leftRoomId, -1);
    });

    signalRService.on('UserOnline', (userId: string) => {
      addUserOnline(userId);
    });

    signalRService.on('UserOffline', (userId: string) => {
      removeUserOffline(userId);
    });

    signalRService.on('UserTyping', ({ userId, roomId: typingRoomId, displayName }) => {
      setUserTyping(typingRoomId, userId, displayName);
    });

    signalRService.on('UserStoppedTyping', ({ userId, roomId: typingRoomId }) => {
      removeUserTyping(typingRoomId, userId);
    });

    return () => {
      signalRService.invoke('LeaveRoom', roomId);
      signalRService.off('ReceiveMessage');
      signalRService.off('MessageEdited');
      signalRService.off('MessageDeleted');
      signalRService.off('UserJoined');
      signalRService.off('UserLeft');
      signalRService.off('UserOnline');
      signalRService.off('UserOffline');
      signalRService.off('UserTyping');
      signalRService.off('UserStoppedTyping');
    };
  }, [roomId]);

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
