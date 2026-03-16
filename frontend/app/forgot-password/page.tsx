'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

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
        <div className="min-h-screen bg-white flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-lg p-6 space-y-6">
                <div className="space-y-2">
                    <h1 className="text-2xl font-black text-slate-900">Forgot Password</h1>
                    <p className="text-sm text-slate-500">
                        Student account recovery using email OTP.
                    </p>
                </div>

                {!otpRequested ? (
                    <form onSubmit={requestOtp} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Email or Credential ID</label>
                            <input
                                type="text"
                                value={identifier}
                                onChange={(event) => setIdentifier(event.target.value)}
                                placeholder="student@example.com or UID"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={requesting}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
                        >
                            {requesting ? <Loader2 size={18} className="animate-spin" /> : 'Send OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={resetPassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Email or Credential ID</label>
                            <input
                                type="text"
                                value={identifier}
                                onChange={(event) => setIdentifier(event.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">OTP</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(event) => setOtp(event.target.value)}
                                placeholder="6-digit code"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(event) => setNewPassword(event.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={requestOtpInternal}
                                disabled={requesting}
                                className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl"
                            >
                                Resend
                            </button>
                            <button
                                type="submit"
                                disabled={resetting}
                                className="w-2/3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
                            >
                                {resetting ? <Loader2 size={18} className="animate-spin" /> : 'Reset Password'}
                            </button>
                        </div>
                    </form>
                )}

                {message && <p className="text-sm text-emerald-600 font-medium">{message}</p>}
                {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

                <Link href="/login/student" className="inline-block text-sm text-indigo-600 hover:underline font-medium">
                    Back to student login
                </Link>
            </div>
        </div>
    );
}
