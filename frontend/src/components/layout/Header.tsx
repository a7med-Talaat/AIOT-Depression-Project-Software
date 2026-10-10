'use client';

import { Bell, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'next/navigation';

export const Header = () => {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-6">
      <div className="flex-1"></div>
      <div className="flex items-center space-x-4">
        <button className="text-gray-400 hover:text-brand-light transition-colors relative">
          <Bell className="h-6 w-6" />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>
        <div className="border-l border-gray-300 h-6 mx-2"></div>
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-brand-light text-white flex items-center justify-center font-bold">
            {user?.firstName?.[0] || 'U'}
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:block">
            {user?.firstName} {user?.lastName}
          </span>
        </div>
        <button 
          onClick={handleLogout}
          className="ml-4 text-gray-400 hover:text-red-500 transition-colors"
          title="Logout"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};
