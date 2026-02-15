"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    email: string;
    role: string;
    subscriptionPlan?: string;
    subscriptionStatus?: string;
    subscriptionEndDate?: string;
    firstName?: string | null;
    lastName?: string | null;
}

interface AuthContextType {
    user: User | null;
    login: (token: string, userData: User) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check for existing token on mount
        const token = localStorage.getItem('accessToken');
        const issuedAt = localStorage.getItem('accessTokenSetAt');
        if (issuedAt) {
            const maxAgeMs = 1000 * 60 * 60 * 24 * 7;
            if (Date.now() - parseInt(issuedAt, 10) > maxAgeMs) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('accessTokenSetAt');
            }
        }
        if (token) {
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
                })
                .catch(() => {
                    localStorage.removeItem('accessToken');
                    setUser(null);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = (token: string, userData: User) => {
        localStorage.setItem('accessToken', token);
        localStorage.setItem('accessTokenSetAt', String(Date.now()));
        setUser(userData);
        router.push('/dashboard');
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('accessTokenSetAt');
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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
