import React, { useState } from 'react';
import { format } from 'date-fns';
import { MoreVertical, Edit2, Trash2, Check, X } from 'lucide-react';
import { motion } from 'motion/react';
import { Message } from '../types';
import { useAuthStore } from '../store/useAuthStore';
import { messagesApi } from '../services/api';
import { cn } from '../lib/utils';

interface Props {
  message: Message;
  roomId: string;
}

export const MessageItem: React.FC<Props> = ({ message, roomId }) => {
  const currentUser = useAuthStore((state) => state.user);
  const isOwn = message.senderId === currentUser?.userId;
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showMenu, setShowMenu] = useState(false);

  const handleEdit = async () => {
    if (!editContent.trim() || editContent === message.content) {
      setIsEditing(false);
      return;
    }
    try {
      await messagesApi.editMessage(message.messageId, editContent);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      await messagesApi.deleteMessage(message.messageId);
    } catch (err) {
      console.error(err);
    }
  };

  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.senderId}`;

  if (message.isDeleted) {
    return (
      <div className={cn("flex mb-4 items-end gap-2", isOwn ? "flex-row-reverse" : "flex-row")}>
        <div className="w-8 h-8 rounded-full bg-slate-800 flex-shrink-0" />
        <div className="max-w-[70%] px-4 py-2 rounded-2xl bg-slate-800/30 border border-slate-700/50 text-slate-500 italic text-xs">
          This message was deleted
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn("flex mb-6 group items-end gap-3", isOwn ? "flex-row-reverse" : "flex-row")}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 mb-1">
        <div className={cn(
          "w-9 h-9 rounded-full border-2 overflow-hidden bg-slate-800 shadow-lg transition-transform group-hover:scale-110",
          isOwn ? "border-indigo-500/30" : "border-slate-700"
        )}>
          <img 
            src={avatarUrl} 
            alt={message.senderName} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      <div className={cn("flex flex-col max-w-[75%]", isOwn ? "items-end" : "items-start")}>
        {!isOwn && (
          <span className="text-[11px] font-bold text-slate-400 mb-1.5 ml-1 tracking-wide uppercase">
            {message.senderName}
          </span>
        )}
        
        <div className={cn("flex items-center gap-2 group/bubble", isOwn ? "flex-row-reverse" : "flex-row")}>
          <div
            className={cn(
              "px-4 py-2.5 rounded-2xl shadow-md relative transition-all duration-200",
              isOwn 
                ? "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-br-none hover:shadow-indigo-500/20" 
                : "bg-[#1e293b] text-slate-200 rounded-bl-none border border-slate-700/50 hover:border-slate-600"
            )}
          >
            {isEditing ? (
              <div className="flex flex-col gap-2 min-w-[220px]">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="bg-slate-900/50 text-white border border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-full resize-none min-h-[80px]"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => setIsEditing(false)} 
                    className="px-3 py-1.5 hover:bg-slate-700 rounded-lg text-slate-400 text-xs font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleEdit} 
                    className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-400 rounded-lg text-white text-xs font-medium transition-all shadow-lg shadow-indigo-500/20"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words font-medium">
                {message.content}
              </p>
            )}
          </div>

          {isOwn && !isEditing && (
            <div className="opacity-0 group-hover/bubble:opacity-100 transition-all duration-200 flex items-center gap-1 translate-x-2 group-hover/bubble:translate-x-0">
              <button 
                onClick={() => setIsEditing(true)} 
                className="p-2 hover:bg-slate-800 rounded-full text-slate-500 hover:text-indigo-400 transition-colors"
                title="Edit message"
              >
                <Edit2 size={14} />
              </button>
              <button 
                onClick={handleDelete} 
                className="p-2 hover:bg-slate-800 rounded-full text-slate-500 hover:text-rose-400 transition-colors"
                title="Delete message"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>

        <div className={cn("flex items-center gap-2 mt-1.5 px-1", isOwn ? "flex-row-reverse" : "flex-row")}>
          <span className="text-[10px] text-slate-500 font-medium">
            {format(new Date(message.sentAt), 'h:mm a')}
          </span>
          {message.editedAt && (
            <span className="text-[10px] text-slate-600 italic font-medium">Edited</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
