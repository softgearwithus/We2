'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:3001/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                router.push('/login');
            } else {
                alert('Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('An error occurred during registration');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
            <div className="hidden md:flex flex-col justify-center p-12 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                <div className="relative z-10 max-w-lg">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-8">
                        <span className="material-symbols-outlined text-3xl">rocket_launch</span>
                    </div>
                    <h2 className="text-4xl font-bold mb-6">Start Your Career</h2>
                    <p className="text-slate-400 text-lg leading-relaxed mb-8">
                        Join the definitive industry simulation platform. Build a portfolio that speaks louder than your resume.
                    </p>
                    <ul className="space-y-4">
                        <li className="flex items-center gap-3 text-slate-300">
                            <span className="material-symbols-outlined text-green-400">check_circle</span>
                            Access 21-day simulation cycles
                        </li>
                        <li className="flex items-center gap-3 text-slate-300">
                            <span className="material-symbols-outlined text-green-400">check_circle</span>
                            AI-powered mentorship
                        </li>
                        <li className="flex items-center gap-3 text-slate-300">
                            <span className="material-symbols-outlined text-green-400">check_circle</span>
                            Verified industrial certificate
                        </li>
                    </ul>
                </div>
            </div>

            <div className="flex flex-col justify-center p-8 md:p-12 lg:p-20 bg-white">
                <div className="max-w-md w-full mx-auto space-y-8">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-bold text-slate-900">Create Account</h2>
                        <p className="text-slate-500 mt-2">Begin your professional journey today</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                                {...register('password', { required: true, minLength: 8 })}
                                type="password"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="Min 8 characters"
                            />
                            {errors.password && <span className="text-red-500 text-xs mt-1">Password must be at least 8 chars</span>}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-slate-900 text-white py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-500">
                        Already have an account?{' '}
                        <Link href="/login" className="font-bold text-primary hover:text-primary-light">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
