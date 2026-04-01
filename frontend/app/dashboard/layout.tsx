'use client';

import { useState, useEffect, Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { fetchPublicUpdateFlags } from '../lib/admin-settings';
import { DashboardModeProvider, useDashboardMode } from '../context/DashboardModeContext';
import AppSidebar from '@/components/shadcn-space/blocks/dashboard-shell-01/app-sidebar';
import CompleteProfileModal from '../components/profile/CompleteProfileModal';

function DashboardContent({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const dashboardContext = useDashboardMode();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();
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
    const { mode } = dashboardContext;

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [isLoading, user, router]);

    interface MenuItem {
        isSection?: boolean;
        icon?: string;
        label: string;
        href?: string;
        subItems?: { label: string; href: string; icon: string; hasUpdate?: boolean }[];
        hasUpdate?: boolean;
    }

    const placementMenu: MenuItem[] = [
        { isSection: true, label: 'DASHBOARDS' },
        { icon: 'dashboard', label: 'Overview', href: '/dashboard', hasUpdate: updateIndicators['/dashboard'] },
        { icon: 'school', label: 'Placement Preparation', href: '/dashboard/preparation', hasUpdate: updateIndicators['/dashboard/preparation'] },
        {
            icon: 'quiz',
            label: 'Test Series',
            href: '/dashboard/test-series',
            hasUpdate: updateIndicators['/dashboard/test-series'],
            subItems: [
                { label: 'Explore', href: '/dashboard/test-series', icon: 'grid_view' },
                { label: 'Mock Analysis', href: '/dashboard/test-series/mock-analysis', icon: 'analytics' }
            ]
        },
        
        { isSection: true, label: 'LABS' },
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
        
        { isSection: true, label: 'CAREER' },
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
        
        { isSection: true, label: 'NETWORK' },
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
        { icon: 'work', label: 'Placement Drives', href: '/dashboard/placement-drives', hasUpdate: updateIndicators['/dashboard/placement-drives'] },
        { icon: 'support_agent', label: 'Help & Support', href: '/contact', hasUpdate: updateIndicators['/contact'] }
    ];

    const simulationMenu: MenuItem[] = [
        { isSection: true, label: 'DASHBOARDS' },
        { icon: 'dashboard', label: 'Overview', href: '/dashboard' },
        { icon: 'view_kanban', label: 'Sprint Board', href: '/dashboard/sprint' },
        { isSection: true, label: 'PAGES' },
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

    const activeSubHref = getActiveSubHref(menuItems.flatMap(i => i.subItems || []));

    const mappedNavItems = menuItems.map(item => ({
        isSection: item.isSection,
        title: item.label,
        icon: item.icon,
        href: item.href,
        isActive: pathname === item.href || (item.subItems ? Boolean(getActiveSubHref(item.subItems)) : false),
        hasUpdate: item.hasUpdate,
        children: item.subItems?.map(sub => ({
            title: sub.label,
            icon: sub.icon,
            href: sub.href,
            isActive: activeSubHref === sub.href,
            hasUpdate: sub.hasUpdate
        }))
    }));

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
    }

    return (
        <AppSidebar navItems={mappedNavItems} mode={mode}>
            {children}
        </AppSidebar>
    );
}

function DashboardLayoutFallback() {
    return (
        <div className="flex h-screen items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <DashboardModeProvider>
            <Suspense fallback={<DashboardLayoutFallback />}>
                <DashboardContent>{children}</DashboardContent>
            </Suspense>
            <CompleteProfileModal />
        </DashboardModeProvider>
    );
}
