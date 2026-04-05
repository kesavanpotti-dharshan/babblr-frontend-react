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

  const handleJoin = async (roomId: string) => {
    setJoiningId(roomId);
    try {
      await joinRoom(roomId);
      onClose();
      navigate(`/rooms/${roomId}`);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-[#1e293b] w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col max-h-[80vh]"
          >
            <div className="p-6 border-b border-slate-700 flex items-center justify-between bg-[#1e293b]">
              <div>
                <h2 className="text-xl font-bold text-white">Discover Rooms</h2>
                <p className="text-xs text-slate-400 mt-1">Explore public rooms and join the conversation</p>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-full">
                <X size={24} />
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

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
                  <Loader2 className="animate-spin" size={32} />
                  <p className="text-sm font-medium">Finding rooms...</p>
                </div>
              ) : filteredRooms.length > 0 ? (
                filteredRooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex items-center justify-between p-4 bg-[#0f172a] rounded-xl border border-slate-700 hover:border-slate-600 transition-all group"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                        <Hash size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-bold truncate">{room.name}</h3>
                        <p className="text-xs text-slate-400 line-clamp-1">{room.description || 'No description'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="flex items-center gap-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                            <Users size={10} />
                            {room.memberCount} members
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      {isJoined(room.id) ? (
                        <button
                          onClick={() => {
                            onClose();
                            navigate(`/rooms/${room.id}`);
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-bold transition-all"
                        >
                          Open
                          <ArrowRight size={14} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleJoin(room.id)}
                          disabled={joiningId === room.id}
                          className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-indigo-500/20"
                        >
                          {joiningId === room.id ? <Loader2 className="animate-spin" size={16} /> : 'Join'}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20">
                  <p className="text-slate-500">No rooms found matching your search.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
