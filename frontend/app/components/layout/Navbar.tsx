// Trigger HMR
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/app/lib/utils';
import { Menu, X, Terminal, User, LogOut, Settings, LayoutDashboard, BookOpen, Video, Code2, ChevronDown, School, CircuitBoard } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { useDashboardMode } from '@/app/context/DashboardModeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollProgressProvider, ScrollProgress } from '@/components/animate-ui/primitives/animate/scroll-progress';

const GUEST_NAV_ITEMS = [
    { label: 'Pricing', href: '/pricing' },
    { label: 'Active Jobs', href: '/active-jobs' },
    { label: 'FAQ', href: '/faq' }
] as const;

const AUTH_NAV_ITEMS = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Pricing', href: '/pricing', icon: null }
] as const;

const getDisplayPlan = (plan?: string) => {
    if (!plan || plan === 'free') return 'Free';
    if (plan === 'standard' || plan === 'placement_plus' || plan.includes('standard')) return 'EMBLE Pro Member';
    if (plan === 'pro' || plan === 'we2_max' || plan.includes('pro')) return 'EMBLE Pro Member';
    return plan;
};

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();
    const dashboardContext = useDashboardMode();
    const isDashboardLayout = !!dashboardContext;
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [profileIncomplete, setProfileIncomplete] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const isDarkBg = !isScrolled && !mobileMenuOpen && pathname === '/curriculum';

    useEffect(() => {
        // Fix for Next.js cross-page hash anchor navigation
        if (pathname === '/' && window.location.hash) {
            const id = window.location.hash.substring(1);
            setTimeout(() => {
                const el = document.getElementById(id);
                if (el) {
                    // Slight offset adjustment if needed, but smooth scrolling to element works well
                    el.scrollIntoView({ behavior: 'smooth' });
                }
            }, 150); // Give DOM a moment to paint heavy components
        }

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };
        window.addEventListener('scroll', handleScroll);

        // Click outside handler for user menu
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        const checkProfile = () => {
            const status = localStorage.getItem('profile_completed');
            setProfileIncomplete(!status || status === 'later');
        };
        checkProfile();
        window.addEventListener('profile_status_changed', checkProfile);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('profile_status_changed', checkProfile);
        };
    }, []);

    const currentNavItems = user ? AUTH_NAV_ITEMS : GUEST_NAV_ITEMS;

    // Items to show specifically when INSIDE the dashboard layout (context is present)
    const dashboardNavItems = [
        { label: 'Pricing', href: '/pricing', icon: null }
    ];

    const getAvatarSrc = (url?: string | null) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
    };

    const avatarSrc = user ? getAvatarSrc(user.avatarUrl) : null;

    return (
        <ScrollProgressProvider global>
            <nav className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 sm:px-6",
                isScrolled ? "py-4 bg-white/80 backdrop-blur-xl border-b border-gray-100/50 shadow-sm" : "pt-6 pointer-events-none",
                mobileMenuOpen ? "bg-white/95 backdrop-blur-md pointer-events-auto h-screen py-6" : ""
            )}>
                <ScrollProgress
                    className="absolute top-0 left-0 h-[2px] bg-gray-900 origin-left z-[60]"
                />

                <div className="max-w-7xl mx-auto h-[48px] flex items-center justify-between gap-4 pointer-events-auto">

                    {/* Brand Logo - Pure Text */}
                    <Link href={user ? "/dashboard" : "/"} className="flex flex-col justify-center px-2 group transition-transform hover:scale-[1.02]">
                        <span className="text-[1.5rem] font-bold tracking-tight text-gray-900 leading-none">
                            emble
                        </span>
                    </Link>

                    {/* Nav Links Block */}
                    <div className="hidden md:flex items-center bg-white/60 backdrop-blur-md border border-gray-200/60 shadow-sm rounded-full p-1">
                        <div className="flex items-center font-medium text-[14px] text-gray-600">
                            {isDashboardLayout ? (
                                dashboardNavItems.map((item, idx) => (
                                    <Link
                                        key={item.label}
                                        href={item.href!}
                                        className="flex items-center gap-2 px-5 py-2 rounded-full hover:bg-gray-100/50 hover:text-gray-900 transition-colors"
                                    >
                                        {/* @ts-ignore */}
                                        {item.icon && <item.icon size={16} />}
                                        {item.label}
                                    </Link>
                                ))
                            ) : (
                                currentNavItems.map((item, idx) => {
                                    const isAnchor = item.href.includes('#');
                                    const LinkComponent = isAnchor && pathname !== '/' ? 'a' : Link;

                                    return (
                                        <LinkComponent
                                            key={item.label}
                                            href={item.href}
                                            className="flex items-center gap-2 px-5 py-2 rounded-full hover:bg-gray-100/50 hover:text-gray-900 transition-colors group"
                                        >
                                            {/* @ts-ignore - icon is optional */}
                                            {user && item.icon && <item.icon size={16} />}
                                            <span className="flex items-center gap-2">
                                                {item.label}
                                            </span>
                                        </LinkComponent>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Right Block */}
                    <div className="hidden md:flex items-center gap-2">
                        {user ? (
                            <div className="relative flex" ref={userMenuRef}>
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-gray-200/60 shadow-sm hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                                >
                                    <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center bg-gray-50 text-gray-700 shrink-0 overflow-hidden relative">
                                        {avatarSrc ? (
                                            <img loading="lazy" decoding="async" src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            user.email[0].toUpperCase()
                                        )}
                                        {profileIncomplete && (
                                            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white"></span>
                                            </span>
                                        )}
                                    </div>
                                    <span className="max-w-[100px] truncate">{user.email.split('@')[0]}</span>
                                    <ChevronDown size={14} className="text-gray-400" />
                                </button>

                                <AnimatePresence>
                                    {userMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute right-0 top-[calc(100%+12px)] w-64 bg-white border border-gray-100 shadow-xl rounded-2xl text-gray-700 overflow-hidden flex flex-col z-50"
                                        >
                                            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                                                <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">Signed in as</p>
                                                <p className="text-[13px] font-medium text-gray-900 mt-1 truncate">{user.email}</p>
                                                <p className="text-[10px] mt-2 font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-md inline-block uppercase tracking-wider">{getDisplayPlan(user.subscriptionPlan)} PLAN</p>
                                            </div>

                                            <div className="p-2 flex flex-col gap-1">
                                                <Link href="/dashboard/profile" className="flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium hover:bg-gray-100 transition-colors" onClick={() => setUserMenuOpen(false)}>
                                                    <div className="flex items-center gap-3">
                                                        <User size={16} className="text-gray-500" />
                                                        <span>Profile</span>
                                                    </div>
                                                    {profileIncomplete && <span className="text-[9px] font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">INCOMPLETE</span>}
                                                </Link>
                                                <Link href="/dashboard/settings" className="flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium hover:bg-gray-100 transition-colors" onClick={() => setUserMenuOpen(false)}>
                                                    <div className="flex items-center gap-3">
                                                        <Settings size={16} className="text-gray-500" />
                                                        <span>Settings</span>
                                                    </div>
                                                    {profileIncomplete && <span className="w-2 h-2 rounded-full bg-red-500"></span>}
                                                </Link>
                                            </div>

                                            <div className="p-2 border-t border-gray-100">
                                                <button
                                                    onClick={() => {
                                                        logout();
                                                        setUserMenuOpen(false);
                                                    }}
                                                    className="w-full flex items-center justify-start gap-3 px-3 py-2 rounded-xl text-[13px] font-medium text-red-600 hover:bg-red-50 transition-colors"
                                                >
                                                    <LogOut size={16} />
                                                    <span>Sign out</span>
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/login" className="px-5 py-2.5 rounded-full hover:bg-gray-100/50 transition-colors text-[14px] font-medium text-gray-700">
                                    Login
                                </Link>
                                <Link href="/register" className="px-6 py-2.5 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-all shadow-sm text-[14px] font-medium">
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                        className="md:hidden flex items-center justify-center w-10 h-10 bg-white border border-gray-200 rounded-full shadow-sm text-gray-700 pointer-events-auto hover:bg-gray-50 transition-colors"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={20} strokeWidth={2} /> : <Menu size={20} strokeWidth={2} />}
                    </button>
                </div>

                {/* Mobile Menu Dropdown */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full pointer-events-auto">
                    <AnimatePresence>
                        {mobileMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mt-4 bg-white border border-gray-100 rounded-2xl flex flex-col md:hidden shadow-xl max-h-[80vh] overflow-y-auto"
                            >
                                {user && (
                                    <div className="flex flex-col gap-3 p-6 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm overflow-hidden text-gray-600 font-semibold">
                                                {avatarSrc ? (
                                                    <img loading="lazy" decoding="async" src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    user.email[0].toUpperCase()
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">{user.email.split('@')[0]}</div>
                                                <div className="text-[12px] text-gray-500 mt-0.5">{user.email}</div>
                                            </div>
                                        </div>
                                        {profileIncomplete && (
                                            <span className="text-[10px] mt-1 inline-block self-start font-bold bg-orange-100 text-orange-600 px-3 py-1 rounded-full">
                                                PROFILE INCOMPLETE
                                            </span>
                                        )}
                                    </div>
                                )}

                                <div className="flex flex-col p-2">
                                    {currentNavItems.map((item) => {
                                        const isAnchor = item.href.includes('#');
                                        const LinkComponent = isAnchor && pathname !== '/' ? 'a' : Link;

                                        return (
                                            <LinkComponent
                                                key={item.label}
                                                href={item.href}
                                                className="text-[14px] font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-xl flex items-center gap-3 p-4 transition-colors"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                {/* @ts-ignore */}
                                                {user && item.icon && <item.icon size={18} className="text-gray-400" />}
                                                {item.label}
                                            </LinkComponent>
                                        );
                                    })}

                                    {user ? (
                                        <>
                                            <div className="my-2 border-t border-gray-100" />
                                            <Link href="/dashboard/profile" className="flex items-center gap-3 p-4 text-[14px] font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors" onClick={() => setMobileMenuOpen(false)}>
                                                <User size={18} className="text-gray-400" /> Profile
                                            </Link>
                                            <Link href="/dashboard/settings" className="flex items-center gap-3 p-4 text-[14px] font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors" onClick={() => setMobileMenuOpen(false)}>
                                                <Settings size={18} className="text-gray-400" /> Settings
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    logout();
                                                    setMobileMenuOpen(false);
                                                }}
                                                className="flex items-center justify-start gap-3 p-4 text-[14px] font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors mt-2"
                                            >
                                                <LogOut size={18} /> Sign out
                                            </button>
                                        </>
                                    ) : (
                                        <div className="flex flex-col gap-2 p-4 mt-2">
                                            <Link href="/login" className="w-full text-center p-3 rounded-xl text-[14px] font-medium text-gray-700 hover:bg-gray-100 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                                                Login
                                            </Link>
                                            <Link href="/register" className="w-full text-center p-3 rounded-xl bg-gray-900 text-white text-[14px] font-medium hover:bg-gray-800 transition-colors shadow-sm" onClick={() => setMobileMenuOpen(false)}>
                                                Get Started
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </nav>
        </ScrollProgressProvider>
    );
}
