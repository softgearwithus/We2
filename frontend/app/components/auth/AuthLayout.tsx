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
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#f8f9fa] selection:bg-[#ffa116] selection:text-[#202b20] relative overflow-hidden font-inter">
            {/* Minimal Grid Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: `linear-gradient(to right, #202b20 1px, transparent 1px), linear-gradient(to bottom, #202b20 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }} />
            </div>

            <div className="relative z-10 w-full max-w-md animate-fade-in-up">
                {/* Logo Area */}
                <div className="flex justify-center mb-8">
                    <Link href="/" className="flex items-center gap-3 group px-6 py-2 border-2 border-[#202b20] bg-white shadow-[4px_4px_0px_0px_#202b20] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#202b20] transition-all">
                        <span className="font-[800] text-3xl text-[#202b20] tracking-tighter">emble</span>
                    </Link>
                </div>
                
                {/* Centered Card */}
                <div className="bg-white border-2 border-[#202b20] shadow-[8px_8px_0px_0px_#202b20] p-8 sm:p-10 relative overflow-hidden">
                    {/* Role Indicator Bar */}
                    <div className={`absolute top-0 left-0 w-full h-2 border-b-2 border-[#202b20] ${
                        role === 'student' ? 'bg-[#ffa116]' :
                        role === 'college' ? 'bg-emerald-400' :
                        role === 'industry' ? 'bg-[#202b20]' :
                        'bg-blue-400'
                    }`} />
                    
                    <div className="text-center mb-8 mt-2">
                        <h1 className="text-2xl font-[700] text-[#202b20] mb-2 tracking-tight uppercase">{title}</h1>
                        <p className="text-sm text-[#202b20]/70 font-[500] leading-relaxed">{subtitle}</p>
                    </div>

                    <div className="mt-8">
                        {children}
                    </div>
                </div>

                <div className="mt-8 text-center flex items-center justify-center gap-4">
                    <Link
                        href="/login"
                        className="text-sm font-[600] text-[#202b20] hover:bg-[#ffa116] px-2 py-1 border-2 border-transparent hover:border-[#202b20] transition-colors"
                    >
                        ← PORTAL
                    </Link>
                    <span className="w-1.5 h-1.5 bg-[#202b20]" />
                    <Link
                        href="/"
                        className="text-sm font-[600] text-[#202b20] hover:bg-[#ffa116] px-2 py-1 border-2 border-transparent hover:border-[#202b20] transition-colors"
                    >
                        HOME
                    </Link>
                </div>
            </div>
        </div>
    );
}
