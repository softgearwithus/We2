'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function SimulationLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [activeWorkspace, setActiveWorkspace] = useState('Acme Corp');

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [isLoading, user, router]);

    if (isLoading) {
        return <div className="h-screen w-screen flex items-center justify-center bg-[#1e1e1e] text-white">Loading workstation...</div>;
    }

    const navItems = [
        { icon: 'mail', label: 'Inbox', href: '/simulation/mail', badge: 3 },
        { icon: 'chat', label: 'Slack/Teams', href: '/simulation/chat', badge: 12 },
        { icon: 'view_kanban', label: 'Jira/Board', href: '/simulation/board' },
        { icon: 'source', label: 'GitLab', href: '/simulation/repo' },
        { icon: 'description', label: 'Wiki', href: '/simulation/wiki' },
    ];

    return (
        <div className="h-screen flex bg-[#1e1e1e] text-white overflow-hidden font-sans">
            {/* Activity Bar (VS Code style) */}
            <aside className="w-16 bg-[#333333] flex flex-col items-center py-4 border-r border-[#444]">
                <div className="mb-6">
                    <div className="w-10 h-10 rounded bg-blue-600 flex items-center justify-center font-bold text-lg">
                        {user?.email?.charAt(0).toUpperCase() || 'A'}
                    </div>
                </div>
                <nav className="flex-1 space-y-4 w-full px-2">
                    {navItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`w-full aspect-square flex flex-col items-center justify-center rounded-lg hover:bg-[#444] relative group ${isActive ? 'bg-[#444] border-l-2 border-blue-500' : 'text-gray-400'}`}
                            >
                                <span className="material-symbols-outlined text-2xl mb-1">{item.icon}</span>
                                <span className="text-[9px] uppercase font-bold tracking-wider">{item.label.split('/')[0]}</span>
                                {item.badge && (
                                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-[10px] flex items-center justify-center font-bold">
                                        {item.badge}
                                    </span>
                                )}
                                {/* Tooltip */}
                                <div className="absolute left-14 bg-black px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                                    {item.label}
                                </div>
                            </Link>
                        )
                    })}
                </nav>
                <div className="mt-auto space-y-4 w-full px-2">
                    <button className="w-full aspect-square flex items-center justify-center rounded-lg hover:bg-[#444] text-gray-400">
                        <span className="material-symbols-outlined text-2xl">settings</span>
                    </button>
                    <div className="w-10 h-10 mx-auto rounded-full bg-gray-600 border-2 border-green-500 overflow-hidden" title={user?.email}>
                        {/* <img loading="lazy" decoding="async" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" /> */}
                        <div className="w-full h-full flex items-center justify-center bg-slate-500 text-white font-bold">
                            {user?.email?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Workspace */}
            <div className="flex-1 flex flex-col bg-[#1e1e1e]">
                {/* Top Header */}
                <header className="h-10 bg-[#252526] flex items-center justify-between px-4 border-b border-[#333]">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span className="material-symbols-outlined text-sm">home</span>
                        <span>Applications</span>
                        <span className="material-symbols-outlined text-xs">chevron_right</span>
                        <span className="text-white font-medium">Acme Corp Workstation</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-[#3c3c3c] px-3 py-1 rounded text-xs">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span>VPN Connected</span>
                        </div>
                        <div className="text-xs text-gray-400">
                            Time Remaining: <span className="text-white font-mono">14 Days</span>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-auto relative">
                    {children}
                </main>
            </div>
        </div>
    );
}
