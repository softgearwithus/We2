'use client';

import { useEffect, Suspense, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import {
    Briefcase,
    Building2,
    ChevronDown,
    Home,
    Loader2,
    Plug,
    Search,
    Settings,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';

function IndustryLayoutContent({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const isPublicInviteRoute = pathname.startsWith('/industry/invite');

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        if (isPublicInviteRoute) return;
        if (!isLoading) {
            if (!user) {
                router.push('/login/industry');
            } else if (user.role !== 'company_admin') {
                router.push('/dashboard');
            }
        }
    }, [isLoading, isPublicInviteRoute, mounted, user, router]);

    if (!mounted) {
        return <IndustryLoadingScreen />;
    }

    if (isPublicInviteRoute) {
        return <>{children}</>;
    }

    if (isLoading || !user) {
        return <IndustryLoadingScreen />;
    }

    return (
        <div className="min-h-screen bg-white text-neutral-950">
            {/* Desktop Thin Sidebar */}
            <aside className="fixed left-0 top-0 z-40 hidden h-screen w-14 flex-col items-center justify-between border-r border-neutral-200 bg-white py-3 lg:flex">
                <div className="flex w-full flex-col items-center gap-4">
                    {/* Logo */}
                    <div className="mb-2 flex h-8 w-8 items-center justify-center font-serif text-xl font-bold text-black">
                        E
                    </div>

                    {/* Top Icons */}
                    <div className="flex w-full flex-col items-center gap-2 px-2">
                        {[
                            { href: '/industry/dashboard', label: 'Dashboard', icon: <Home size={18} /> },
                            { href: '/industry/assessments', label: 'Assessments', icon: <Sparkles size={18} /> },
                            { href: '/industry/drives', label: 'Postings', icon: <Briefcase size={18} /> },
                            { href: '/industry/integrations', label: 'Integrations', icon: <Plug size={18} /> },
                            { href: '/industry/search', label: 'Talent Search', icon: <Search size={18} /> },
                        ].map((item) => {
                            const active = pathname === item.href || (item.href !== '/industry/dashboard' && pathname.startsWith(`${item.href}/`));
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    title={item.label}
                                    className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                                        active
                                            ? 'bg-emerald-900 text-white' // Dark green/black background for active
                                            : 'text-neutral-500 hover:bg-neutral-100 hover:text-black'
                                    }`}
                                >
                                    {item.icon}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom Icons */}
                <div className="flex w-full flex-col items-center gap-2 px-2">
                    <button title="Collapse" className="flex h-10 w-10 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-black">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    <button title="Help & Support" className="flex h-10 w-10 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-black">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
                    </button>
                    <Link
                        href="/industry/settings"
                        title="Settings"
                        className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                            pathname.startsWith('/industry/settings') || pathname.startsWith('/industry/profile')
                                ? 'bg-emerald-900 text-white'
                                : 'text-neutral-500 hover:bg-neutral-100 hover:text-black'
                        }`}
                    >
                        <Settings size={18} />
                    </Link>
                </div>
            </aside>

            {/* Floating Top Right Header (from screenshot) */}
            <header className="fixed right-3 top-3 z-40 flex h-8 items-center gap-2 text-[13px] bg-white rounded-md">
                <button className="inline-flex max-w-[260px] items-center gap-1.5 rounded-md px-2 py-1 font-semibold text-neutral-900 hover:bg-neutral-100">
                    <Building2 size={13} className="text-neutral-500" />
                    <span className="truncate">{user?.firstName || user?.email || 'Company workspace'}</span>
                    <ChevronDown size={13} className="text-neutral-400" />
                </button>
                <ShieldCheck size={14} className="text-neutral-900" />
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#5967c5] text-sm font-semibold text-white">
                    {(user?.firstName || user?.email || 'Y')[0]?.toUpperCase()}
                </div>
            </header>

            {/* Mobile Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-neutral-200 bg-white pb-safe pt-1 lg:hidden">
                {[
                    { href: '/industry/dashboard', label: 'Home', icon: <Home size={20} /> },
                    { href: '/industry/assessments', label: 'Assess', icon: <Sparkles size={20} /> },
                    { href: '/industry/drives', label: 'Posts', icon: <Briefcase size={20} /> },
                    { href: '/industry/integrations', label: 'Connect', icon: <Plug size={20} /> },
                    { href: '/industry/settings', label: 'Settings', icon: <Settings size={20} /> },
                ].map((item) => {
                    const active = pathname === item.href || (item.href !== '/industry/dashboard' && pathname.startsWith(`${item.href}/`));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center gap-1 px-3 py-2 text-[10px] font-medium transition-colors ${
                                active ? 'text-black' : 'text-neutral-500 hover:text-black'
                            }`}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Main Content Area */}
            <div className="lg:pl-14">
                <main className="min-h-screen px-4 pb-20 pt-10">
                    {children}
                </main>
            </div>
        </div>
    );
}

function IndustryLoadingScreen() {
    return (
        <div className="flex h-screen items-center justify-center bg-slate-50">
            <Loader2 size={32} className="animate-spin text-blue-600" />
        </div>
    );
}

export default function IndustryLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<IndustryLoadingScreen />}>
            <IndustryLayoutContent>{children}</IndustryLayoutContent>
        </Suspense>
    );
}
