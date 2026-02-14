import { Suspense } from 'react';
import AuthLayout from '../../components/auth/AuthLayout';
import RegisterForm from '../../components/auth/RegisterForm';

export default function CollegeRegisterPage() {
    return (
        <AuthLayout
            role="college"
            title="Partner with Us"
            subtitle="Empower your students with industry-relevant skills and verified experience."
            themeColor="bg-slate-800"
            visual={
                <div className="mt-8 text-center bg-slate-700/50 p-6 rounded-xl border border-slate-600">
                    <span className="material-symbols-outlined text-4xl mb-2 text-blue-400">school</span>
                    <div className="font-bold text-lg">For Educational Institutions</div>
                </div>
            }
        >
            <Suspense fallback={<div>Loading...</div>}>
                <RegisterForm role="college" roleValue="college_admin" redirectPath="/dashboard/college" />
            </Suspense>
        </AuthLayout>
    );
}
