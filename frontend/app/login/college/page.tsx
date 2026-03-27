'use client';

import { Suspense } from 'react';
import AuthLayout from '../../components/auth/AuthLayout';
import LoginForm from '../../components/auth/LoginForm';

function CollegeLoginPageContent() {
    return (
        <AuthLayout
            role="college"
            title="Institutional Access"
            subtitle="Track your students' performance and manage corporate partnerships efficiently."
            themeColor="bg-slate-800"
            visual={
                <div className="mt-8 p-4 bg-white/10 rounded-xl border border-white/10 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="material-symbols-outlined text-emerald-400">trending_up</span>
                        <span className="font-bold">Placement Stats</span>
                    </div>
                    <div className="text-2xl font-bold">94% Success Rate</div>
                    <div className="text-sm text-slate-300">Across 5 departments</div>
                </div>
            }
        >
            <LoginForm role="college" redirectPath="/institute/dashboard" />
        </AuthLayout>
    );
}

export default function CollegeLoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500 font-semibold">Loading...</div>}>
            <CollegeLoginPageContent />
        </Suspense>
    );
}
