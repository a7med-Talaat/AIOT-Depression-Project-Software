'use client';

import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '../../hooks/useAuth';
import { useRealTimeData } from '../../hooks/useRealTimeData';

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { isLoaded, isAuthenticated } = useAuth(true);
  useRealTimeData(); // Initialize real-time connection

  if (!isLoaded || !isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center bg-brand-bg">Loading...</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-brand-bg">
      <Sidebar />
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <Header />
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
