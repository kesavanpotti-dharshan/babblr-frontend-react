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

export const Sidebar: React.FC = () => {
  const { rooms } = useRoomStore();
  const { user, logout } = useAuthStore();
  const { onlineCount } = usePresence();
  const { isSidebarOpen, closeSidebar, setCreateRoomModalOpen, setDiscoverRoomsModalOpen, setUserProfileModalOpen } = useUIStore();
  const { id: currentRoomId } = useParams();
  const navigate = useNavigate();

  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-50 w-72 bg-[#1e293b] flex flex-col border-r border-slate-700/50 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:w-64",
      isSidebarOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white tracking-tight">Babblr</h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">
            <Activity size={12} className="animate-pulse" />
            <span>{onlineCount} online</span>
          </div>
          <button 
            onClick={closeSidebar}
            className="p-1 text-slate-400 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        <button
          onClick={() => setDiscoverRoomsModalOpen(true)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 mb-4 group"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
            <Search size={18} />
          </div>
          <span className="flex-1 text-left font-bold text-sm">Discover Rooms</span>
        </button>

        <div className="px-2 py-2 flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <span>Your Rooms</span>
          <button
            onClick={() => setCreateRoomModalOpen(true)}
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
        <button 
          onClick={() => setUserProfileModalOpen(true)}
          className="w-full flex items-center gap-3 mb-3 p-2 rounded-xl hover:bg-slate-700/30 transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold shadow-inner group-hover:scale-105 transition-transform">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
            ) : (
              user?.displayName?.[0]?.toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-semibold text-white truncate">{user?.displayName}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </button>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-all"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );
};
