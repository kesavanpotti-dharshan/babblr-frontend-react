import React from 'react';
import { MessageSquare, Hash, Users, ArrowRight, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRoomStore } from '../store/useRoomStore';
import { useRooms } from '../hooks/useRooms';
import { useUIStore } from '../store/useUIStore';

export const RoomListPage: React.FC = () => {
  const { rooms } = useRooms();
  const navigate = useNavigate();
  const { openSidebar } = useUIStore();

  return (
    <div className="flex-1 flex flex-col bg-[#0f172a] overflow-hidden">
      {/* Mobile Header */}
      <header className="lg:hidden h-16 border-b border-slate-700/50 bg-[#1e293b]/50 backdrop-blur-md flex items-center px-4 shrink-0 z-10">
        <button
          onClick={openSidebar}
          className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors"
        >
          <Menu size={20} />
        </button>
        <h1 className="ml-4 text-lg font-bold text-white">Babblr</h1>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-4 sm:p-6 md:p-10 max-w-6xl mx-auto w-full">
          <div className="mb-8 md:mb-12">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 tracking-tight">
              Welcome back!
            </h1>
            <p className="text-slate-400 text-base md:text-xl max-w-2xl">
              Select a room to start chatting or explore new communities to join.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => navigate(`/rooms/${room.id}`)}
              className="group bg-[#1e293b] p-6 rounded-2xl border border-slate-700/50 hover:border-indigo-500/50 transition-all hover:shadow-2xl hover:shadow-indigo-500/10 text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="text-indigo-400" size={20} />
              </div>
              
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                <Hash size={24} />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                {room.name}
              </h3>
              
              <p className="text-slate-400 text-sm mb-6 line-clamp-2 min-h-[40px]">
                {room.description || 'No description provided.'}
              </p>
              
              <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Users size={14} />
                  <span>{room.memberCount} members</span>
                </div>
                <div className="w-1 h-1 bg-slate-700 rounded-full" />
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  <span>Active now</span>
                </div>
              </div>
            </button>
          ))}

          {rooms.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-800 text-slate-500 mb-6">
                <MessageSquare size={40} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No rooms found</h3>
              <p className="text-slate-400">Create your first room to get started!</p>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};
