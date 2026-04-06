import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import { Sidebar } from './Sidebar';
import { CreateRoomModal } from './CreateRoomModal';
import { DiscoverRoomsModal } from './DiscoverRoomsModal';
import { UserProfileModal } from './UserProfileModal';
import { AnimatePresence, motion } from 'motion/react';

export const ProtectedLayout: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { 
    isSidebarOpen, 
    closeSidebar, 
    isCreateRoomModalOpen, 
    setCreateRoomModalOpen,
    isDiscoverRoomsModalOpen,
    setDiscoverRoomsModalOpen,
    isUserProfileModalOpen,
    setUserProfileModalOpen
  } = useUIStore();
  const location = useLocation();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    closeSidebar();
  }, [location.pathname, closeSidebar]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-200 overflow-hidden relative">
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <Sidebar />
      
      <main className="flex-1 flex flex-col min-w-0 relative">
        <Outlet />
      </main>

      {/* Modals - Rendered at layout level to avoid sidebar stacking context */}
      <CreateRoomModal 
        isOpen={isCreateRoomModalOpen} 
        onClose={() => setCreateRoomModalOpen(false)} 
      />
      <DiscoverRoomsModal 
        isOpen={isDiscoverRoomsModalOpen} 
        onClose={() => setDiscoverRoomsModalOpen(false)} 
      />
      <UserProfileModal
        isOpen={isUserProfileModalOpen}
        onClose={() => setUserProfileModalOpen(false)}
      />
    </div>
  );
};
