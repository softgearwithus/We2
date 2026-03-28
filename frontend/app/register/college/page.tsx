import Link from 'next/link';
import AuthLayout from '../../components/auth/AuthLayout';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export default function CollegeRegisterPage() {
    return (
        <AuthLayout
            role="college"
            title="Institute Access"
            subtitle="College dashboards are provisioned by EMBLE admins for verified institutions."
            themeColor="bg-slate-800"
            visual={
                <div className="mt-8 text-center bg-slate-700/50 p-6 rounded-xl border border-slate-600">
                    <span className="material-symbols-outlined text-4xl mb-2 text-blue-400">school</span>
                    <div className="font-bold text-lg">For Educational Institutions</div>
                </div>
            }
        >
            <div className="space-y-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
                    <ShieldCheck size={18} className="mt-0.5 shrink-0" />
                    <p className="text-sm font-medium leading-relaxed">
                        Public registration is available for students only. College admin access is created after institutional verification.
                    </p>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-slate-900">Need an institute account?</h2>
                    <p className="text-sm text-slate-600">
                        Share your institution details and expected onboarding size. Our team will provision your college admin credentials.
                    </p>
                </div>

                <Link
                    href="/contact"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-3 font-semibold text-white transition hover:bg-slate-900"
                >
                    Request Institute Onboarding
                    <ArrowRight size={16} />
                </Link>

                <p className="text-center text-sm text-slate-500">
                    Already onboarded? <Link href="/login/college" className="font-semibold text-slate-800 hover:underline">Sign in</Link>
                </p>
            </div>
        </AuthLayout>
    );
}
