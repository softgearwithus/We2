import { Suspense } from 'react';
import AuthLayout from '../../components/auth/AuthLayout';
import RegisterForm from '../../components/auth/RegisterForm';
import { Rocket, Users, Code2 } from 'lucide-react';

export default function StudentRegisterPage() {
    return (
        <AuthLayout
            role="student"
            title="Start Your Journey"
            subtitle="Join thousands of students launching their careers through simulation."
            themeColor="bg-slate-800"
            visual={
                <div className="space-y-6">
                    <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-sm border border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-10">
                            <Code2 size={64} />
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-2 flex items-center gap-2">
                            <Rocket size={12} />
                            Next Sprint Starting
                        </div>
                        <div className="font-black text-2xl text-white mb-4">Full Stack Development</div>

                        <div className="flex -space-x-3 mb-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 border-2 border-slate-900/50 text-xs flex items-center justify-center font-bold shadow-lg">
                                    <img loading="lazy" decoding="async" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="user" className="w-full h-full rounded-full" />
                                </div>
                            ))}
                            <div className="w-9 h-9 rounded-full bg-white text-slate-800 border-2 border-slate-900/50 text-[10px] flex items-center justify-center font-black shadow-lg">
                                +40
                            </div>
                        </div>
                        <div className="text-xs text-slate-200 font-medium">
                            Join your cohort and build <span className="text-white font-bold">Netflix Clone</span> this week.
                        </div>
                    </div>
                </div>
            }
        >
            <Suspense fallback={<div>Loading...</div>}>
                <RegisterForm role="student" roleValue="student" redirectPath="/dashboard" />
            </Suspense>
        </AuthLayout>
    );
}
