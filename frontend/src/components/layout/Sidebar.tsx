'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Activity, 
  BrainCircuit, 
  Bell, 
  User 
} from 'lucide-react';

export const Sidebar = () => {
  const pathname = usePathname();

  const links = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Sensors', href: '/dashboard/sensors', icon: Activity },
    { name: 'Risk Analysis', href: '/dashboard/risk', icon: BrainCircuit },
    { name: 'Alerts', href: '/dashboard/alerts', icon: Bell },
  ];

  return (
    <div className="flex flex-col w-64 bg-gradient-to-b from-brand-dark to-brand-light text-white h-full shadow-xl">
      <div className="flex items-center justify-center h-20 border-b border-white/10">
        <h1 className="text-xl font-bold tracking-wider">AIoT Monitor</h1>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center px-4 py-2 text-sm text-gray-300">
          <User className="mr-3 h-5 w-5" />
          <span>Profile</span>
        </div>
      </div>
    </div>
  );
};
