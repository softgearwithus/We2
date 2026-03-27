'use client';

import { Suspense } from 'react';
import AuthLayout from '../../components/auth/AuthLayout';
import LoginForm from '../../components/auth/LoginForm';

function SecureAdminLoginPageContent() {
    return (
        <AuthLayout
            role="admin"
            title="SYSTEM_ROOT"
            subtitle="AUTHORIZED_PERSONNEL_ONLY. Access logged and monitored."
            themeColor="bg-black"
            visual={
                <div className="mt-8 font-mono text-green-500 bg-green-900/10 p-4 rounded border border-green-900/50">
                    <div>$ sys_check_integrity</div>
                    <div className="text-green-300">Status: SECURE</div>
                    <div className="mt-2">$ verify_access_token</div>
                    <div className="animate-pulse">_</div>
                </div>
            }
        >
            <LoginForm role="admin" redirectPath="/admin/students" />
        </AuthLayout>
    );
}

export default function SecureAdminLoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500 font-semibold">Loading...</div>}>
            <SecureAdminLoginPageContent />
        </Suspense>
    );
}
