"use client";
import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { clearAuthSession, getStoredToken, getTokenIssuedAt, getTokenPersistent, resolveAuthScope, storeAuthSession } from '../lib/auth-storage';

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
    updateUser: (userData: User) => void;
    isLoading: boolean;
    token: string | null;
    scope: 'user' | 'admin';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [token, setToken] = useState<string | null>(null);
    const router = useRouter();
    const pathname = usePathname();
    const scope = resolveAuthScope(pathname);

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
                .then(res => {
                    if (res.ok) return res.json();
                    throw new Error('Invalid token');
                })
                .then(userData => {
                    setUser(userData);
                    if (userData?.id) {
                        storeAuthSession(scope, storedToken, userData.id, isPersistent);
                    }
                })
                .catch(() => {
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
    }, [scope]);

    const login = (newToken: string, userData: User, rememberMe = false, scopeOverride?: 'user' | 'admin') => {
        const targetScope = scopeOverride || scope;
        storeAuthSession(targetScope, newToken, userData.id, rememberMe);
        setUser(userData);
        setToken(newToken);
    };

    const logout = () => {
        clearAuthSession(scope);
        setUser(null);
        setToken(null);
        router.push('/login');
    };

    const contextValue = useMemo(() => ({
        user,
        login,
        logout,
        updateUser: setUser,
        isLoading,
        token,
        scope
    }), [user, isLoading, token, scope]);

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
