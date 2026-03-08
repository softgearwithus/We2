export type AuthScope = 'user' | 'admin';

const STORAGE_KEYS = {
  token: (scope: AuthScope) => `emble.${scope}.accessToken`,
  issuedAt: (scope: AuthScope) => `emble.${scope}.accessTokenSetAt`,
  persistent: (scope: AuthScope) => `emble.${scope}.accessTokenPersistent`,
  userId: (scope: AuthScope) => `emble.${scope}.userId`,
};

const getStorage = (persistent: boolean) => (persistent ? localStorage : sessionStorage);

export const resolveAuthScope = (pathname?: string | null): AuthScope => {
  if (!pathname) return 'user';
  if (pathname.startsWith('/admin') || pathname.startsWith('/secure/admin')) {
    return 'admin';
  }
  return 'user';
};

export const getStoredToken = (scope: AuthScope) => {
  if (typeof window === 'undefined') return null;
  return (
    localStorage.getItem(STORAGE_KEYS.token(scope)) ||
    sessionStorage.getItem(STORAGE_KEYS.token(scope))
  );
};

export const getTokenIssuedAt = (scope: AuthScope) => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.issuedAt(scope));
};

export const getTokenPersistent = (scope: AuthScope) => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEYS.persistent(scope)) === 'true';
};

export const storeAuthSession = (scope: AuthScope, token: string, userId?: string | null, rememberMe = false) => {
  if (typeof window === 'undefined') return;
  const storage = getStorage(rememberMe);
  storage.setItem(STORAGE_KEYS.token(scope), token);
  localStorage.setItem(STORAGE_KEYS.issuedAt(scope), String(Date.now()));
  if (rememberMe) {
    localStorage.setItem(STORAGE_KEYS.persistent(scope), 'true');
  } else {
    localStorage.removeItem(STORAGE_KEYS.persistent(scope));
  }
  if (userId) {
    storage.setItem(STORAGE_KEYS.userId(scope), userId);
  }
};

export const clearAuthSession = (scope: AuthScope) => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.token(scope));
  localStorage.removeItem(STORAGE_KEYS.issuedAt(scope));
  localStorage.removeItem(STORAGE_KEYS.persistent(scope));
  localStorage.removeItem(STORAGE_KEYS.userId(scope));
  sessionStorage.removeItem(STORAGE_KEYS.token(scope));
  sessionStorage.removeItem(STORAGE_KEYS.userId(scope));
};

export const clearAllAuthSessions = () => {
  clearAuthSession('user');
  clearAuthSession('admin');
};

export const getStoredUserId = (scope: AuthScope) => {
  if (typeof window === 'undefined') return null;
  return (
    localStorage.getItem(STORAGE_KEYS.userId(scope)) ||
    sessionStorage.getItem(STORAGE_KEYS.userId(scope))
  );
};

export const getActiveScope = () =>
  resolveAuthScope(typeof window !== 'undefined' ? window.location.pathname : null);

export const getActiveToken = () => getStoredToken(getActiveScope());

export const getActiveUserId = () => getStoredUserId(getActiveScope());

export const setProfileCompleted = (completed: boolean) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('profile_completed', completed ? 'true' : 'false');
};
