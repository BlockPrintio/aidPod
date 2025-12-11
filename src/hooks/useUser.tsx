import { useState, useEffect } from 'react';
import { getCurrentUser, getUserRole } from '../auth';

interface User {
  isAuthenticated: boolean;
  userType?: 'patient' | 'donor' | 'hospital';
  role?: 'patient' | 'donor' | 'hospital' | null;
  [key: string]: unknown;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const currentUser = getCurrentUser();
      const userRole = getUserRole();
      
      if (!currentUser) {
        setError('No user found');
        setUser(null);
      } else {
        setUser({
          ...currentUser,
          role: userRole,
          isAuthenticated: currentUser.isAuthenticated ?? true
        } as User);
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    isLoading,
    error,
    refreshUser: () => {
      try {
        const currentUser = getCurrentUser();
        const userRole = getUserRole();
        if (currentUser) {
          setUser({
            ...currentUser,
            role: userRole,
            isAuthenticated: currentUser.isAuthenticated ?? true
          } as User);
        } else {
          setUser(null);
        }
      } catch (err) {
        const error = err as Error;
        setError(error.message);
      }
    }
  };
}

