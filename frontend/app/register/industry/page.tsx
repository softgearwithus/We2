import { Suspense } from 'react';
import AuthLayout from '../../components/auth/AuthLayout';
import RegisterForm from '../../components/auth/RegisterForm';

export default function IndustryRegisterPage() {
    return (
        <AuthLayout
            role="industry"
            title="Hire Verified Talent"
            subtitle="Stop filtering resumes. Start seeing skills in action."
            themeColor="bg-slate-900"
            visual={
                <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
                        <div className="text-3xl font-bold">3x</div>
                        <div className="text-xs text-slate-400">Faster Hiring</div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
                        <div className="text-3xl font-bold">0%</div>
                        <div className="text-xs text-slate-400">Placement Fee</div>
                    </div>
                </div>
            }
        >
            <Suspense fallback={<div>Loading...</div>}>
                <RegisterForm role="industry" roleValue="company_admin" redirectPath="/dashboard/industry" />
            </Suspense>
        </AuthLayout>
    );
}
