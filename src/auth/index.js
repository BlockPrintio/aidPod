
export const AUTH_STORAGE_KEY = 'medchain_user';

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

export function isAuthenticated() {
  const user = getCurrentUser();
  return Boolean(user && user.isAuthenticated);
}

export function getUserRole() {
  const user = getCurrentUser();
  return user?.userType ?? null; // 'patient' | 'donor' | 'hospital'
}

export function hasAnyRole(allowedRoles = []) {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  const role = getUserRole();
  return allowedRoles.includes(role);
}



