'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, KeyRound, ShieldCheck } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [identifier, setIdentifier] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [requesting, setRequesting] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [otpRequested, setOtpRequested] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const requestOtpInternal = async () => {
        setError(null);
        setMessage(null);

        if (!identifier.trim()) {
            setError('Please enter your email or credential ID.');
            return;
        }

        setRequesting(true);
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/password/forgot/request-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier: identifier.trim() }),
            });

            setOtpRequested(true);
            setMessage('If this student account exists, an OTP has been sent to the registered email.');
        } catch {
            setError('Could not request OTP right now. Please try again.');
        } finally {
            setRequesting(false);
        }
    };

    const requestOtp = async (event: FormEvent) => {
        event.preventDefault();
        await requestOtpInternal();
    };

    const resetPassword = async (event: FormEvent) => {
        event.preventDefault();
        setError(null);
        setMessage(null);

        if (!identifier.trim() || !otp.trim() || !newPassword || !confirmPassword) {
            setError('Please fill in all fields.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('New password and confirm password must match.');
            return;
        }

        setResetting(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/password/forgot/reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identifier: identifier.trim(),
                    otp: otp.trim(),
                    newPassword,
                }),
            });

            if (!response.ok) {
                const payload = await response.json().catch(() => null);
                const apiMessage = payload?.message;
                if (Array.isArray(apiMessage) && apiMessage.length > 0) {
                    setError(String(apiMessage[0]));
                } else if (typeof apiMessage === 'string') {
                    setError(apiMessage);
                } else {
                    setError('Unable to reset password. Please verify the OTP and try again.');
                }
                return;
            }

            setMessage('Password reset successful. Redirecting to student login...');
            setTimeout(() => router.push('/login/student'), 1200);
        } catch {
            setError('Could not reset password right now. Please try again.');
        } finally {
            setResetting(false);
        }
    };

    return (
        <AuthLayout
            role="student"
            title="Account Recovery"
            subtitle="Regain access to your learning ecosystem. Enter your credentials to receive a secure OTP."
            themeColor="bg-indigo-600"
            visual={
                <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-full bg-brand-orange/20 flex items-center justify-center text-brand-orange border border-brand-orange/30">
                            <KeyRound size={24} />
                        </div>
                        <div>
                            <p className="text-white font-bold text-lg">Secure Recovery</p>
                            <p className="text-white/60 text-sm">We ensure your data stays safe.</p>
                        </div>
                    </div>

                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">Security Status</span>
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                                <ShieldCheck size={16} /> Protected
                            </span>
                        </div>
                        <p className="text-xs text-white/50 leading-relaxed">
                            A one-time password will be sent to your registered academic email or personal identifier.
                        </p>
                    </div>
                </div>
            }
        >
            <div className="w-full">
                <div className="mb-8 hidden lg:block">
                    <h1 className="text-2xl font-black text-slate-900 mb-2">Forgot Password</h1>
                    <p className="text-sm text-slate-500 font-medium">
                        Student account recovery using email OTP.
                    </p>
                </div>

                {!otpRequested ? (
                    <form onSubmit={requestOtp} className="space-y-5">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">Email or Credential ID</label>
                            <input
                                type="text"
                                value={identifier}
                                onChange={(event) => setIdentifier(event.target.value)}
                                placeholder="student@example.com or UID"
                                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={requesting}
                            className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
                        >
                            {requesting ? <Loader2 size={18} className="animate-spin" /> : 'Send Reset Code'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={resetPassword} className="space-y-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">Email or Credential ID</label>
                            <input
                                type="text"
                                value={identifier}
                                onChange={(event) => setIdentifier(event.target.value)}
                                className="w-full px-4 py-3 placeholder-slate-400 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">Verification Code (OTP)</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(event) => setOtp(event.target.value)}
                                placeholder="Enter 6-digit code"
                                className="w-full px-4 py-3 placeholder-slate-400 rounded-xl border border-slate-200 outline-none focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/10 transition-all font-medium tracking-widest"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(event) => setNewPassword(event.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 placeholder-slate-400 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700">Confirm New Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 placeholder-slate-400 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={requestOtpInternal}
                                disabled={requesting}
                                className="w-1/3 h-12 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 font-bold rounded-xl transition-all"
                            >
                                Resend
                            </button>
                            <button
                                type="submit"
                                disabled={resetting}
                                className="w-2/3 h-12 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
                            >
                                {resetting ? <Loader2 size={18} className="animate-spin" /> : 'Confirm Reset'}
                            </button>
                        </div>
                    </form>
                )}

                {message && (
                    <div className="mt-6 p-4 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-xl border border-emerald-100 flex items-start gap-3">
                        <ShieldCheck size={20} className="shrink-0 text-emerald-500" />
                        <p>{message}</p>
                    </div>
                )}
                
                {error && (
                    <div className="mt-6 p-4 bg-red-50 text-red-700 text-sm font-medium rounded-xl border border-red-100">
                        {error}
                    </div>
                )}

                <div className="mt-6 text-center">
                    <Link href="/login/student" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
                        ← Back to Student Login
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
}

