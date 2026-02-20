'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface RegisterFormProps {
    role: 'student' | 'college' | 'industry';
    roleValue: string; // 'student', 'college_admin', 'company_admin'
    redirectPath: string;
}

export default function RegisterForm({ role, roleValue, redirectPath }: RegisterFormProps) {
    const { login } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const plan = searchParams.get('plan');
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            const payload = { ...data, role: roleValue, subscriptionPlan: plan };

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const userData = await response.json();

                // Auto-login logic (if backend returns token on register, or we call login)
                // For now, redirect to login with pre-filled email? 
                // Better UX: Auto-login. Let's assume we need to call login endpoint.

                const loginResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: data.email, password: data.password }),
                });

                    if (loginResponse.ok) {
                        const loginData = await loginResponse.json();
                        login(loginData.accessToken, loginData.user);
                        if (loginData.user?.collegeId) {
                            localStorage.setItem('collegeId', loginData.user.collegeId);
                        } else {
                            localStorage.removeItem('collegeId');
                        }
                        // Redirect to dashboard (or specific onboarding)
                        router.push(redirectPath);
                    } else {
                        router.push(`/login/${role}`);
                    }
            } else {
                const errorData = await response.json();
                alert(`Registration failed: ${errorData.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('An error occurred during registration');
        } finally {
            setIsLoading(false);
        }
    };

    const getButtonColor = () => {
        switch (role) {
            case 'student': return 'bg-indigo-600 hover:bg-indigo-700';
            case 'college': return 'bg-slate-800 hover:bg-slate-900';
            case 'industry': return 'bg-slate-900 hover:bg-black';
            default: return 'bg-primary';
        }
    };

    return (
        <>
            <div className="text-center md:text-left">
                <h2 className="text-3xl font-bold text-slate-900">Create Account</h2>
                <p className="text-slate-500 mt-2">Join as a {role}</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                        <input
                            {...register('firstName', { required: true })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            placeholder="John"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                        <input
                            {...register('lastName', { required: true })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            placeholder="Doe"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                    <input
                        {...register('email', { required: true })}
                        type="email"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        placeholder="name@example.com"
                    />
                    {errors.email && <span className="text-red-500 text-xs mt-1">Email is required</span>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                    <input
                        {...register('password', { required: true })}
                        type="password"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        placeholder="••••••••"
                    />
                    {errors.password && <span className="text-red-500 text-xs mt-1">Password is required</span>}
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full text-white py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${getButtonColor()}`}
                >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
                </button>
            </form>

            <p className="text-center text-sm text-slate-500">
                Already have an account?{' '}
                <Link href={`/login/${role}`} className={`font-bold hover:underline ${role === 'student' ? 'text-indigo-600' : 'text-slate-900'}`}>
                    Sign in
                </Link>
            </p>
        </>
    );
}
