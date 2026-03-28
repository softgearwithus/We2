import Link from 'next/link';
import AuthLayout from '../../components/auth/AuthLayout';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export default function IndustryRegisterPage() {
    return (
        <AuthLayout
            role="industry"
            title="Organization Access"
            subtitle="Company and institute onboarding is handled by EMBLE admins to keep partner access secure."
            themeColor="bg-slate-900"
            visual={
                <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
                        <div className="text-3xl font-bold">100%</div>
                        <div className="text-xs text-slate-400">Admin Provisioned</div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
                        <div className="text-3xl font-bold">24h</div>
                        <div className="text-xs text-slate-400">Typical Setup Window</div>
                    </div>
                </div>
            }
        >
            <div className="space-y-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
                    <ShieldCheck size={18} className="mt-0.5 shrink-0" />
                    <p className="text-sm font-medium leading-relaxed">
                        Public registration is available for students only. Company access is created by platform admins after partnership verification.
                    </p>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-slate-900">Need a company account?</h2>
                    <p className="text-sm text-slate-600">
                        Share your hiring requirements and team contact details. We will provision your dashboard after approval.
                    </p>
                </div>

                <Link
                    href="/contact"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-black"
                >
                    Request Partner Onboarding
                    <ArrowRight size={16} />
                </Link>

                <p className="text-center text-sm text-slate-500">
                    Already onboarded? <Link href="/login/industry" className="font-semibold text-slate-800 hover:underline">Sign in</Link>
                </p>
            </div>
        </AuthLayout>
    );
}
