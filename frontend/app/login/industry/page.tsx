'use client';

import AuthLayout from '../../components/auth/AuthLayout';
import Link from 'next/link';

export default function IndustryLoginPage() {
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
            <div className="text-center md:text-left space-y-6">
                <h2 className="text-3xl font-bold text-slate-900">Invite-only access</h2>
                <p className="text-slate-500">
                    Industry accounts are provisioned by our team. Request access and we will set up your dashboard.
                </p>
                <Link
                    href="/contact"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-black transition-colors"
                >
                    Contact Sales
                </Link>
            </div>
        </AuthLayout>
    );
}
