'use client';

import { fetchApi } from '../../lib/apiClient';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Loader2, Eye, EyeOff, ArrowLeft, Mail, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
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
    const rawPlan = searchParams.get('plan');
    const plan = rawPlan === 'pro_1m' ? rawPlan : undefined;
    const nextParam = searchParams.get('next');

    const safeNext =
        nextParam &&
            nextParam.startsWith('/') &&
            !nextParam.startsWith('//')
            ? nextParam
            : null;

    const resolvedRedirectPath = safeNext || redirectPath;

    // UI State
    const [step, setStep] = useState<1 | 2>(1);
    const [showPassword, setShowPassword] = useState(false);

    // Auth State
    const [isLoading, setIsLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpStatus, setOtpStatus] = useState<string | null>(null);

    const { register, handleSubmit, watch, getValues, formState: { errors } } = useForm();
    const watchedEmail = watch('email');
    const watchedPassword = watch('password') || '';

    const handleSendOtp = async (emailToUse?: string) => {
        const email = String(emailToUse || watchedEmail || '').trim();
        if (!email) {
            setOtpStatus('Enter your email first.');
            return;
        }
        setIsLoading(true);
        setOtpStatus(null);
        try {
            const response = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/auth/register/request-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to send OTP. Email may be invalid or already in use.');
            }
            setOtpSent(true);
            setStep(2);
            setOtpStatus('A verification code has been sent to your email.');
        } catch (error: any) {
            setOtpStatus(error?.message || 'Failed to send OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const submitRegistration = async (data: any) => {
        setIsLoading(true);
        try {
            const payload = { ...data, role: roleValue, subscriptionPlan: plan };
            const response = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const loginResponse = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: data.email, password: data.password }),
                });

                if (loginResponse.ok) {
                    const loginData = await loginResponse.json();
                    login(loginData.accessToken, loginData.user, false, 'user');
                    router.push(resolvedRedirectPath);
                } else {
                    const fallbackLogin = safeNext
                        ? `/login/${role}?next=${encodeURIComponent(safeNext)}`
                        : `/login/${role}`;
                    router.push(fallbackLogin);
                }
            } else {
                const errorData = await response.json();
                setOtpStatus(`Registration failed: ${errorData.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Registration error:', error);
            setOtpStatus('An error occurred during registration');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStep1Submit = async (data: any) => {
        if (role !== 'student') {
            await submitRegistration(data);
            return;
        }
        await handleSendOtp(data.email);
    };

    const handleStep2Submit = async () => {
        const data = getValues();
        const email = String(data.email || '').trim();

        if (!otp || otp.length < 6) {
            setOtpStatus('Please enter the 6-digit OTP code.');
            return;
        }

        setIsLoading(true);
        setOtpStatus(null);
        try {
            const response = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/auth/register/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Invalid OTP');
            }
            setOtpVerified(true);
            await submitRegistration(data);
        } catch (error: any) {
            setOtpStatus(error?.message || 'Invalid OTP verification code.');
            setIsLoading(false);
        }
    };

    const getButtonColor = () => {
        switch (role) {
            case 'student': return 'bg-slate-800 hover:bg-slate-900';
            case 'college': return 'bg-slate-800 hover:bg-slate-900';
            case 'industry': return 'bg-slate-900 hover:bg-black';
            default: return 'bg-primary';
        }
    };

    return (
        <>
            <div className="text-center md:text-left mb-6">
                {step === 2 && role === 'student' ? (
                    <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors font-semibold"
                    >
                        <ArrowLeft size={16} /> Back to details
                    </button>
                ) : null}
                <h2 className="text-3xl font-bold text-slate-900">
                    {step === 2 ? 'Verify Email' : 'Create Account'}
                </h2>
                <p className="text-slate-500 mt-2 font-medium">
                    {step === 2
                        ? `We've sent a code to ${watchedEmail}`
                        : `Join as a ${role}`}
                </p>
            </div>

            <form onSubmit={step === 1 ? handleSubmit(handleStep1Submit) : (e) => { e.preventDefault(); handleStep2Submit(); }} className="space-y-5">
                {step === 1 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">First Name</label>
                                <input
                                    {...register('firstName', { required: true })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-400 focus:ring-4 focus:ring-slate-200 outline-none transition-all font-medium text-slate-900"
                                    placeholder="John"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Last Name</label>
                                <input
                                    {...register('lastName', { required: true })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-400 focus:ring-4 focus:ring-slate-200 outline-none transition-all font-medium text-slate-900"
                                    placeholder="Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Email</label>
                            <input
                                {...register('email', { required: true, pattern: /^\S+@\S+$/i })}
                                type="email"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-400 focus:ring-4 focus:ring-slate-200 outline-none transition-all font-medium text-slate-900"
                                placeholder="name@example.com"
                            />
                            {errors.email && <span className="text-rose-500 text-xs mt-1.5 font-semibold flex items-center gap-1"><AlertCircle size={12} /> Please enter a valid email address</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    {...register('password', {
                                        required: 'Password is required',
                                        pattern: {
                                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/,
                                            message: 'Password must include uppercase, lowercase, number, and symbol'
                                        }
                                    })}
                                    type={showPassword ? 'text' : 'password'}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-400 focus:ring-4 focus:ring-slate-200 outline-none transition-all font-medium text-slate-900"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff strokeWidth={2.5} size={18} /> : <Eye strokeWidth={2.5} size={18} />}
                                </button>
                            </div>
                            {errors.password && <span className="text-rose-500 text-xs mt-1.5 font-semibold flex items-center gap-1"><AlertCircle size={12} /> {(errors.password.message as string) || 'Invalid password'}</span>}
                            
                            <div className="mt-2.5 space-y-1.5 bg-slate-100/50 p-3 rounded-lg border border-slate-100">
                                <p className="text-xs font-semibold text-slate-600 mb-2">Password must contain:</p>
                                <p className={`text-xs flex items-center gap-1.5 font-medium transition-colors ${watchedPassword.length >= 8 ? 'text-emerald-600' : 'text-slate-500'}`}>
                                    <CheckCircle2 size={14} className={`transition-opacity ${watchedPassword.length >= 8 ? "opacity-100 text-emerald-500" : "opacity-40"}`} /> At least 8 characters
                                </p>
                                <p className={`text-xs flex items-center gap-1.5 font-medium transition-colors ${/[A-Z]/.test(watchedPassword) ? 'text-emerald-600' : 'text-slate-500'}`}>
                                    <CheckCircle2 size={14} className={`transition-opacity ${/[A-Z]/.test(watchedPassword) ? "opacity-100 text-emerald-500" : "opacity-40"}`} /> One uppercase letter
                                </p>
                                <p className={`text-xs flex items-center gap-1.5 font-medium transition-colors ${/[a-z]/.test(watchedPassword) ? 'text-emerald-600' : 'text-slate-500'}`}>
                                    <CheckCircle2 size={14} className={`transition-opacity ${/[a-z]/.test(watchedPassword) ? "opacity-100 text-emerald-500" : "opacity-40"}`} /> One lowercase letter
                                </p>
                                <p className={`text-xs flex items-center gap-1.5 font-medium transition-colors ${/\d/.test(watchedPassword) ? 'text-emerald-600' : 'text-slate-500'}`}>
                                    <CheckCircle2 size={14} className={`transition-opacity ${/\d/.test(watchedPassword) ? "opacity-100 text-emerald-500" : "opacity-40"}`} /> One number
                                </p>
                                <p className={`text-xs flex items-center gap-1.5 font-medium transition-colors ${/[^A-Za-z\d]/.test(watchedPassword) ? 'text-emerald-600' : 'text-slate-500'}`}>
                                    <CheckCircle2 size={14} className={`transition-opacity ${/[^A-Za-z\d]/.test(watchedPassword) ? "opacity-100 text-emerald-500" : "opacity-40"}`} /> One special character
                                </p>
                            </div>
                        </div>

                        {otpStatus && (
                            <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 bg-rose-50 text-rose-700 border border-rose-200`}>
                                <AlertCircle size={16} /> {otpStatus}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full text-white py-3.5 mt-2 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm shadow-slate-200 hover:shadow-md hover:-translate-y-0.5 ${getButtonColor()}`}
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : (role === 'student' ? 'Continue' : 'Create Account')}
                        </button>
                    </div>
                )}

                {step === 2 && role === 'student' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 flex gap-3 items-start">
                            <Mail className="text-slate-700 shrink-0 mt-0.5" size={20} />
                            <div>
                                <h4 className="text-sm font-bold text-slate-900">Verification Code Sent</h4>
                                <p className="text-xs font-medium text-slate-900 mt-1 leading-relaxed">
                                    Please enter the 6-digit code sent to <strong>{watchedEmail}</strong>. Check your spam folder if you can't find it.
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">One-Time Password (OTP)</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full px-4 py-3 text-center text-xl tracking-[0.5em] rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-400 focus:ring-4 focus:ring-slate-200 outline-none transition-all font-bold text-slate-900"
                                placeholder="------"
                                maxLength={6}
                                autoFocus
                            />
                        </div>

                        {otpStatus && (
                            <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${otpStatus.includes('sent') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                                {otpStatus.includes('sent') ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                {otpStatus}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || otp.length < 6}
                            className={`w-full text-white py-3.5 mt-2 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm shadow-slate-200 hover:shadow-md hover:-translate-y-0.5 ${getButtonColor()} disabled:opacity-50 disabled:hover:translate-y-0`}
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <><ShieldCheck size={20} /> Verify & Create Account</>}
                        </button>

                        <div className="pt-6 mt-6 border-t border-slate-100 text-center">
                            <p className="text-sm text-slate-500 font-medium mb-4">Didn't receive the code?</p>
                            <button
                                type="button"
                                onClick={() => handleSendOtp(watchedEmail)}
                                disabled={isLoading}
                                className="w-full bg-white border border-slate-200 rounded-xl py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                            >
                                Resend OTP
                            </button>
                        </div>
                    </div>
                )}
            </form>

            <p className="text-center text-sm text-slate-500 mt-8 font-medium">
                Already have an account?{' '}
                <Link
                    href={safeNext ? `/login/${role}?next=${encodeURIComponent(safeNext)}` : `/login/${role}`}
                    className={`font-bold hover:underline ${role === 'student' ? 'text-slate-800' : 'text-slate-900'}`}
                >
                    Sign in
                </Link>
            </p>
        </>
    );
}
