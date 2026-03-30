import { ReactNode } from 'react';
import Link from 'next/link';

interface AuthLayoutProps {
    children: ReactNode;
    title: string;
    subtitle: string;
    role: 'student' | 'college' | 'industry' | 'admin';
    visual?: ReactNode;
    themeColor?: string;
}

export default function AuthLayout({ children, title, subtitle, role }: AuthLayoutProps) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 selection:bg-brand-orange selection:text-white relative overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-full max-w-[800px] h-[800px] bg-brand-orange/5 rounded-full blur-[120px] -mr-64 -mt-64" />
                <div className="absolute bottom-0 left-0 w-full max-w-[800px] h-[800px] bg-slate-500/5 rounded-full blur-[120px] -ml-64 -mb-64" />
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, black 1px, transparent 0)`,
                    backgroundSize: '32px 32px'
                }} />
            </div>

            <div className="relative z-10 w-full max-w-md animate-fade-in-up">
                {/* Logo Area */}
                <div className="flex justify-center mb-8">
                    <Link href="/" className="flex items-center gap-3 group">
                        <span className="font-black text-3xl text-brand-black tracking-tight">EMBLE</span>
                    </Link>
                </div>
                
                {/* Centered Card */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-10 relative overflow-hidden">
                    {/* Subtle top border gradient for role differentiation */}
                    <div className={`absolute top-0 left-0 w-full h-1 ${
                        role === 'student' ? 'bg-gradient-to-r from-violet-500 to-indigo-500' :
                        role === 'college' ? 'bg-gradient-to-r from-teal-500 to-emerald-500' :
                        role === 'industry' ? 'bg-gradient-to-r from-slate-800 to-black' :
                        'bg-gradient-to-r from-green-500 to-green-700'
                    }`} />
                    
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-black text-brand-black mb-2 tracking-tight">{title}</h1>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">{subtitle}</p>
                    </div>

                    <div className="mt-8">
                        {children}
                    </div>
                </div>

                <div className="mt-8 text-center flex items-center justify-center gap-4">
                    <Link
                        href="/login"
                        className="text-sm font-semibold text-slate-500 hover:text-brand-orange transition-colors"
                    >
                        ← Portal Selection
                    </Link>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <Link
                        href="/"
                        className="text-sm font-semibold text-slate-500 hover:text-brand-orange transition-colors"
                    >
                        Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
