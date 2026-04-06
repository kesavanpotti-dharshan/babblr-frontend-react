import React, { useState } from 'react';
import { X, Lock, Globe, Plus, AlertCircle, Loader2, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useRooms } from '../hooks/useRooms';
import { cn } from '../lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateRoomModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { createRoom } = useRooms();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.length < 3) {
      setError('Room name must be at least 3 characters long');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      await createRoom({ name, description, isPrivate });
      handleClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create room. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setName('');
      setDescription('');
      setIsPrivate(false);
      setError(null);
    }, 200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-gray-900/60 dark:bg-slate-950/80 backdrop-blur-md transition-colors duration-200"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-[#1e293b] w-full max-w-lg rounded-3xl shadow-2xl border border-gray-200 dark:border-slate-700/50 overflow-hidden relative z-10 transition-colors duration-200"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-slate-700/50 flex items-center justify-between bg-gradient-to-r from-indigo-500/10 to-transparent transition-colors duration-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                  <Plus size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight transition-colors duration-200">Create Community</h2>
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-medium uppercase tracking-wider transition-colors duration-200">Start a new conversation</p>
                </div>
              </div>
              <button 
                onClick={handleClose} 
                className="p-2 text-gray-400 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400 text-sm"
                >
                  <AlertCircle size={18} className="shrink-0" />
                  <p className="font-medium">{error}</p>
                </motion.div>
              )}

              <div className="space-y-4">
                {/* Room Name */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-slate-300 ml-1 transition-colors duration-200">Room Name</label>
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full transition-colors duration-200",
                      name.length > 20 ? "text-rose-600 dark:text-rose-400 bg-rose-400/10" : "text-gray-500 dark:text-slate-500 bg-gray-100 dark:bg-slate-800"
                    )}>
                      {name.length}/30
                    </span>
                  </div>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors">
                      <Hash size={18} />
                    </div>
                    <input
                      type="text"
                      required
                      maxLength={30}
                      value={name}
                      onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                      className="w-full bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-slate-700 rounded-2xl pl-12 pr-4 py-3.5 text-gray-900 dark:text-white font-medium placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                      placeholder="e.g. design-critique"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-slate-300 ml-1 transition-colors duration-200">Description</label>
                    <span className="text-[10px] font-bold text-gray-500 dark:text-slate-500 uppercase tracking-widest bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-full transition-colors duration-200">
                      {description.length}/100
                    </span>
                  </div>
                  <textarea
                    value={description}
                    maxLength={100}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all h-28 resize-none text-sm leading-relaxed"
                    placeholder="Tell everyone what this room is for..."
                  />
                </div>

                {/* Privacy Toggle */}
                <div className="pt-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-slate-300 ml-1 mb-3 block transition-colors duration-200">Privacy Settings</label>
                  <div 
                    onClick={() => setIsPrivate(!isPrivate)}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group",
                      isPrivate 
                        ? "bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40" 
                        : "bg-indigo-500/5 border-indigo-500/20 hover:border-indigo-500/40"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                        isPrivate ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                      )}>
                        {isPrivate ? <Lock size={20} /> : <Globe size={20} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white transition-colors duration-200">{isPrivate ? 'Private Room' : 'Public Room'}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-500 font-medium transition-colors duration-200">
                          {isPrivate ? 'Only invited members can join' : 'Visible to everyone in discovery'}
                        </p>
                      </div>
                    </div>
                    <div className={cn(
                      "w-12 h-6 rounded-full relative transition-colors",
                      isPrivate ? "bg-amber-500" : "bg-gray-200 dark:bg-slate-700"
                    )}>
                      <motion.div 
                        animate={{ x: isPrivate ? 26 : 4 }}
                        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-6 py-3.5 rounded-2xl text-sm font-bold text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || name.length < 3}
                  className="flex-[2] bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3.5 rounded-2xl text-sm font-bold text-white transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Community</span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
