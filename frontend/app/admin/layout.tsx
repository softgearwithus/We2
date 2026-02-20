/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Building2, BarChart3, Settings, Shield, Bell, Search, School, BookOpen, Briefcase } from 'lucide-react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/admin', roles: ['all'] },
        { icon: Users, label: 'Students', href: '/admin/students', roles: ['all'] },
        { icon: Building2, label: 'Colleges', href: '/admin/colleges', roles: ['super_admin'] },
        { icon: Briefcase, label: 'Companies', href: '/admin/companies', roles: ['super_admin'] },
        { icon: BarChart3, label: 'Analytics', href: '/admin/analytics', roles: ['all'] },
        { icon: Settings, label: 'Settings', href: '/admin/settings', roles: ['all'] },
    ];

    return (
        <div className="min-h-screen bg-slate-100 flex font-sans">
            {/* Sidebar */}
            <aside
                className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#0f172a] text-white fixed h-full z-30 transition-all duration-300 flex flex-col`}
            >
                <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
                    <div className={`flex items-center gap-3 overflow-hidden transition-opacity duration-300 ${!sidebarOpen && 'opacity-0 hidden'}`}>
                        <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-bold">A</div>
                        <span className="font-bold text-lg tracking-tight">AdminPanel</span>
                    </div>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-800 rounded">
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                </div>

                <nav className="flex-1 py-6 px-3 space-y-1">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group ${isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <item.icon size={20} className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                                <span className={`font-medium whitespace-nowrap transition-opacity duration-200 ${!sidebarOpen && 'opacity-0 hidden'}`}>
                                    {item.label}
                                </span>
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                            <img src="https://api.dicebear.com/7.x/adventurer/svg?seed=Admin" alt="Admin" />
                        </div>
                        <div className={`overflow-hidden transition-all duration-300 ${!sidebarOpen && 'hidden w-0'}`}>
                            <p className="text-sm font-bold">Super Admin</p>
                            <p className="text-xs text-slate-500">admin@platform.com</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
                {/* Topbar */}
                <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 px-8 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4 flex-1 max-w-xl">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search students, colleges, or reports..."
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm transition-all bg-slate-50 focus:bg-white"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative p-2 hover:bg-slate-50 rounded-full transition-colors">
                            <Bell size={20} className="text-slate-600" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>
                        <div className="h-8 w-px bg-slate-200"></div>
                        <button className="text-sm font-bold text-slate-600 hover:text-blue-600">Documentation</button>
                        <button className="text-sm font-bold text-slate-600 hover:text-blue-600">Support</button>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
