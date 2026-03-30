'use client';

import { fetchApi } from '../../lib/apiClient';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthNotice from './AuthNotice';

interface LoginFormProps {
    role: 'student' | 'college' | 'industry' | 'admin';
    redirectPath: string;
}

export default function LoginForm({ role, redirectPath }: LoginFormProps) {
    const { login } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const { register, handleSubmit, setValue, formState: { errors } } = useForm();

    const nextParam = searchParams.get('next');
    const safeNext =
        nextParam &&
            nextParam.startsWith('/') &&
            !nextParam.startsWith('//')
            ? nextParam
            : null;
    const resolvedRedirectPath = safeNext || redirectPath;

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            // In a real app with strict role checks, we might want to validate the role here or in backend
            const roleMap: Record<string, string> = {
                student: 'student',
                college: 'college_admin',
                industry: 'company_admin',
                admin: 'super_admin',
            };

            const response = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: data.email,
                    password: data.password,
                    role: roleMap[role],
                    rememberMe: rememberMe,
                }),
            });

            const isDev = process.env.NODE_ENV !== 'production';
            // Mock bypass only in development
            if (!response.ok) {
                if (isDev && role === 'admin' && data.email === 'admin@emble.in' && data.password === 'admin') {
                    login('MOCK_TOKEN_ADMIN', { email: 'admin@emble.in', role: 'super_admin', name: 'Super Admin' } as any, rememberMe, 'admin');
                    router.push(resolvedRedirectPath);
                    return;
                }
                if (isDev && role === 'college' && data.email === 'college@emble.in' && data.password === 'college') {
                    login('MOCK_TOKEN_COLLEGE', { email: 'college@emble.in', role: 'college_admin', name: 'Mock College' } as any, rememberMe, 'user');
                    router.push(resolvedRedirectPath);
                    return;
                }
                if (isDev && role === 'industry' && data.email === 'company@emble.in' && data.password === 'company') {
                    login('MOCK_TOKEN_INDUSTRY', { email: 'company@emble.in', role: 'company_admin', name: 'Mock Company' } as any, rememberMe, 'user');
                    router.push(resolvedRedirectPath);
                    return;
                }
            }

            if (response.ok) {
                const result = await response.json();
                const allowedRoles = role === 'college'
                    ? [roleMap[role], 'mentor', 'student']
                    : [roleMap[role]];
                if (!allowedRoles.includes(result.user.role) && role !== 'admin') {
                    alert(`Access Denied: This portal is for ${role}s only.`);
                    setIsLoading(false);
                    return;
                }

                const scope = role === 'admin' ? 'admin' : 'user';
                login(result.accessToken, result.user, rememberMe, scope);
                router.push(resolvedRedirectPath);
            } else {
                alert('Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred during login');
        } finally {
            setIsLoading(false);
        }
    };

    const getButtonColor = () => {
        switch (role) {
            case 'student': return 'bg-slate-800 hover:bg-slate-900';
            case 'college': return 'bg-slate-800 hover:bg-slate-900';
            case 'industry': return 'bg-slate-900 hover:bg-black';
            case 'admin': return 'bg-green-600 hover:bg-green-700 font-mono'; // Matrix style
            default: return 'bg-primary';
        }
    };

    return (
        <>
            <AuthNotice />

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <label className={`block text-sm font-medium mb-2 ${role === 'admin' ? 'font-mono text-green-700' : 'text-slate-700'}`}>Email</label>
                    <input
                        {...register('email', { required: true })}
                        type="email"
                        className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${role === 'admin' ? 'bg-black border-green-800 text-green-500 font-mono focus:border-green-500' : 'border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20'}`}
                        placeholder="name@example.com"
                    />
                    {errors.email && <span className="text-red-500 text-xs mt-1">Email is required</span>}
                </div>

                <div>
                    <label className={`block text-sm font-medium mb-2 ${role === 'admin' ? 'font-mono text-green-700' : 'text-slate-700'}`}>Password</label>
                    <div className="relative">
                        <input
                            {...register('password', { required: true })}
                            type={showPassword ? 'text' : 'password'}
                            className={`w-full px-4 py-3 rounded-xl border outline-none transition-all pr-12 ${role === 'admin' ? 'bg-black border-green-800 text-green-500 font-mono focus:border-green-500' : 'border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20'}`}
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className={`absolute right-4 top-1/2 -translate-y-1/2 p-1 transition-colors ${role === 'admin' ? 'text-green-700 hover:text-green-500' : 'text-slate-400 hover:text-slate-600'}`}
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff strokeWidth={2.5} size={18} /> : <Eye strokeWidth={2.5} size={18} />}
                        </button>
                    </div>
                    {errors.password && <span className="text-red-500 text-xs mt-1">Password is required</span>}
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className={`w-4 h-4 rounded border-slate-300 focus:ring-primary ${role === 'admin' ? 'text-green-600' : 'text-primary'}`}
                        />
                        <span className="text-sm text-slate-600">Remember me</span>
                    </label>
                    <Link href={role === 'student' ? '/forgot-password' : '#'} className={`text-sm font-medium hover:underline ${role === 'admin' ? 'text-green-600' : 'text-primary'}`}>
                        Forgot password?
                    </Link>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full text-white py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${getButtonColor()}`}
                >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
                </button>
            </form>

            {role !== 'admin' && (
                <p className="text-center text-sm text-slate-500">
                    Don't have an account?{' '}
                    <Link
                        href={safeNext ? `/register?next=${encodeURIComponent(safeNext)}` : '/register'}
                        className={`font-bold hover:underline ${role === 'student' ? 'text-slate-800' : 'text-slate-900'}`}
                    >
                        Get Started
                    </Link>
                </p>
            )}
        </>
    );
}
