'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

interface LoginFormProps {
    role: 'student' | 'college' | 'industry' | 'admin';
    redirectPath: string;
}

export default function LoginForm({ role, redirectPath }: LoginFormProps) {
    const { login } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            // In a real app with strict role checks, we might want to validate the role here or in backend
            const response = await fetch('http://localhost:3001/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                const result = await response.json();
                // Optional: Check if the returned user role matches the intended portal role
                if (result.user.role !== role && role !== 'admin') {
                    // Allow admin to potentially login locally if needed, or stick to strict checking
                    alert(`Access Denied: This portal is for ${role}s only.`);
                    setIsLoading(false);
                    return;
                }

                login(result.accessToken, result.user);
                router.push(redirectPath);
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
            case 'student': return 'bg-indigo-600 hover:bg-indigo-700';
            case 'college': return 'bg-slate-800 hover:bg-slate-900';
            case 'industry': return 'bg-slate-900 hover:bg-black';
            case 'admin': return 'bg-green-600 hover:bg-green-700 font-mono'; // Matrix style
            default: return 'bg-primary';
        }
    };

    return (
        <>
            <div className="text-center md:text-left">
                <h2 className={`text-3xl font-bold ${role === 'admin' ? 'font-mono text-green-600' : 'text-slate-900'}`}>Sign in</h2>
                <p className="text-slate-500 mt-2">Access your {role} dashboard</p>
            </div>

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
                    <input
                        {...register('password', { required: true })}
                        type="password"
                        className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${role === 'admin' ? 'bg-black border-green-800 text-green-500 font-mono focus:border-green-500' : 'border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20'}`}
                        placeholder="••••••••"
                    />
                    {errors.password && <span className="text-red-500 text-xs mt-1">Password is required</span>}
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className={`w-4 h-4 rounded border-slate-300 focus:ring-primary ${role === 'admin' ? 'text-green-600' : 'text-primary'}`} />
                        <span className="text-sm text-slate-600">Remember me</span>
                    </label>
                    <Link href="#" className={`text-sm font-medium hover:underline ${role === 'admin' ? 'text-green-600' : 'text-primary'}`}>
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
                    <Link href="/register" className={`font-bold hover:underline ${role === 'student' ? 'text-indigo-600' : 'text-slate-900'}`}>
                        Get Started
                    </Link>
                </p>
            )}
        </>
    );
}
