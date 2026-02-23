'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { fetchPublicUpdateFlags } from '../lib/admin-settings';
import { DashboardModeProvider, useDashboardMode } from '../context/DashboardModeContext';
import Navbar from '../components/layout/Navbar';
import CompleteProfileModal from '../components/profile/CompleteProfileModal';

function DashboardContent({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const dashboardContext = useDashboardMode();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
    const [updateIndicators, setUpdateIndicators] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const fetchUpdates = async () => {
            try {
                const data = await fetchPublicUpdateFlags();
                const mapped: Record<string, boolean> = {};
                data.forEach((item: { href: string; enabled: boolean }) => {
                    mapped[item.href] = item.enabled;
                });
                setUpdateIndicators(mapped);
                localStorage.setItem('emble_admin_updates', JSON.stringify(mapped));
            } catch (e) {
                const stored = localStorage.getItem('emble_admin_updates');
                if (stored) {
                    try {
                        setUpdateIndicators(JSON.parse(stored));
                    } catch (err) {
                        console.error('Error parsing update state', err);
                    }
                }
            }
        };

        fetchUpdates();

        window.addEventListener('storage', fetchUpdates as any);
        const handleAdminUpdates = () => {
            fetchUpdates();
        };
        window.addEventListener('admin_updates_changed', handleAdminUpdates as any);

        return () => {
            window.removeEventListener('storage', fetchUpdates as any);
            window.removeEventListener('admin_updates_changed', handleAdminUpdates as any);
        };
    }, []);

    if (!dashboardContext) {
        throw new Error("DashboardContent must be used within DashboardModeProvider");
    }
    const { mode, setMode } = dashboardContext;

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [isLoading, user, router]);

    interface MenuItem {
        icon: string;
        label: string;
        href: string;
        subItems?: { label: string; href: string; icon: string; hasUpdate?: boolean }[];
        hasUpdate?: boolean;
    }

    const placementMenu: MenuItem[] = [
        { icon: 'dashboard', label: 'Overview', href: '/dashboard', hasUpdate: updateIndicators['/dashboard'] },
        { icon: 'school', label: 'Placement Preparation', href: '/dashboard/preparation', hasUpdate: updateIndicators['/dashboard/preparation'] },
        { icon: 'quiz', label: 'Test Series', href: '/dashboard/test-series', hasUpdate: updateIndicators['/dashboard/test-series'] },
        { icon: 'code', label: 'DSA Training', href: '/dashboard/dsa', hasUpdate: updateIndicators['/dashboard/dsa'] },
        { icon: 'database', label: 'SQL Training', href: '/dashboard/sql', hasUpdate: updateIndicators['/dashboard/sql'] },
        { icon: 'rocket_launch', label: 'Project Labs', href: '/dashboard/projects', hasUpdate: updateIndicators['/dashboard/projects'] },
        {
            icon: 'mic',
            label: 'Mock Interview',
            href: '/dashboard/interview',
            hasUpdate: updateIndicators['/dashboard/interview'],
            subItems: [
                { label: 'Simulation Lab', href: '/dashboard/interview', icon: 'rocket_launch' },
                { label: 'Mock Analysis', href: '/dashboard/interview?mode=analysis', icon: 'analytics' }
            ]
        },
        { icon: 'description', label: 'Resume', href: '/dashboard/resume', hasUpdate: updateIndicators['/dashboard/resume'] },
        {
            icon: 'memory',
            label: 'Git Mastery',
            href: '/dashboard/github',
            hasUpdate: updateIndicators['/dashboard/github'],
            subItems: [
                { label: 'Commands & Lessons', href: '/dashboard/github', icon: 'terminal' },
                { label: 'CI/CD Pipelines', href: '/dashboard/github/cicd', icon: 'settings_ethernet' },
                { label: 'Git Testing', href: '/dashboard/github/testing', icon: 'bug_report' }
            ]
        },
        { icon: 'radar', label: 'Market Radar', href: '/dashboard/market-radar', hasUpdate: updateIndicators['/dashboard/market-radar'] },
        {
            icon: 'group',
            label: 'Mentors',
            href: '/dashboard/mentors',
            hasUpdate: updateIndicators['/dashboard/mentors'],
            subItems: [
                { label: 'Find a Mentor', href: '/dashboard/mentors', icon: 'search' },
                { label: 'Mentor Console', href: '/dashboard/mentor-console', icon: 'dashboard' },
                { label: 'Join as a Mentor', href: '/mentor/apply', icon: 'person_add' }
            ]
        },
    ];

    const simulationMenu: MenuItem[] = [
        { icon: 'dashboard', label: 'Overview', href: '/dashboard' },
        { icon: 'view_kanban', label: 'Sprint Board', href: '/dashboard/sprint' },
        { icon: 'folder_data', label: 'Repository', href: '/simulation/repo' },
        { icon: 'rate_review', label: 'Code Reviews', href: '/dashboard/reviews' },
    ];

    const menuItems = mode === 'prep' ? placementMenu : simulationMenu;

    const matchesHref = (href: string) => {
        const [path, queryString] = href.split('?');
        if (path !== pathname) return false;
        if (!queryString) return true;
        const targetParams = new URLSearchParams(queryString);
        const entries = Array.from(targetParams.entries());
        for (const [key, value] of entries) {
            if (searchParams.get(key) !== value) return false;
        }
        return true;
    };

    const getActiveSubHref = (subItems?: { label: string; href: string; icon: string; hasUpdate?: boolean }[]) => {
        if (!subItems?.length) return null;
        const queryMatch = subItems.find((sub) => sub.href.includes('?') && matchesHref(sub.href));
        if (queryMatch) return queryMatch.href;
        const pathMatch = subItems.find((sub) => !sub.href.includes('?') && pathname === sub.href);
        return pathMatch ? pathMatch.href : null;
    };

    useEffect(() => {
        setExpandedMenus((prev) => {
            let changed = false;
            const next = { ...prev };
            menuItems.forEach((item) => {
                if (item.subItems && getActiveSubHref(item.subItems)) {
                    if (!next[item.label]) {
                        next[item.label] = true;
                        changed = true;
                    }
                }
            });
            return changed ? next : prev;
        });
    }, [pathname, searchParams.toString(), mode]);

    const toggleMenu = (label: string) => {
        setExpandedMenus((prev) => ({
            ...prev,
            [label]: !prev[label],
        }));
    };

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
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
                        {/* Mode Indicator / Brand moved here or simplified */}
                        {/* Mode Indicator / Brand moved here or simplified */}
                        <div className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ${!sidebarOpen ? 'opacity-0 w-0' : 'opacity-100'}`}>
                            <div className="min-w-[8px] h-8 rounded-full bg-emerald-500"></div>
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Workspace</p>
                                <p className="text-sm font-bold text-slate-900 whitespace-nowrap">Placement Prep</p>
                            </div>
                        </div>

                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 ml-auto"
                        >
                            <span className="material-symbols-outlined text-xl">
                                {sidebarOpen ? 'menu_open' : 'menu'}
                            </span>
                        </button>
                    </div>

                    <nav className="p-4 space-y-2 flex-1 overflow-y-auto custom-scrollbar">
                        {menuItems.map((item) => {
                            // Logic to determine if parent or any child is active
                            const activeSubHref = getActiveSubHref(item.subItems);
                            const isParentActive = pathname === item.href || Boolean(activeSubHref);
                            const itemActiveClass = mode === 'prep' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600';

                            // Check if this specific item is the exact active path
                            const isExactActive = pathname === item.href;
                            const isExpanded = expandedMenus[item.label] ?? false;
                            const isItemActive = item.subItems ? isParentActive : isExactActive;

                            return (
                                <div key={item.href}>
                                    {item.subItems ? (
                                        <button
                                            type="button"
                                            onClick={() => toggleMenu(item.label)}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${isItemActive
                                                ? itemActiveClass
                                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                                }`}
                                        >
                                            <span className={`material-symbols-outlined ${isItemActive ? 'text-inherit' : 'text-slate-400 group-hover:text-slate-600'}`}>
                                                {item.icon}
                                            </span>
                                            <span
                                                className={`font-medium whitespace-nowrap transition-opacity duration-200 flex-1 text-left ${sidebarOpen ? 'opacity-100' : 'opacity-0 hidden'
                                                    }`}
                                            >
                                                {item.label}
                                            </span>
                                            {item.hasUpdate && (
                                                <span className={`w-2 h-2 rounded-full bg-rose-500 animate-pulse ${sidebarOpen ? 'ml-auto' : 'absolute top-3 right-3'}`}></span>
                                            )}
                                            <span
                                                className={`material-symbols-outlined text-base transition-transform ${sidebarOpen ? 'opacity-100' : 'opacity-0 hidden'} ${isExpanded ? 'rotate-90' : ''}`}
                                            >
                                                chevron_right
                                            </span>
                                        </button>
                                    ) : (
                                        <Link
                                            href={item.href}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${isItemActive
                                                ? itemActiveClass
                                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                                }`}
                                        >
                                        <span className={`material-symbols-outlined ${isItemActive ? 'text-inherit' : 'text-slate-400 group-hover:text-slate-600'}`}>
                                            {item.icon}
                                        </span>
                                        <span
                                            className={`font-medium whitespace-nowrap transition-opacity duration-200 flex-1 ${sidebarOpen ? 'opacity-100' : 'opacity-0 hidden'
                                                }`}
                                        >
                                            {item.label}
                                        </span>
                                        {item.hasUpdate && (
                                            <span className={`w-2 h-2 rounded-full bg-rose-500 animate-pulse ${sidebarOpen ? 'ml-auto' : 'absolute top-3 right-3'}`}></span>
                                        )}
                                        </Link>
                                    )}

                                    {/* Sub-items rendering - only if sidebar is open and parent has subItems */}
                                    {sidebarOpen && item.subItems && (
                                        <div className={`ml-9 mt-1 space-y-1 mb-2 overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                                            {item.subItems.map((sub) => {
                                                const isSubActive = activeSubHref === sub.href;
                                                return (
                                                    <Link
                                                        key={sub.href}
                                                        href={sub.href}
                                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${isSubActive
                                                            ? 'text-indigo-600 font-bold bg-indigo-50/50'
                                                            : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                                                            }`}
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">{sub.icon}</span>
                                                        <span className="flex-1">{sub.label}</span>
                                                        {sub.hasUpdate && (
                                                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse ml-auto"></span>
                                                        )}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </nav>

                    <div className="p-4 shrink-0 mt-auto"></div>
                </aside>

                {/* Main Content Area */}
                <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'} p-8 h-full overflow-y-auto`}>
                    {children}
                </main>
            </div>
        </div>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <DashboardModeProvider>
            <DashboardContent>{children}</DashboardContent>
            <CompleteProfileModal />
        </DashboardModeProvider>
    );
}
