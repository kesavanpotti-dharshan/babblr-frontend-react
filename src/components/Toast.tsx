import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { cn } from '../lib/utils';

export type ToastType = 'success' | 'error' | 'info';

interface Props {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<Props> = ({
  message,
  type,
  isVisible,
  onClose,
  duration = 5000
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, duration]);

  const icons = {
    success: <CheckCircle className="text-emerald-500" size={20} />,
    error: <AlertCircle className="text-rose-500" size={20} />,
    info: <Info className="text-indigo-500" size={20} />,
  };

  const bgColors = {
    success: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20",
    error: "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20",
    info: "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20",
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 20, x: '-50%' }}
          className={cn(
            "fixed bottom-8 left-1/2 z-[200] flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-md shadow-2xl min-w-[320px] max-w-md transition-colors duration-200",
            bgColors[type]
          )}
        >
          <div className="flex-shrink-0">{icons[type]}</div>
          <p className="flex-1 text-sm font-medium text-gray-900 dark:text-white leading-tight transition-colors duration-200">
            {message}
          </p>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 dark:text-slate-500 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
