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

export const ChatRoomPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
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
        useChatStore.getState().setMessages(id, messagesRes.data.reverse());
        setPage(1);
        setHasMore(messagesRes.data.length === 20);
      } catch (err) {
        console.error(err);
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
    } catch (err) {
      console.error(err);
      showToast('Failed to upload file.', 'error');
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
    } catch (err) {
      console.error(err);
      showToast('Failed to leave room.', 'error');
    } finally {
      setIsLeaving(false);
    }
  };

  const loadMore = async () => {
    if (!id || !hasMore) return;
    const nextPage = page + 1;
    try {
      const res = await messagesApi.getRoomMessages(id, nextPage, 20);
      if (res.data.length < 20) setHasMore(false);
      useChatStore.getState().setMessages(id, [...res.data.reverse(), ...messages]);
      setPage(nextPage);
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0f172a]">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0f172a] relative overflow-hidden">
      <header className="h-16 border-b border-slate-700/50 bg-[#1e293b]/50 backdrop-blur-md flex items-center justify-between px-4 z-20">
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={openSidebar}
            className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors lg:hidden"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Hash size={18} className="md:size-20" />
            </div>
            <div className="min-w-0">
              <h2 className="text-white font-bold leading-tight truncate text-sm md:text-base">{currentRoom?.name}</h2>
              <div className="flex items-center gap-2 text-[9px] md:text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <Users size={10} />
                  {currentRoom?.memberCount} members
                </span>
                <span className="hidden xs:inline">•</span>
                <span className="flex items-center gap-1 text-emerald-500">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  {onlineCount} online
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 md:gap-2">
          <button 
            onClick={() => setIsSearching(!isSearching)}
            className={cn(
              "p-2 rounded-lg transition-all",
              isSearching ? "bg-indigo-500 text-white" : "text-slate-400 hover:bg-slate-700"
            )}
          >
            <Search size={18} />
          </button>
          <button 
            onClick={() => setIsLeaveModalOpen(true)}
            disabled={isLeaving}
            className="flex items-center gap-2 px-2 md:px-3 py-1.5 text-[10px] md:text-xs font-bold text-rose-400 hover:bg-rose-400/10 rounded-lg transition-all border border-rose-400/20"
          >
            {isLeaving ? <Loader2 className="animate-spin" size={12} /> : <LogOut size={12} />}
            <span className="hidden sm:inline">Leave Room</span>
          </button>
        </div>
      </header>

      {/* Search Bar */}
      {isSearching && (
        <div className="absolute top-16 left-0 right-0 bg-[#1e293b] border-b border-slate-700 z-30 p-4 shadow-2xl animate-in slide-in-from-top duration-200">
          <div className="max-w-3xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages..."
              autoFocus
              className="w-full bg-[#0f172a] border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              onKeyDown={(e) => e.key === 'Escape' && setIsSearching(false)}
            />
            <button 
              onClick={() => setIsSearching(false)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
          
          {searchQuery && (
            <div className="max-w-3xl mx-auto mt-4 max-h-[40vh] overflow-y-auto custom-scrollbar bg-[#0f172a] rounded-xl border border-slate-700 divide-y divide-slate-800">
              {isSearchLoading ? (
                <div className="p-8 flex justify-center">
                  <Loader2 className="animate-spin text-indigo-500" size={24} />
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((res) => (
                  <button
                    key={res.messageId}
                    onClick={() => scrollToMessage(res.messageId)}
                    className="w-full p-4 text-left hover:bg-slate-800/50 transition-colors flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-400">{res.senderName}</span>
                      <span className="text-[10px] text-slate-500">{new Date(res.sentAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-slate-300 line-clamp-2">{res.content}</p>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No messages found for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar scroll-smooth"
      >
        {hasMore && (
          <div className="flex justify-center py-4">
            <button
              onClick={loadMore}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/5 px-4 py-2 rounded-full border border-indigo-500/20 transition-all"
            >
              Load previous messages
            </button>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.messageId} id={`message-${msg.messageId}`}>
            <MessageItem message={msg} roomId={id!} />
          </div>
        ))}
        <div className="h-4" />
      </div>

      <div className="p-4 bg-[#0f172a]">
        <TypingIndicator typingUsers={typingUsers} />
        
        {isUploading && (
          <div className="mb-2 px-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Uploading file...</span>
              <span className="text-[10px] font-bold text-indigo-400">{uploadProgress}%</span>
            </div>
            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <form onSubmit={handleSend} className="relative mt-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,application/pdf"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-indigo-400 transition-colors disabled:opacity-50"
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
            className="w-full bg-[#1e293b] border border-slate-700 rounded-2xl pl-12 pr-14 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-xl"
          />
          <button
            type="submit"
            disabled={!message.trim() || isUploading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-lg shadow-indigo-500/20"
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
