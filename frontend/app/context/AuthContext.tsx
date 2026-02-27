"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

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
    login: (token: string, userData: User, rememberMe?: boolean) => void;
    logout: () => void;
    updateUser: (userData: User) => void;
    isLoading: boolean;
    token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [token, setToken] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Check for existing token on mount
        const token = localStorage.getItem('accessToken');
        const issuedAt = localStorage.getItem('accessTokenSetAt');
        const isPersistent = localStorage.getItem('accessTokenPersistent') === 'true';
        if (issuedAt) {
            // 7 days if "Remember Me" vs 1 day (or session) default
            const maxAgeMs = isPersistent ? 1000 * 60 * 60 * 24 * 7 : 1000 * 60 * 60 * 24;
            if (Date.now() - parseInt(issuedAt, 10) > maxAgeMs) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('accessTokenSetAt');
                localStorage.removeItem('accessTokenPersistent');
            }
        }
        if (token) {
            setToken(token);
            // Validate token or fetch user profile
            fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/users/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(res => {
                    if (res.ok) return res.json();
                    throw new Error('Invalid token');
                })
                .then(userData => {
                    setUser(userData);
                    if (userData?.id) {
                        localStorage.setItem('userId', userData.id);
                    }
                })
                .catch(() => {
                    localStorage.removeItem('accessToken');
                    setUser(null);
                    setToken(null);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = (newToken: string, userData: User, rememberMe = false) => {
        localStorage.setItem('accessToken', newToken);
        localStorage.setItem('accessTokenSetAt', String(Date.now()));
        if (rememberMe) {
            localStorage.setItem('accessTokenPersistent', 'true');
        } else {
            localStorage.removeItem('accessTokenPersistent');
        }
        localStorage.setItem('userId', userData.id);
        setUser(userData);
        setToken(newToken);
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('accessTokenSetAt');
        localStorage.removeItem('accessTokenPersistent');
        localStorage.removeItem('userId');
        setUser(null);
        setToken(null);
        router.push('/login');
    };

    const contextValue = React.useMemo(() => ({
        user,
        login,
        logout,
        updateUser: setUser,
        isLoading,
        token
    }), [user, isLoading, token]);

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
