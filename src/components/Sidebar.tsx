import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Hash, Plus, LogOut, Users, Search, X, Activity } from 'lucide-react';
import { useRoomStore } from '../store/useRoomStore';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import { usePresence } from '../hooks/usePresence';
import { CreateRoomModal } from './CreateRoomModal';
import { DiscoverRoomsModal } from './DiscoverRoomsModal';
import { cn } from '../lib/utils';

import { Avatar } from './Avatar';

export const Sidebar: React.FC = () => {
  const { rooms } = useRoomStore();
  const { user, logout } = useAuthStore();
  const { onlineCount } = usePresence();
  const { isSidebarOpen, closeSidebar, setCreateRoomModalOpen, setDiscoverRoomsModalOpen, setUserProfileModalOpen } = useUIStore();
  const { id: currentRoomId } = useParams();
  const navigate = useNavigate();

  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-50 w-[260px] bg-white dark:bg-[#1e293b] flex flex-col border-r border-gray-200 dark:border-white/5 transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 lg:w-[260px]",
      isSidebarOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="p-6 border-b border-gray-200 dark:border-white/5 flex items-center justify-between transition-colors duration-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Activity size={18} className="text-white" />
          </div>
          <h1 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight transition-colors duration-200">Babblr</h1>
        </div>
        <button 
          onClick={closeSidebar}
          className="p-1 text-gray-400 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white lg:hidden transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
        <button
          onClick={() => setDiscoverRoomsModalOpen(true)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white mb-6 group"
        >
          <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-400 dark:text-slate-500 group-hover:bg-violet-500 group-hover:text-white transition-all shadow-inner">
            <Search size={18} />
          </div>
          <span className="flex-1 text-left font-bold text-sm">Discover Rooms</span>
        </button>

        <div className="px-3 py-2 flex items-center justify-between text-[10px] font-bold text-gray-400 dark:text-white/40 uppercase tracking-[0.2em] transition-colors duration-200">
          <span>Your Rooms</span>
          <button
            onClick={() => setCreateRoomModalOpen(true)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-white/5 rounded-md transition-colors text-gray-400 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="space-y-0.5">
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => navigate(`/rooms/${room.id}`)}
              className={cn(
                "w-full h-9 flex items-center gap-3 px-3 rounded-lg transition-all group relative",
                currentRoomId === room.id
                  ? "bg-violet-50 dark:bg-white/5 text-violet-700 dark:text-white border-l-2 border-violet-500 rounded-l-none"
                  : "text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-slate-200"
              )}
            >
              <Hash size={16} className={currentRoomId === room.id ? "text-violet-500 dark:text-violet-400" : "text-gray-400 dark:text-slate-600 group-hover:text-gray-600 dark:group-hover:text-slate-400"} />
              <span className="flex-1 text-left truncate text-sm font-medium">{room.name}</span>
              <span className="text-[10px] opacity-40 flex items-center gap-1 font-bold">
                <Users size={10} />
                {room.memberCount}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 bg-gray-50 dark:bg-black/20 border-t border-gray-200 dark:border-white/5 transition-colors duration-200">
        <button 
          onClick={() => setUserProfileModalOpen(true)}
          className="w-full flex items-center gap-3 mb-4 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all group"
        >
          <Avatar 
            displayName={user?.displayName}
            senderId={user?.userId || ''}
            email={user?.email}
            className="w-10 h-10 text-sm group-hover:scale-105"
          />
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate leading-tight transition-colors duration-200">{user?.displayName}</p>
            <p className="text-[11px] text-gray-500 dark:text-white/40 truncate font-medium transition-colors duration-200">{user?.email}</p>
          </div>
        </button>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-gray-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-400/10 rounded-lg transition-all uppercase tracking-widest"
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </div>
  );
};
