import React from 'react';
import { cn } from '../lib/utils';

interface Props {
  displayName?: string;
  senderId: string;
  email?: string;
  className?: string;
}

const COLORS = [
  'bg-violet-600',
  'bg-blue-600',
  'bg-emerald-600',
  'bg-amber-600',
  'bg-rose-600',
  'bg-cyan-600',
];

export const Avatar: React.FC<Props> = ({ displayName, senderId, email, className }) => {
  const getInitial = () => {
    if (displayName && displayName.trim().length > 0) {
      return displayName.trim()[0].toUpperCase();
    }
    if (email && email.trim().length > 0) {
      return email.trim()[0].toUpperCase();
    }
    return 'U';
  };

  const getBgColor = () => {
    if (!senderId) return COLORS[0];
    const index = senderId.charCodeAt(0) % COLORS.length;
    return COLORS[index];
  };

  return (
    <div className={cn(
      "rounded-full flex items-center justify-center text-white font-semibold shadow-lg transition-transform",
      getBgColor(),
      className
    )}>
      {getInitial()}
    </div>
  );
};
