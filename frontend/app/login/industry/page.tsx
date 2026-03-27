'use client';

import { Suspense } from 'react';
import AuthLayout from '../../components/auth/AuthLayout';
import LoginForm from '../../components/auth/LoginForm';

function IndustryLoginPageContent() {
    return (
        <AuthLayout
            role="industry"
            title="Corporate Hiring Partner"
            subtitle="Access pre-vetted talent pipelines and verified simulation portfolios."
            themeColor="bg-slate-900"
            visual={
                <ul className="mt-8 space-y-4">
                    <li className="flex items-center gap-3 text-slate-300">
                        <span className="material-symbols-outlined text-white">verified</span>
                        Verified Skill Scored
                    </li>
                    <li className="flex items-center gap-3 text-slate-300">
                        <span className="material-symbols-outlined text-white">folder_shared</span>
                        Project Portfolios
                    </li>
                </ul>
            }
        >
            <LoginForm role="industry" redirectPath="/industry/dashboard" />
        </AuthLayout>
    );
}

export default function IndustryLoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500 font-semibold">Loading...</div>}>
            <IndustryLoginPageContent />
        </Suspense>
    );
}
