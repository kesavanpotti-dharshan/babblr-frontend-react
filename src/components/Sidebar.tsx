import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Hash, Plus, LogOut, Users } from 'lucide-react';
import { useRoomStore } from '../store/useRoomStore';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import { CreateRoomModal } from './CreateRoomModal';
import { cn } from '../lib/utils';

export const Sidebar: React.FC = () => {
  const { rooms } = useRoomStore();
  const { user, logout } = useAuthStore();
  const { onlineUsers } = useChatStore();
  const { id: currentRoomId } = useParams();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="w-64 bg-[#1e293b] flex flex-col border-r border-slate-700/50">
      <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white tracking-tight">Babblr</h1>
        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span>{onlineUsers.size} online</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        <div className="px-2 py-2 flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <span>Rooms</span>
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-1 hover:bg-slate-700 rounded-md transition-colors text-slate-300"
          >
            <Plus size={16} />
          </button>
        </div>

        {rooms.map((room) => (
          <button
            key={room.id}
            onClick={() => navigate(`/rooms/${room.id}`)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all group",
              currentRoomId === room.id
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                : "text-slate-400 hover:bg-slate-700/50 hover:text-slate-200"
            )}
          >
            <Hash size={18} className={currentRoomId === room.id ? "text-indigo-200" : "text-slate-500"} />
            <span className="flex-1 text-left truncate font-medium">{room.name}</span>
            <span className="text-xs opacity-60 flex items-center gap-1">
              <Users size={12} />
              {room.memberCount}
            </span>
          </button>
        ))}
      </div>

      <div className="p-4 bg-[#1a2233] border-t border-slate-700/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold shadow-inner">
            {user?.displayName?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.displayName}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-all"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>

      <CreateRoomModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
