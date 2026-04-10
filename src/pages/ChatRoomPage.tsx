import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Hash, Users, ChevronLeft, Info, Loader2, LogOut, Menu, Search, X, Paperclip } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import { useChatStore } from '../store/useChatStore';
import { useRoomStore } from '../store/useRoomStore';
import { useRooms } from '../hooks/useRooms';
import { useUIStore } from '../store/useUIStore';
import { usePresence } from '../hooks/usePresence';
import { roomsApi, messagesApi, authApi, uploadsApi } from '../services/api';
import { MessageItem } from '../components/MessageItem';
import { TypingIndicator } from '../components/TypingIndicator';
import { cn } from '../lib/utils';
import { Message } from '../types';
import { ConfirmModal } from '../components/ConfirmModal';
import { Toast, ToastType } from '../components/Toast';

import { ThemeToggle } from '../components/ThemeToggle';

export const ChatRoomPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Toast state
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false
  });

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type, isVisible: true });
  };
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { currentRoom, setCurrentRoom } = useRoomStore();
  const { messages: allMessages, typingUsers: allTypingUsers, setOnlineUsers } = useChatStore();
  const { onlineCount } = usePresence();
  const { sendMessage, startTyping, stopTyping } = useChat(id);
  const { leaveRoom } = useRooms();
  const { openSidebar } = useUIStore();
  
  const messages = allMessages[id!] || [];
  const typingUsers = allTypingUsers[id!] || [];
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    if (!id) return;

    const fetchRoomData = async () => {
      setIsLoading(true);
      try {
        const [roomRes, messagesRes] = await Promise.all([
          roomsApi.getRoom(id),
          messagesApi.getRoomMessages(id, 1, 20),
        ]);
        setCurrentRoom(roomRes.data);
        const data = messagesRes.data;
        useChatStore.getState().setMessages(id, data.messages.reverse());
        setPage(1);
        setHasMore(data.pagination.hasMore);
      } catch (err: any) {
        console.error(err);
        showToast(err.userMessage || 'Failed to load room data', 'error');
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoomData();
  }, [id]);

  useEffect(() => {
    if (scrollRef.current && !isSearching) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typingUsers, isSearching]);

  // Search logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    
    setIsSearchLoading(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await messagesApi.searchMessages(id!, searchQuery);
        setSearchResults(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearchLoading(false);
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery, id]);

  const scrollToMessage = (messageId: string) => {
    const element = document.getElementById(`message-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('ring-2', 'ring-indigo-500', 'ring-offset-2', 'ring-offset-[#0f172a]');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-indigo-500', 'ring-offset-2', 'ring-offset-[#0f172a]');
      }, 2000);
    }
    setIsSearching(false);
    setSearchQuery('');
  };

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      showToast('File is too large. Max size is 10MB.', 'error');
      return;
    }

    // Validate file type (images and PDFs)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Only images and PDFs are allowed.', 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const res = await uploadsApi.uploadFile(file, (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(progress);
      });

      const fileUrl = res.data.url;
      const messageContent = `[File] ${file.name} — ${fileUrl}`;
      await sendMessage(messageContent);
    } catch (err: any) {
      console.error(err);
      showToast(err.userMessage || 'Failed to upload file.', 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await sendMessage(message);
      setMessage('');
      stopTyping();
      isTypingRef.current = false;
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTyping = () => {
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      startTyping();
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
      isTypingRef.current = false;
    }, 2000);
  };

  const handleLeave = async () => {
    if (!id) return;
    setIsLeaving(true);
    try {
      await leaveRoom(id);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      showToast(err.userMessage || 'Failed to leave room.', 'error');
    } finally {
      setIsLeaving(false);
    }
  };

  const loadMore = async () => {
    if (!id || !hasMore || loadingMore) return;
    const nextPage = page + 1;
    setLoadingMore(true);

    const scrollContainer = scrollRef.current;
    const previousScrollHeight = scrollContainer?.scrollHeight || 0;

    try {
      const res = await messagesApi.getRoomMessages(id, nextPage, 20);
      const data = res.data;
      
      setHasMore(data.pagination.hasMore);
      useChatStore.getState().setMessages(id, [...data.messages.reverse(), ...messages]);
      setPage(nextPage);

      // Maintain scroll position
      setTimeout(() => {
        if (scrollContainer) {
          const newScrollHeight = scrollContainer.scrollHeight;
          scrollContainer.scrollTop = newScrollHeight - previousScrollHeight;
        }
      }, 0);
    } catch (err: any) {
      console.error(err);
      showToast(err.userMessage || 'Failed to load more messages', 'error');
    } finally {
      setLoadingMore(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-[#0f172a] transition-colors duration-200">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#0f172a] relative overflow-hidden transition-colors duration-200">
      <header className="h-14 border-b border-gray-200 dark:border-white/5 bg-white dark:bg-[#1e293b]/50 backdrop-blur-xl flex items-center justify-between px-4 z-20 shrink-0 transition-colors duration-200">
        <div className="flex items-center gap-3">
          <button
            onClick={openSidebar}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-500 dark:text-slate-400 transition-colors lg:hidden"
          >
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/10">
              <Hash size={16} />
            </div>
            <div className="min-w-0">
              <h2 className="text-gray-900 dark:text-white font-semibold leading-tight truncate text-sm transition-colors duration-200">{currentRoom?.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 rounded-full px-2 py-0.5 text-[10px] text-gray-500 dark:text-slate-400 font-bold transition-colors duration-200">
                  <Users size={10} />
                  {currentRoom?.memberCount}
                </span>
                <span className="flex items-center gap-1 bg-emerald-500/10 rounded-full px-2 py-0.5 text-[10px] text-emerald-600 dark:text-emerald-500 font-bold transition-colors duration-200">
                  <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                  {onlineCount} online
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button 
            onClick={() => setIsSearching(!isSearching)}
            className={cn(
              "p-2 rounded-lg transition-all",
              isSearching ? "bg-violet-500 text-white shadow-lg shadow-violet-500/20" : "text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/5"
            )}
            title="Search messages"
          >
            <Search size={18} />
          </button>
          <button 
            onClick={() => setIsLeaveModalOpen(true)}
            disabled={isLeaving}
            className="p-2 text-gray-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-400/10 rounded-lg transition-all group relative"
            title="Leave Room"
          >
            {isLeaving ? <Loader2 className="animate-spin" size={18} /> : <LogOut size={18} />}
          </button>
        </div>
      </header>

      {/* Search Bar */}
      {isSearching && (
        <div className="absolute top-14 left-0 right-0 bg-white/95 dark:bg-[#1e293b]/95 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 z-30 p-4 shadow-2xl animate-in slide-in-from-top duration-200 transition-colors duration-200">
          <div className="max-w-3xl mx-auto relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages..."
              autoFocus
              className="w-full bg-gray-50 dark:bg-[#0f172a]/50 border border-gray-200 dark:border-white/5 rounded-xl pl-11 pr-10 py-2.5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
              onKeyDown={(e) => e.key === 'Escape' && setIsSearching(false)}
            />
            <button 
              onClick={() => setIsSearching(false)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-900 dark:hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
          
          {searchQuery && (
            <div className="max-w-3xl mx-auto mt-4 max-h-[40vh] overflow-y-auto custom-scrollbar bg-gray-50 dark:bg-[#0f172a]/50 rounded-xl border border-gray-200 dark:border-white/5 divide-y divide-gray-200 dark:divide-white/5">
              {isSearchLoading ? (
                <div className="p-8 flex justify-center">
                  <Loader2 className="animate-spin text-violet-500" size={24} />
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((res) => (
                  <button
                    key={res.messageId}
                    onClick={() => scrollToMessage(res.messageId)}
                    className="w-full p-4 text-left hover:bg-gray-100 dark:hover:bg-white/5 transition-colors flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-violet-600 dark:text-violet-400">{res.senderDisplayName || res.senderName}</span>
                      <span className="text-[10px] text-gray-500 dark:text-slate-500 font-medium">{new Date(res.sentAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-slate-300 line-clamp-2 leading-relaxed">{res.content}</p>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500 dark:text-slate-500 text-sm font-medium">
                  No messages found for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar scroll-smooth relative"
      >
        {messages.length === 0 && !isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
            <div className="text-gray-900/5 dark:text-white/5 text-8xl font-bold mb-2">#</div>
            <div className="text-gray-900/10 dark:text-white/10 text-sm font-medium uppercase tracking-widest">
              Welcome to {currentRoom?.name}
            </div>
          </div>
        )}

        {hasMore ? (
          <div className="flex justify-center py-6">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="text-sm font-medium text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-full transition-all flex items-center gap-2"
            >
              {loadingMore ? <Loader2 size={14} className="animate-spin" /> : null}
              {loadingMore ? 'Loading...' : 'Load earlier messages'}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center py-10 opacity-20 select-none">
            <div className="h-px w-12 bg-gray-400 mb-4" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Beginning of conversation</span>
          </div>
        )}
        {messages.map((msg, index) => {
          const prevMsg = messages[index - 1];
          const nextMsg = messages[index + 1];
          
          const isFirstInGroup = !prevMsg || 
            prevMsg.senderId !== msg.senderId || 
            new Date(msg.sentAt).getTime() - new Date(prevMsg.sentAt).getTime() > 5 * 60 * 1000;
          
          const isLastInGroup = !nextMsg ||
            nextMsg.senderId !== msg.senderId ||
            new Date(nextMsg.sentAt).getTime() - new Date(msg.sentAt).getTime() > 5 * 60 * 1000;
          
          return (
            <div key={msg.messageId} id={`message-${msg.messageId}`}>
              <MessageItem 
                message={msg} 
                roomId={id!} 
                isFirstInGroup={isFirstInGroup} 
                isLastInGroup={isLastInGroup}
              />
            </div>
          );
        })}
        <div className="h-4" />
      </div>

      <div className="px-4 py-4 bg-white dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200 dark:border-white/10 transition-colors duration-200">
        <TypingIndicator typingUsers={typingUsers} />
        
        {isUploading && (
          <div className="mb-3 px-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-[0.2em]">Uploading file...</span>
              <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400">{uploadProgress}%</span>
            </div>
            <div className="h-1 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <form onSubmit={handleSend} className="relative flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,application/pdf"
          />
          <div className="relative flex-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 dark:text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors disabled:opacity-50"
            >
              <Paperclip size={20} />
            </button>
            <input
              type="text"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTyping();
              }}
              placeholder={`Message #${currentRoom?.name}`}
              className="w-full h-12 bg-gray-50 dark:bg-[#0f172a]/50 border border-gray-200 dark:border-white/5 rounded-2xl pl-12 pr-4 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={!message.trim() || isUploading}
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95",
              message.trim() && !isUploading
                ? "bg-gradient-to-r from-violet-600 to-indigo-500 text-white shadow-indigo-500/20"
                : "bg-gray-100 dark:bg-white/5 text-gray-300 dark:text-white/20 cursor-not-allowed"
            )}
          >
            <Send size={20} />
          </button>
        </form>
      </div>

      <ConfirmModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        onConfirm={handleLeave}
        title="Leave Room"
        message={`Are you sure you want to leave #${currentRoom?.name}? You will need to join again to see future messages.`}
        confirmText="Leave Room"
        variant="danger"
      />

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
};
