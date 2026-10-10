'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/authStore';

export default function Home() {
  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (token) {
      router.push('/dashboard');
    } else {
      router.push('/auth/login');
    }
  }, [token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-bg">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-brand-dark mb-4">AIoT Depression Monitoring System</h1>
        <p className="text-gray-600 mb-8">Loading...</p>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-light mx-auto"></div>
      </div>
    </div>
  );
}
