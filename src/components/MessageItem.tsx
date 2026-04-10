import React, { useState } from 'react';
import { format } from 'date-fns';
import { MoreVertical, Edit2, Trash2, Check, X, FileText, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { Message } from '../types';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import { usePresence } from '../hooks/usePresence';
import { messagesApi } from '../services/api';
import { cn } from '../lib/utils';
import { Avatar } from './Avatar';
import { ConfirmModal } from './ConfirmModal';

interface Props {
  message: Message;
  roomId: string;
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
}

const USER_COLORS = [
  'text-violet-400',
  'text-blue-400',
  'text-emerald-400',
  'text-amber-400',
  'text-rose-400',
  'text-cyan-400',
];

const getUserColor = (userId: string) => {
  if (!userId) return USER_COLORS[0];
  const index = (userId.charCodeAt(0) || 0) % USER_COLORS.length;
  return USER_COLORS[index];
};

export const MessageItem: React.FC<Props> = ({ 
  message, 
  roomId, 
  isFirstInGroup = true,
  isLastInGroup = true
}) => {
  const currentUser = useAuthStore((state) => state.user);
  const isOwn = message.senderId === currentUser?.userId;
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { isUserOnline } = usePresence();
  const isOnline = isUserOnline(message.senderId);

  const { updateMessage, deleteMessage: localDeleteMessage } = useChatStore();

  const handleEdit = async () => {
    if (!editContent.trim() || editContent === message.content) {
      setIsEditing(false);
      return;
    }
    try {
      const response = await messagesApi.editMessage(message.messageId, editContent);
      const updatedMessage = response.data as any;
      updateMessage(roomId, message.messageId, editContent, updatedMessage.editedAt || new Date().toISOString());
      setIsEditing(false);
    } catch (err: any) {
      console.error('Failed to edit message:', err.userMessage || err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await messagesApi.deleteMessage(message.messageId);
      localDeleteMessage(roomId, message.messageId);
    } catch (err: any) {
      console.error('Failed to delete message:', err.userMessage || err.message);
    }
  };

  const renderMessageContent = () => {
    if (isEditing) {
      return (
        <div className="flex flex-col gap-2 min-w-[220px]">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="bg-gray-50 dark:bg-[#0f172a]/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 w-full resize-none min-h-[80px] transition-colors duration-200"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button 
              onClick={() => setIsEditing(false)} 
              className="px-3 py-1.5 hover:bg-gray-200 dark:hover:bg-white/5 rounded-lg text-gray-500 dark:text-slate-400 text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleEdit} 
              className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 rounded-lg text-white text-xs font-bold transition-all shadow-lg shadow-violet-500/20"
            >
              Save Changes
            </button>
          </div>
        </div>
      );
    }

    const fileMatch = message.content.match(/^\[File\] (.*) — (.*)$/);
    if (fileMatch) {
      const fileName = fileMatch[1];
      const fileUrl = fileMatch[2];
      const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);

      return (
        <div className="space-y-2">
          {isImage ? (
            <div className="relative group/img max-w-sm rounded-xl overflow-hidden border border-white/5 shadow-2xl">
              <img 
                src={fileUrl} 
                alt={fileName} 
                className="w-full h-auto max-h-80 object-cover hover:scale-[1.02] transition-transform duration-500" 
                referrerPolicy="no-referrer"
              />
              <a 
                href={fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity"
              >
                <ExternalLink className="text-white" size={24} />
              </a>
            </div>
          ) : (
            <a 
              href={fileUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className={cn(
                "flex items-center gap-3 p-3 border rounded-xl transition-all group/file",
                isOwn 
                  ? "bg-white/10 hover:bg-white/20 border-white/10" 
                  : "bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10"
              )}
            >
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400 group-hover/file:bg-violet-500 group-hover/file:text-white transition-all">
                <FileText size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-bold truncate", isOwn ? "text-white" : "text-gray-900 dark:text-slate-200")}>{fileName}</p>
                <p className="text-[10px] text-gray-500 dark:text-white/40 uppercase tracking-widest font-bold">Attachment</p>
              </div>
              <ExternalLink size={16} className="text-gray-400 dark:text-white/20 group-hover/file:text-violet-600 dark:group-hover/file:text-violet-400" />
            </a>
          )}
        </div>
      );
    }

    return (
      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words text-gray-900 dark:text-white/90 transition-colors duration-200">
        {message.content}
      </p>
    );
  };

  if (message.isDeleted) {
    return (
      <div className={cn("flex mb-2 items-end gap-3", isOwn ? "flex-row-reverse" : "flex-row")}>
        <div className="w-9 h-9 flex-shrink-0" />
        <div className="max-w-[75%] px-4 py-2.5 text-gray-400 dark:text-white/30 italic text-sm transition-colors duration-200">
          This message was deleted
        </div>
      </div>
    );
  }

  const displayName = message.senderDisplayName || message.senderName;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex group items-start gap-3",
        isOwn ? "flex-row-reverse" : "flex-row",
        isFirstInGroup ? "mt-4" : "mt-0.5"
      )}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 w-9 relative">
        {isFirstInGroup ? (
          <>
            <Avatar 
              displayName={displayName}
              senderId={message.senderId}
              className="w-9 h-9 text-sm group-hover:scale-110 transition-transform"
            />
            <div className={cn(
              "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-gray-50 dark:ring-[#0f172a] z-10 transition-all duration-200",
              isOnline ? "bg-emerald-500 dark:bg-emerald-400 ring-emerald-500/30 dark:ring-emerald-400/30" : "bg-gray-300 dark:bg-white/20"
            )} />
          </>
        ) : (
          <div className="w-9 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center pt-2">
            <span className="text-[9px] text-slate-500 font-bold">
              {format(new Date(message.sentAt), 'HH:mm')}
            </span>
          </div>
        )}
      </div>

      <div className={cn("flex flex-col max-w-[75%]", isOwn ? "items-end" : "items-start")}>
        {isFirstInGroup && !isOwn && (
          <div className="flex items-center gap-2 mb-1 ml-1">
            <span className={cn("text-xs font-bold tracking-wide", getUserColor(message.senderId))}>
              {displayName}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              {format(new Date(message.sentAt), 'h:mm a')}
            </span>
          </div>
        )}
        
        <div className={cn("flex items-center gap-2 group/bubble", isOwn ? "flex-row-reverse" : "flex-row")}>
          <div
            className={cn(
              "px-4 py-2.5 rounded-2xl shadow-sm dark:shadow-md relative transition-all duration-200",
              isOwn 
                ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white" 
                : "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white/90 border border-gray-200 dark:border-white/5",
              isOwn && isFirstInGroup && "rounded-tr-sm",
              isOwn && !isFirstInGroup && !isLastInGroup && "rounded-r-md",
              isOwn && isLastInGroup && !isFirstInGroup && "rounded-br-sm",
              !isOwn && isFirstInGroup && "rounded-tl-sm",
              !isOwn && !isFirstInGroup && !isLastInGroup && "rounded-l-md",
              !isOwn && isLastInGroup && !isFirstInGroup && "rounded-bl-sm"
            )}
          >
            {renderMessageContent()}
          </div>

          <div className={cn(
            "flex items-center gap-2 opacity-0 group-hover/bubble:opacity-100 transition-opacity duration-150",
            isOwn ? "flex-row-reverse" : "flex-row"
          )}>
            {(isOwn || !isFirstInGroup) && (
              <span className="text-[10px] text-gray-400 dark:text-white/30 font-bold whitespace-nowrap transition-colors duration-200">
                {format(new Date(message.sentAt), 'h:mm a')}
                {message.editedAt && <span className="ml-1 uppercase tracking-tighter">edited</span>}
              </span>
            )}

            {isOwn && !isEditing && (
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full text-gray-400 dark:text-white/20 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                  title="Edit message"
                >
                  <Edit2 size={12} />
                </button>
                <button 
                  onClick={() => setIsDeleteModalOpen(true)} 
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full text-gray-400 dark:text-white/20 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                  title="Delete message"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}
          </div>
        </div>

        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
          title="Delete Message"
          message="Are you sure you want to delete this message? This action cannot be undone."
          confirmText="Delete"
          variant="danger"
        />
      </div>
    </motion.div>
  );
};
