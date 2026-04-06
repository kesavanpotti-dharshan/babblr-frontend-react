import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger'
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/60 dark:bg-slate-950/80 backdrop-blur-sm transition-colors duration-200"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden transition-colors duration-200"
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                  variant === 'danger' ? "bg-rose-500/10 text-rose-600 dark:text-rose-500" : 
                  variant === 'warning' ? "bg-amber-500/10 text-amber-600 dark:text-amber-500" : 
                  "bg-indigo-500/10 text-indigo-600 dark:text-indigo-500"
                )}>
                  <AlertTriangle size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 transition-colors duration-200">{title}</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed transition-colors duration-200">
                    {message}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 text-gray-400 hover:text-gray-900 dark:text-slate-500 dark:hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800/50 flex items-center justify-end gap-3 transition-colors duration-200">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-bold text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={cn(
                  "px-6 py-2 rounded-xl text-sm font-bold text-white transition-all shadow-lg",
                  variant === 'danger' ? "bg-rose-600 hover:bg-rose-500 shadow-rose-500/20" :
                  variant === 'warning' ? "bg-amber-600 hover:bg-amber-500 shadow-amber-500/20" :
                  "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20"
                )}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
