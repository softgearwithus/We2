'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Building2, Briefcase, Users, KanbanSquare, Settings, LogOut, Loader2 } from 'lucide-react';
import Navbar from '../components/layout/Navbar';

function IndustryLayoutContent({ children }: { children: React.ReactNode }) {
    const { user, isLoading, logout } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push('/login/industry');
            } else if (user.role !== 'company_admin') {
                router.push('/dashboard');
            }
        }
    }, [isLoading, user, router]);

    const menuItems = [
        { icon: <Building2 size={20} />, label: 'Overview', href: '/industry/dashboard' },
        { icon: <Briefcase size={20} />, label: 'Active Drives', href: '/industry/drives' },
        { icon: <Users size={20} />, label: 'Search Talent', href: '/industry/search', badge: 'Soon' },
        { icon: <Settings size={20} />, label: 'Company Profile', href: '/industry/profile' },
    ];

    if (isLoading || !user) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <Loader2 size={32} className="animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Global Navbar */}
            <Navbar />

            <div className="flex pt-16 h-[calc(100vh)] box-border">
                {/* Sidebar */}
                <aside
                    className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-slate-200 fixed top-16 bottom-0 z-30 transition-all duration-300 flex flex-col`}
                >
                    <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 shrink-0">
                        <div className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ${!sidebarOpen ? 'opacity-0 w-0' : 'opacity-100'}`}>
                            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-lg leading-none shrink-0">
                                {user?.firstName?.[0] || 'C'}
                            </div>
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-sm font-bold text-slate-900 truncate">{user?.firstName || 'Partner'}</span>
                                <span className="text-xs font-medium text-blue-600 tracking-wide uppercase">Employer Hub</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 ml-auto shrink-0"
                        >
                            <span className="material-symbols-outlined text-xl">
                                {sidebarOpen ? 'menu_open' : 'menu'}
                            </span>
                        </button>
                    </div>

                    <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto custom-scrollbar">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative ${isActive
                                        ? 'bg-blue-50 text-blue-600 font-medium'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'
                                        }`}
                                >
                                    <span className={`${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                                        {item.icon}
                                    </span>
                                    <span className={`whitespace-nowrap transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                                        {item.label}
                                    </span>
                                    {item.badge && sidebarOpen && (
                                        <span className="ml-auto text-[10px] uppercase tracking-wider font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md">
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t border-slate-100 shrink-0">
                        <button
                            onClick={() => logout()}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all font-medium"
                        >
                            <LogOut size={20} />
                            <span className={`${sidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>Sign Out</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'} p-8 h-full overflow-y-auto`}>
                    {children}
                </main>
            </div>
        </div>
    );
}

export default function IndustryLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <Loader2 size={32} className="animate-spin text-blue-600" />
            </div>
        }>
            <IndustryLayoutContent>{children}</IndustryLayoutContent>
        </Suspense>
    );
}
