'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/app/lib/utils';
import { Menu, X, Terminal, User, LogOut, Settings, LayoutDashboard, BookOpen, Video, Code2, ChevronDown, School, CircuitBoard, Map } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { useDashboardMode } from '@/app/context/DashboardModeContext';
import { motion, AnimatePresence } from 'framer-motion';

const getDisplayPlan = (plan?: string) => {
    if (!plan || plan === 'free') return 'Free';
    if (plan === 'standard' || plan === 'placement_plus' || plan.includes('standard')) return 'EMBLE Standard';
    if (plan === 'pro' || plan === 'we2_max' || plan.includes('pro')) return 'EMBLE Pro';
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

    const guestNavItems = [
        { label: 'Bootcamp Curriculum', href: '/curriculum' },
        { label: 'How it Works', href: '/how-it-works' },
        { label: 'Pricing', href: '/pricing' }
    ];

    const authNavItems = [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Pricing', href: '/pricing', icon: null } // Kept for upgrades
    ];

    const currentNavItems = user ? authNavItems : guestNavItems;

    // Items to show specifically when INSIDE the dashboard layout (context is present)
    const dashboardNavItems = [
        { label: 'Roadmap', href: '/dashboard/preparation', icon: Map },
        { label: 'Pricing', href: '/pricing', icon: null }
    ];

    const getAvatarSrc = (url?: string | null) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
    };

    const avatarSrc = user ? getAvatarSrc(user.avatarUrl) : null;

    return (
        <nav className={cn(
            "fixed top-0 left-0 right-0 z-50 transition-all duration-200 border-b",
            isScrolled || mobileMenuOpen ? "bg-white/90 backdrop-blur-md border-gray-200 shadow-sm" : "bg-transparent border-transparent"
        )}>
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

                {/* Brand */}
                <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-brand-orange rounded flex items-center justify-center transition-transform group-hover:rotate-12">
                        <Terminal size={18} className="text-white" strokeWidth={3} />
                    </div>
                    <span className={cn(
                        "text-lg font-bold tracking-tight transition-colors",
                        isDarkBg ? "text-white" : "text-brand-black"
                    )}>
                        EMBLE
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className={cn(
                    "hidden md:flex items-center gap-8 text-sm font-medium transition-colors",
                    isDarkBg ? "text-white/80" : "text-gray-500"
                )}>
                    {isDashboardLayout ? (
                        // Dashboard Mode Items
                        dashboardNavItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href!}
                                className="hover:text-brand-orange transition-colors py-2 flex items-center gap-1.5"
                            >
                                {/* @ts-ignore */}
                                {item.icon && <item.icon size={16} />}
                                {item.label}
                            </Link>
                        ))
                    ) : (
                        // Standard Auth/Guest Items
                        (user ? authNavItems : guestNavItems).map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={cn(
                                    "hover:text-brand-orange transition-colors py-2 flex items-center gap-1.5",
                                    pathname === item.href
                                        ? (isDarkBg ? "text-white font-bold" : "text-brand-black font-semibold")
                                        : ""
                                )}
                            >
                                {/* @ts-ignore - icon is optional */}
                                {user && item.icon && <item.icon size={16} />}
                                {item.label}
                            </Link>
                        ))
                    )}
                </div>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-4">
                    {user ? (
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center gap-2 hover:bg-gray-100 p-1.5 pr-3 rounded-full transition-colors border border-transparent hover:border-gray-200"
                            >
                                <div className="relative w-8 h-8 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange font-bold text-sm shrink-0">
                                    {avatarSrc ? (
                                        <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                                    ) : (
                                        user.email[0].toUpperCase()
                                    )}
                                    {profileIncomplete && (
                                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 border-2 border-white"></span>
                                        </span>
                                    )}
                                </div>
                                <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">{user.email.split('@')[0]}</span>
                                <ChevronDown size={14} className="text-gray-400" />
                            </button>

                            <AnimatePresence>
                                {userMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-1"
                                    >
                                        <div className="px-4 py-3 border-b border-gray-50">
                                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Signed in as</p>
                                            <p className="text-sm font-bold text-brand-black truncate">{user.email}</p>
                                            <p className="text-xs text-brand-orange mt-1 font-medium capitalize">{getDisplayPlan(user.subscriptionPlan)} Plan</p>
                                        </div>

                                        <Link href="/dashboard/profile" className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-brand-black transition-colors" onClick={() => setUserMenuOpen(false)}>
                                            <div className="flex items-center gap-2">
                                                <User size={16} />
                                                Profile
                                            </div>
                                            {profileIncomplete && <span className="text-[10px] font-bold bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">Incomplete</span>}
                                        </Link>
                                        <Link href="/dashboard/settings" className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-brand-black transition-colors" onClick={() => setUserMenuOpen(false)}>
                                            <div className="flex items-center gap-2">
                                                <Settings size={16} />
                                                Settings
                                            </div>
                                            {profileIncomplete && <span className="w-2 h-2 rounded-full bg-rose-500"></span>}
                                        </Link>

                                        <div className="border-t border-gray-50 mt-1">
                                            <button
                                                onClick={() => {
                                                    logout();
                                                    setUserMenuOpen(false);
                                                }}
                                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                                            >
                                                <LogOut size={16} />
                                                Sign out
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <>
                            <Link href="/login" className={cn(
                                "text-sm font-medium transition-colors px-3 py-2",
                                isDarkBg ? "text-white hover:text-white/80" : "text-gray-500 hover:text-brand-black"
                            )}>
                                Sign in
                            </Link>
                            <Link href="/register" className="bg-brand-orange hover:bg-brand-orange-hover text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-subtle hover:shadow-md">
                                Get Started
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className={cn(
                        "md:hidden transition-colors",
                        isDarkBg ? "text-white" : "text-gray-600"
                    )}
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-100 p-6 flex flex-col gap-4 md:hidden shadow-xl animate-fade-in-up max-h-[calc(100vh-4rem)] overflow-y-auto">
                    {user && (
                        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                            <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange font-bold shrink-0">
                                {avatarSrc ? (
                                    <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                                ) : (
                                    user.email[0].toUpperCase()
                                )}
                            </div>
                            <div>
                                <div className="font-bold text-brand-black">{user.email.split('@')[0]}</div>
                                <div className="text-xs text-gray-500">{user.email}</div>
                            </div>
                        </div>
                    )}

                    {currentNavItems.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="text-lg font-medium text-gray-600 hover:text-brand-orange flex items-center gap-3"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {/* @ts-ignore */}
                            {user && item.icon && <item.icon size={20} />}
                            {item.label}
                        </Link>
                    ))}
                    <hr className="border-gray-100" />

                    {user ? (
                        <>
                            <Link href="/dashboard/profile" className="flex items-center gap-3 py-2 text-gray-600" onClick={() => setMobileMenuOpen(false)}>
                                <User size={20} /> Profile
                            </Link>
                            <Link href="/dashboard/settings" className="flex items-center gap-3 py-2 text-gray-600" onClick={() => setMobileMenuOpen(false)}>
                                <Settings size={20} /> Settings
                            </Link>
                            <button
                                onClick={() => {
                                    logout();
                                    setMobileMenuOpen(false);
                                }}
                                className="flex items-center gap-3 py-2 text-red-600 font-medium text-left"
                            >
                                <LogOut size={20} /> Sign out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="text-center py-2 font-medium text-gray-600">
                                Sign in
                            </Link>
                            <Link href="/register" className="bg-brand-orange text-white py-3 rounded-lg text-center font-bold">
                                Create Account
                            </Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}
