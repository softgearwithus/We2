"use client";
import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { clearAllAuthSessions, clearAuthSession, getStoredToken, getTokenIssuedAt, getTokenPersistent, resolveAuthScope, storeAuthSession } from '../lib/auth-storage';

interface User {
    id: string;
    email: string;
    role: string;
    collegeId?: string | null;
    department?: string | null;
    year?: string | null;
    subscriptionPlan?: string;
    subscriptionStatus?: string;
    subscriptionEndDate?: string;
    usageLastReset?: string;
    createdAt?: string;
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
    username?: string | null;
    roleTitle?: string | null;
    location?: string | null;
    bio?: string | null;
    websiteUrl?: string | null;
    githubUrl?: string | null;
    linkedinUrl?: string | null;
}

interface AuthContextType {
    user: User | null;
    login: (token: string, userData: User, rememberMe?: boolean, scopeOverride?: 'user' | 'admin') => void;
    logout: () => void;
    forceLogout: (reason?: 'session_revoked' | 'token_invalid') => void;
    updateUser: (userData: User) => void;
    isLoading: boolean;
    token: string | null;
    scope: 'user' | 'admin';
}

const SESSION_REVOKED_EVENT = 'emble:session-revoked';
const SESSION_REVOKING_FLAG = 'emble.auth.revoking';

const isSessionRevokedError = (status: number, payload: any) => {
    if (status !== 401) return false;
    const code = payload?.code || payload?.error?.code;
    const message = String(payload?.message || payload?.error?.message || '').toUpperCase();
    return code === 'SESSION_REVOKED' || message.includes('SESSION_REVOKED');
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [token, setToken] = useState<string | null>(null);
    const router = useRouter();
    const pathname = usePathname();
    const scope = resolveAuthScope(pathname);

    const forceLogout = (reason: 'session_revoked' | 'token_invalid' = 'token_invalid') => {
        clearAllAuthSessions();
        setUser(null);
        setToken(null);
        if (reason === 'session_revoked') {
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('emble.auth.notice', 'Your account was logged in on another device. Please sign in again.');
                window.dispatchEvent(new Event(SESSION_REVOKED_EVENT));
            }
        }
        router.push('/login');
    };

    useEffect(() => {
        const storedToken = getStoredToken(scope);
        const issuedAt = getTokenIssuedAt(scope);
        const isPersistent = getTokenPersistent(scope);
        if (issuedAt) {
            // 7 days if "Remember Me" vs 1 day (or session) default
            const maxAgeMs = isPersistent ? 1000 * 60 * 60 * 24 * 7 : 1000 * 60 * 60 * 24;
            if (Date.now() - parseInt(issuedAt, 10) > maxAgeMs) {
                clearAuthSession(scope);
            }
        }
        if (storedToken) {
            setToken(storedToken);
            // Validate token or fetch user profile
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
                headers: {
                    'Authorization': `Bearer ${storedToken}`
                }
            })
                .then(async (res) => {
                    if (res.ok) return res.json();
                    const payload = await res.json().catch(() => null);
                    if (isSessionRevokedError(res.status, payload)) {
                        throw new Error('SESSION_REVOKED');
                    }
                    throw new Error('INVALID_TOKEN');
                })
                .then(userData => {
                    setUser(userData);
                    if (userData?.id) {
                        storeAuthSession(scope, storedToken, userData.id, isPersistent);
                    }
                })
                .catch((error: Error) => {
                    if (error.message === 'SESSION_REVOKED') {
                        forceLogout('session_revoked');
                        return;
                    }
                    clearAuthSession(scope);
                    setUser(null);
                    setToken(null);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } else {
            setIsLoading(false);
        }
    }, [scope, router]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const originalFetch = window.fetch.bind(window);
        window.fetch = (async (...args: Parameters<typeof fetch>) => {
            const response = await originalFetch(...args);

            if (response.status === 401) {
                const payload = await response.clone().json().catch(() => null);
                if (isSessionRevokedError(response.status, payload)) {
                    const input = args[0];
                    const url = typeof input === 'string' ? input : input instanceof Request ? input.url : '';
                    if (url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/register/')) {
                        return response;
                    }
                    if (sessionStorage.getItem(SESSION_REVOKING_FLAG) !== '1') {
                        sessionStorage.setItem(SESSION_REVOKING_FLAG, '1');
                        window.dispatchEvent(new Event(SESSION_REVOKED_EVENT));
                    }
                }
            }

            return response;
        }) as typeof window.fetch;

        return () => {
            window.fetch = originalFetch;
        };
    }, []);

    useEffect(() => {
        const onSessionRevoked = () => {
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('emble.auth.notice', 'Your account was logged in on another device. Please sign in again.');
            }
            clearAllAuthSessions();
            setUser(null);
            setToken(null);
            router.push('/login');
        };

        if (typeof window !== 'undefined') {
            window.addEventListener(SESSION_REVOKED_EVENT, onSessionRevoked);
        }

        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener(SESSION_REVOKED_EVENT, onSessionRevoked);
            }
        };
    }, [router]);

    const login = (newToken: string, userData: User, rememberMe = false, scopeOverride?: 'user' | 'admin') => {
        const targetScope = scopeOverride || scope;
        storeAuthSession(targetScope, newToken, userData.id, rememberMe);
        setUser(userData);
        setToken(newToken);
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem(SESSION_REVOKING_FLAG);
        }
    };

    const logout = () => {
        const activeToken = getStoredToken(scope);
        if (activeToken) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${activeToken}`,
                },
            }).catch(() => undefined);
        }
        clearAllAuthSessions();
        setUser(null);
        setToken(null);
        router.push('/login');
    };

    const contextValue = useMemo(() => ({
        user,
        login,
        logout,
        forceLogout,
        updateUser: setUser,
        isLoading,
        token,
        scope
    }), [user, isLoading, token, scope, forceLogout]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
