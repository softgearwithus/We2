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
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 relative overflow-hidden font-sans">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 blur-[100px] rounded-full pointer-events-none opacity-50" />

            <div className="relative z-10 w-full max-w-md animate-fade-in-up">
                {/* Logo Area */}
                <div className="flex justify-center mb-8">
                    <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
                        <span className="font-[800] text-2xl text-gray-900 tracking-tighter">emble</span>
                    </Link>
                </div>
                
                {/* Centered Card */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-xl shadow-gray-200/50 p-8 sm:p-10 relative overflow-hidden">
                    {/* Role Indicator Bar */}
                    <div className={`absolute top-0 left-0 w-full h-1.5 ${
                        role === 'student' ? 'bg-indigo-500' :
                        role === 'college' ? 'bg-emerald-500' :
                        role === 'industry' ? 'bg-purple-500' :
                        'bg-blue-500'
                    }`} />
                    
                    <div className="text-center mb-8 mt-2">
                        <h1 className="text-2xl font-[800] text-gray-900 mb-2 tracking-tight">{title}</h1>
                        <p className="text-sm text-gray-500 font-[500] leading-relaxed">{subtitle}</p>
                    </div>

                    <div className="mt-8">
                        {children}
                    </div>
                </div>

                <div className="mt-8 text-center flex items-center justify-center gap-4">
                    <Link
                        href="/login"
                        className="text-sm font-[600] text-gray-500 hover:text-indigo-600 transition-colors"
                    >
                        ← Portal Selection
                    </Link>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <Link
                        href="/"
                        className="text-sm font-[600] text-gray-500 hover:text-indigo-600 transition-colors"
                    >
                        Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
