import React from 'react';
import { MessageSquare, Hash, Users, ArrowRight, Menu, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRoomStore } from '../store/useRoomStore';
import { useRooms } from '../hooks/useRooms';
import { useUIStore } from '../store/useUIStore';
import { ThemeToggle } from '../components/ThemeToggle';

export const RoomListPage: React.FC = () => {
  const { rooms } = useRooms();
  const navigate = useNavigate();
  const { openSidebar, setDiscoverRoomsModalOpen } = useUIStore();

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-[#0f172a] overflow-hidden transition-colors duration-200">
      {/* Mobile Header */}
      <header className="lg:hidden h-16 border-b border-gray-200 dark:border-slate-700/50 bg-white/50 dark:bg-[#1e293b]/50 backdrop-blur-md flex items-center px-4 shrink-0 z-10 transition-colors duration-200">
        <button
          onClick={openSidebar}
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-500 dark:text-slate-400 transition-colors"
        >
          <Menu size={20} />
        </button>
        <h1 className="ml-4 text-lg font-bold text-gray-900 dark:text-white flex-1">Babblr</h1>
        <ThemeToggle />
      </header>

      {/* Desktop Header (Optional, but good for consistency) */}
      <header className="hidden lg:flex h-16 border-b border-gray-200 dark:border-slate-700/50 bg-white/50 dark:bg-[#1e293b]/50 backdrop-blur-md items-center justify-end px-8 shrink-0 z-10 transition-colors duration-200">
        <ThemeToggle />
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-4 sm:p-6 md:p-10 max-w-6xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 md:mb-12">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight transition-colors duration-200">
                Welcome back!
              </h1>
              <p className="text-gray-500 dark:text-slate-400 text-base md:text-xl max-w-2xl transition-colors duration-200">
                Select a room to start chatting or explore new communities to join.
              </p>
            </div>
            <button
              onClick={() => setDiscoverRoomsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 shrink-0"
            >
              <Compass size={20} />
              Discover Rooms
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => navigate(`/rooms/${room.id}`)}
              className="group bg-white dark:bg-[#1e293b]/50 backdrop-blur-xl p-8 rounded-3xl border border-gray-200 dark:border-white/5 hover:border-violet-300 dark:hover:border-violet-500/50 transition-all hover:shadow-sm dark:hover:shadow-2xl dark:hover:shadow-violet-500/10 text-left relative overflow-hidden flex flex-col min-h-[240px]"
            >
              <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                <ArrowRight className="text-violet-500 dark:text-violet-400" size={24} />
              </div>
              
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 flex items-center justify-center text-violet-600 dark:text-violet-400 mb-6 group-hover:from-violet-600 group-hover:to-indigo-600 group-hover:text-white transition-all shadow-lg">
                <Hash size={28} />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                {room.name}
              </h3>
              
              <p className="text-gray-500 dark:text-slate-400 text-sm mb-8 line-clamp-2 leading-relaxed flex-1 transition-colors duration-200">
                {room.description || 'No description provided.'}
              </p>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-white/5 rounded-full px-3 py-1 text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider transition-colors duration-200">
                  <Users size={12} />
                  <span>{room.memberCount} members</span>
                </div>
                <div className="flex items-center bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs px-2 py-0.5 rounded-full transition-colors duration-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 inline-block mr-1" />
                  <span>Active Now</span>
                </div>
              </div>

              {/* Faint gradient overlay */}
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}

          {rooms.length === 0 && (
            <div className="col-span-full py-24 flex flex-col items-center text-center">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-violet-600/20 blur-3xl rounded-full" />
                <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-2xl">
                  <MessageSquare size={48} />
                </div>
              </div>
              <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight transition-colors duration-200">No rooms yet</h3>
              <p className="text-gray-500 dark:text-slate-400 text-lg max-w-md mb-10 leading-relaxed transition-colors duration-200">
                Create your first room or discover existing ones to start your journey on Babblr.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setDiscoverRoomsModalOpen(true)}
                  className="px-8 py-3.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white rounded-2xl font-bold transition-all border border-gray-200 dark:border-white/10"
                >
                  Discover Rooms
                </button>
                <button
                  onClick={() => useUIStore.getState().setCreateRoomModalOpen(true)}
                  className="px-8 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-500/20"
                >
                  Create Room
                </button>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};
