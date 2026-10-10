import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useRouter } from 'next/navigation';

export const useAuth = (requireAuth = true) => {
  const { token, user, logout } = useAuthStore();
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    
    // Check local storage on mount to see if we have token but zustand lost it
    const localToken = localStorage.getItem('token');
    
    if (requireAuth && !token && !localToken) {
      router.push('/auth/login');
    }
  }, [token, requireAuth, router]);

  return { token, user, logout, isAuthenticated: !!token, isLoaded };
};
