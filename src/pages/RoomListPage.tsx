import React from 'react';
import { MessageSquare, Hash, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRoomStore } from '../store/useRoomStore';
import { useRooms } from '../hooks/useRooms';

export const RoomListPage: React.FC = () => {
  const { rooms } = useRooms();
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col bg-[#0f172a]">
      <div className="p-8 max-w-5xl mx-auto w-full">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Welcome back!</h1>
          <p className="text-slate-400 text-lg">Select a room to start chatting or create a new one.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
  );
};
