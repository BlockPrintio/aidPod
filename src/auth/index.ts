export const AUTH_STORAGE_KEY = 'medchain_user';

interface User {
  isAuthenticated: boolean;
  userType?: 'patient' | 'donor' | 'hospital';
  [key: string]: unknown;
}

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch (error) {
    return null;
  }
}

export function isAuthenticated(): boolean {
  const user = getCurrentUser();
  return Boolean(user && user.isAuthenticated);
}

export function getUserRole(): 'patient' | 'donor' | 'hospital' | null {
  const user = getCurrentUser();
  return (user?.userType as 'patient' | 'donor' | 'hospital') ?? null;
}

export function hasAnyRole(allowedRoles: string[] = []): boolean {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  const role = getUserRole();
  return role ? allowedRoles.includes(role) : false;
}

