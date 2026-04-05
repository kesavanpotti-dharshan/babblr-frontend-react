import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Hash, Users, ChevronLeft, Info, Loader2, LogOut } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import { useChatStore } from '../store/useChatStore';
import { useRoomStore } from '../store/useRoomStore';
import { useRooms } from '../hooks/useRooms';
import { roomsApi, messagesApi } from '../services/api';
import { MessageItem } from '../components/MessageItem';
import { TypingIndicator } from '../components/TypingIndicator';
import { cn } from '../lib/utils';

export const ChatRoomPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const { currentRoom, setCurrentRoom } = useRoomStore();
  const { messages: allMessages, typingUsers: allTypingUsers } = useChatStore();
  const { sendMessage, startTyping, stopTyping } = useChat(id);
  const { leaveRoom } = useRooms();
  
  const messages = allMessages[id!] || [];
  const typingUsers = allTypingUsers[id!] || [];
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typingUsers]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await sendMessage(message);
      setMessage('');
      stopTyping();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTyping = () => {
    startTyping();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 2000);
  };

  const handleLeave = async () => {
    if (!id || !window.confirm('Are you sure you want to leave this room?')) return;
    setIsLeaving(true);
    try {
      await leaveRoom(id);
      navigate('/');
    } catch (err) {
      console.error(err);
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
    <div className="flex-1 flex flex-col h-full bg-[#0f172a] relative">
      <header className="h-16 border-b border-slate-700/50 bg-[#1e293b]/50 backdrop-blur-md flex items-center justify-between px-4 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors md:hidden"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Hash size={20} />
            </div>
            <div>
              <h2 className="text-white font-bold leading-tight">{currentRoom?.name}</h2>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <Users size={10} />
                  {currentRoom?.memberCount} members
                </span>
                <span>•</span>
                <span className="text-emerald-500">Active</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleLeave}
            disabled={isLeaving}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-rose-400 hover:bg-rose-400/10 rounded-lg transition-all border border-rose-400/20"
          >
            {isLeaving ? <Loader2 className="animate-spin" size={14} /> : <LogOut size={14} />}
            Leave Room
          </button>
          <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors">
            <Info size={20} />
          </button>
        </div>
      </header>

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
          <MessageItem key={msg.messageId} message={msg} roomId={id!} />
        ))}
        <div className="h-4" />
      </div>

      <div className="p-4 bg-[#0f172a]">
        <TypingIndicator typingUsers={typingUsers} />
        <form onSubmit={handleSend} className="relative mt-2">
          <input
            type="text"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            placeholder={`Message #${currentRoom?.name}`}
            className="w-full bg-[#1e293b] border border-slate-700 rounded-2xl pl-4 pr-14 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-xl"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-lg shadow-indigo-500/20"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};
