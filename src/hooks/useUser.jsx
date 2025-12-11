import { useState, useEffect } from 'react';
import { getCurrentUser, getUserRole } from '../auth';

export function useUser() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
          role: userRole
        });
      }
    } catch (err) {
      setError(err.message);
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
        setUser({
          ...currentUser,
          role: userRole
        });
      } catch (err) {
        setError(err.message);
      }
    }
  };
}