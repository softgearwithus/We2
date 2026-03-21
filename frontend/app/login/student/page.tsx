'use client';

import AuthLayout from '../../components/auth/AuthLayout';
import LoginForm from '../../components/auth/LoginForm';
import { CheckCircle2, TrendingUp } from 'lucide-react';

export default function StudentLoginPage() {
    return (
        <>
            <h1 className="sr-only">Student Login - Emble: Access India's First Integrated AI Placement Ecosystem Hub for DSA, SQL, and Industrial Projects</h1>
            <AuthLayout
            role="student"
            title="Student Portal"
            subtitle="Master real-world workflows. Your AI mentor has prepared new challenges for today's sprint."
            themeColor="bg-slate-800"
            visual={
                <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-white font-bold text-lg">Top 1% Performer</p>
                            <p className="text-white/60 text-sm">Your consistency is paying off.</p>
                        </div>
                    </div>

                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Daily Streak</span>
                            <span className="text-white font-bold">12 Days 🔥</span>
                        </div>
                        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-brand-orange h-full w-3/4 rounded-full" />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-white/80">
                        <CheckCircle2 size={16} className="text-emerald-400" />
                        <span>Mock Interview scheduled for 2:00 PM</span>
                    </div>
                </div>
            }
        >
            <LoginForm role="student" redirectPath="/dashboard" />
        </AuthLayout>
        </>
    );
}
