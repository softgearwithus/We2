import { ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Terminal } from 'lucide-react';

interface AuthLayoutProps {
    children: ReactNode;
    title: string;
    subtitle: string;
    role: 'student' | 'college' | 'industry' | 'admin';
    visual: ReactNode;
    themeColor: string;
}

export default function AuthLayout({ children, title, subtitle, role, visual, themeColor }: AuthLayoutProps) {
    const getThemeGradient = () => {
        switch (role) {
            case 'student': return 'from-indigo-900 to-violet-900';
            case 'college': return 'from-slate-800 to-slate-900';
            case 'industry': return 'from-gray-900 to-black';
            case 'admin': return 'from-green-900 to-black font-mono';
            default: return 'from-indigo-900 to-violet-900';
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white selection:bg-brand-orange selection:text-white overflow-hidden">
            {/* Visual Side */}
            <div className={`hidden lg:flex flex-col justify-center p-12 xl:p-20 text-white relative overflow-hidden bg-gradient-to-br ${getThemeGradient()}`}>
                {/* Animated Background Elements */}
                <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                    backgroundSize: '40px 40px'
                }} />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-[100px] -mr-32 -mt-32 animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-orange/20 rounded-full blur-[80px] -ml-20 -mb-20" />

                <div className="relative z-10 max-w-xl">
                    <Link href="/" className="inline-flex items-center gap-2 mb-12 group">
                        <div className="w-12 h-12 bg-gradient-to-br from-brand-orange to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-orange/20 mb-6">
                            <Terminal className="text-white" size={24} strokeWidth={3} />
                        </div>
                        <span className="font-bold text-xl text-white tracking-tight">Emble<span className="text-brand-orange">.Target</span></span>
                    </Link>

                    <h2 className="text-5xl font-black mb-6 leading-tight tracking-tight">
                        {title}
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-white">
                            {role === 'student' ? 'Launch Career.' : role === 'college' ? 'Empower Talent.' : 'Hire Best.'}
                        </span>
                    </h2>

                    <p className="text-lg text-white/80 font-medium leading-relaxed mb-12 max-w-md">
                        {subtitle}
                    </p>

                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-white/20 to-transparent rounded-2xl blur opacity-30" />
                        <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                            {visual}
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Side */}
            <div className="flex flex-col justify-center items-center p-8 lg:p-20 relative">
                {/* Mobile Header */}
                <div className="lg:hidden absolute top-8 left-8">
                    <Link href="/" className="flex items-center gap-2 font-bold text-brand-black">
                        <div className="w-8 h-8 bg-brand-black rounded-lg flex items-center justify-center text-white text-sm">
                            <Terminal size={16} strokeWidth={3} />
                        </div>
                        We2
                    </Link>
                </div>

                <div className="max-w-[420px] w-full mx-auto space-y-8">
                    {children}

                    <div className="pt-8 border-t border-slate-100 text-center">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-brand-black transition-colors"
                        >
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
