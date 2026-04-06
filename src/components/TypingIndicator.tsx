import React from 'react';
import { motion } from 'motion/react';
import { TypingIndicator as ITypingIndicator } from '../types';

interface Props {
  typingUsers: ITypingIndicator[];
}

export const TypingIndicator: React.FC<Props> = ({ typingUsers }) => {
  if (typingUsers.length === 0) return null;

  const text = typingUsers.length === 1
    ? `${typingUsers[0].displayName} is typing...`
    : typingUsers.length === 2
      ? `${typingUsers[0].displayName} and ${typingUsers[1].displayName} are typing...`
      : `${typingUsers[0].displayName} and ${typingUsers.length - 1} others are typing...`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 px-4 py-1 text-xs text-gray-500 dark:text-slate-400 italic transition-colors duration-200"
    >
      <div className="flex gap-1">
        <span className="w-1 h-1 bg-gray-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1 h-1 bg-gray-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1 h-1 bg-gray-400 dark:bg-slate-500 rounded-full animate-bounce" />
      </div>
      {text}
    </motion.div>
  );
};
