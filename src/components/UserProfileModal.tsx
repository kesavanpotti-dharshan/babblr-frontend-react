import React, { useState } from 'react';
import { X, User, Mail, Image as ImageIcon, Loader2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore } from '../store/useAuthStore';
import { authApi } from '../services/api';
import { cn } from '../lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

import { Avatar } from './Avatar';

export const UserProfileModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { user, setAuth } = useAuthStore();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await authApi.updateMe({ displayName, avatarUrl });
      // Update local auth state
      const token = useAuthStore.getState().token;
      if (token) {
        setAuth(res.data, token);
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/60 dark:bg-slate-950/80 backdrop-blur-md transition-colors duration-200"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-[#1e293b] w-full max-w-md rounded-3xl shadow-2xl border border-gray-200 dark:border-slate-700/50 overflow-hidden relative z-10 transition-colors duration-200"
          >
            <div className="p-6 border-b border-gray-200 dark:border-slate-700/50 flex items-center justify-between bg-gradient-to-r from-indigo-500/10 to-transparent transition-colors duration-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight transition-colors duration-200">Your Profile</h2>
                <p className="text-xs text-gray-500 dark:text-slate-400 font-medium uppercase tracking-wider mt-1 transition-colors duration-200">Manage your account settings</p>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 text-gray-400 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6">
              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400 text-sm font-medium animate-in fade-in slide-in-from-top-1">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                  <CheckCircle size={16} />
                  Profile updated successfully!
                </div>
              )}

              <div className="flex justify-center mb-6">
                <div className="relative group">
                  {avatarUrl ? (
                    <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-[#1e293b] transition-colors duration-200">
                      <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  ) : (
                    <Avatar 
                      displayName={displayName}
                      senderId={user?.userId || ''}
                      email={user?.email}
                      className="w-24 h-24 rounded-3xl text-3xl border-4 border-white dark:border-[#1e293b] transition-colors duration-200"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest ml-1 transition-colors duration-200">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-600" size={18} />
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full bg-gray-100 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-gray-400 dark:text-slate-500 cursor-not-allowed text-sm font-medium transition-colors duration-200"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest ml-1 transition-colors duration-200">Display Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400" size={18} />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your name"
                      required
                      className="w-full bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest ml-1 transition-colors duration-200">Avatar URL</label>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400" size={18} />
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://example.com/avatar.png"
                      className="w-full bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm font-medium"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !displayName.trim()}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Save Changes'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
