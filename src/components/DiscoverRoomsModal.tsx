import React, { useEffect, useState } from 'react';
import { X, Search, Users, Hash, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useRooms } from '../hooks/useRooms';
import { Room } from '../types';
import { useNavigate } from 'react-router-dom';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const DiscoverRoomsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { discoverRooms, joinRoom, rooms: joinedRooms } = useRooms();
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const fetchDiscoverable = async () => {
    setIsLoading(true);
    try {
      const data = await discoverRooms();
      setAvailableRooms(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDiscoverable();
    }
  }, [isOpen]);

  const handleJoin = async (room: Room) => {
    setJoiningId(room.id);
    try {
      await joinRoom(room);
      onClose();
      navigate(`/rooms/${room.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setJoiningId(null);
    }
  };

  const filteredRooms = availableRooms.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    r.description.toLowerCase().includes(search.toLowerCase())
  );

  const isJoined = (roomId: string) => joinedRooms.some(r => r.id === roomId);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-[#1e293b] w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-700/50 overflow-hidden flex flex-col max-h-[85vh] relative z-10"
          >
            <div className="p-6 border-b border-slate-700/50 flex items-center justify-between bg-gradient-to-r from-indigo-500/10 to-transparent">
              <div>
                <h2 className="text-xl font-bold text-white leading-tight">Discover Communities</h2>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">Explore public rooms and join the conversation</p>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 bg-[#0f172a]/50 border-b border-slate-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search for rooms..."
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 text-slate-500 gap-4">
                  <Loader2 className="animate-spin text-indigo-500" size={40} />
                  <p className="text-sm font-bold uppercase tracking-widest">Finding communities...</p>
                </div>
              ) : filteredRooms.length > 0 ? (
                filteredRooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex items-center justify-between p-5 bg-[#0f172a] rounded-2xl border border-slate-700/50 hover:border-indigo-500/30 transition-all group"
                  >
                    <div className="flex items-center gap-5 flex-1 min-w-0">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-inner">
                        <Hash size={28} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-white truncate group-hover:text-indigo-400 transition-colors">{room.name}</h3>
                        <p className="text-sm text-slate-400 line-clamp-1 font-medium">{room.description || 'No description provided'}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-widest bg-slate-800/50 px-2 py-0.5 rounded-full">
                            <Users size={12} />
                            {room.memberCount} members
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-6">
                      {isJoined(room.id) ? (
                        <button
                          disabled
                          className="flex items-center gap-2 px-8 py-2.5 bg-slate-800 text-slate-500 rounded-xl text-sm font-bold transition-all border border-slate-700 cursor-not-allowed"
                        >
                          Joined
                        </button>
                      ) : (
                        <button
                          onClick={() => handleJoin(room)}
                          disabled={joiningId === room.id}
                          className="flex items-center gap-2 px-8 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all shadow-xl shadow-indigo-500/20"
                        >
                          {joiningId === room.id ? <Loader2 className="animate-spin" size={18} /> : 'Join'}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-24 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No communities found</p>
                  <p className="text-xs text-slate-600 mt-1">Try a different search term</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
