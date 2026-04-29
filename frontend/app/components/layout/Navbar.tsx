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
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Active Jobs', href: '/active-jobs' },
    { label: 'Blog', href: '/blog' },
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
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 sm:px-6 backdrop-blur-none",
                isScrolled ? "py-3 bg-white/70 backdrop-blur-xl border-b border-[#202b20]/5 shadow-sm" : "pt-5 pointer-events-none",
                mobileMenuOpen ? "bg-white/95 backdrop-blur-md pointer-events-auto h-screen py-5" : ""
            )}>
                <ScrollProgress 
                    className="absolute top-0 left-0 h-[3px] bg-[#ffa116] origin-left z-[60] shadow-[0_0_10px_rgba(255,161,22,0.8)]" 
                />
                
                <div className="max-w-7xl mx-auto h-[46px] sm:h-12 flex items-stretch justify-between gap-3 sm:gap-4 pointer-events-auto shadow-none">
                    
                    {/* Brand Logo - Pure Text */}
                    <Link href={user ? "/dashboard" : "/"} className="flex flex-col justify-center px-2 sm:px-4 group transition-transform hover:scale-[1.02]">
                        <span className="text-[1.4rem] sm:text-[1.6rem] font-[900] tracking-tighter text-[#202b20] leading-none mb-1">
                            emble
                        </span>
                    </Link>

                    {/* Nav Links Block */}
                    <div className="hidden md:flex bg-white border-2 border-[#202b20] shadow-[2px_2px_0px_0px_#202b20] items-stretch">
                        <div className="flex items-stretch font-[500] text-[14px] lg:text-[15px] tracking-tight text-[#202b20]">
                            {isDashboardLayout ? (
                                dashboardNavItems.map((item, idx) => (
                                    <Link
                                        key={item.label}
                                        href={item.href!}
                                        className={cn(
                                            "flex items-center gap-2 px-4 lg:px-5 hover:bg-[#202b20] hover:text-white transition-colors relative",
                                            idx !== dashboardNavItems.length - 1 ? "border-r-2 border-[#202b20]" : ""
                                        )}
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
                                    const hasBullet = item.label === 'Pricing' || item.label === 'Active Jobs';

                                    return (
                                        <LinkComponent
                                            key={item.label}
                                            href={item.href}
                                            className={cn(
                                                "flex items-center gap-2 px-4 lg:px-5 hover:bg-[#202b20] hover:text-white transition-colors relative group",
                                                idx !== currentNavItems.length - 1 ? "border-r-2 border-[#202b20]" : ""
                                            )}
                                        >
                                            {/* @ts-ignore - icon is optional */}
                                            {user && item.icon && <item.icon size={16} />}
                                            <span className="flex items-center gap-2">
                                                {hasBullet && <span className="w-1.5 h-1.5 bg-[#202b20] inline-block group-hover:bg-[#ffa116] transition-colors"></span>}
                                                {item.label}
                                            </span>
                                        </LinkComponent>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Right Block */}
                    <div className="hidden md:flex bg-white border-2 border-[#202b20] shadow-[2px_2px_0px_0px_#202b20] items-stretch">
                        {user ? (
                            <div className="relative flex" ref={userMenuRef}>
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-3 px-5 hover:bg-[#ffa116] text-[#202b20] transition-colors text-[10px] lg:text-[12px] tracking-widest border-l-[0px] border-[#202b20]"
                                >
                                    <div className="w-[22px] h-[22px] border-2 border-[#202b20] shadow-[2px_2px_0px_0px_#202b20] flex items-center justify-center bg-white font-bold text-[10px] shrink-0 overflow-hidden relative">
                                        {avatarSrc ? (
                                            <img loading="lazy" decoding="async" src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            user.email[0].toUpperCase()
                                        )}
                                        {profileIncomplete && (
                                            <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full bg-red-500"></span>
                                                <span className="relative inline-flex h-2 w-2 bg-red-500 border border-[#202b20]"></span>
                                            </span>
                                        )}
                                    </div>
                                    <span className="max-w-[70px] lg:max-w-[100px] truncate leading-none mt-1">{user.email.split('@')[0]}</span>
                                    <ChevronDown size={14} className="mt-0.5" />
                                </button>

                                <AnimatePresence>
                                    {userMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute right-[-2px] xl:right-0 top-[calc(100%+14px)] w-56 bg-white border-2 border-[#202b20] shadow-[3px_3px_0px_0px_#202b20] text-[#202b20] overflow-hidden flex flex-col pt-1"
                                        >
                                            <div className="px-4 py-3 border-b-2 border-[#202b20] bg-white">
                                                <p className="text-[9px] font-bold tracking-widest text-[#ffa116]">SIGNED IN AS</p>
                                                <p className="text-[12px] mt-1 truncate">{user.email}</p>
                                                <p className="text-[9px] mt-1.5 italic bg-[#202b20]/5 p-1 inline-block border border-[#202b20]">{getDisplayPlan(user.subscriptionPlan)} PLAN</p>
                                            </div>

                                            <Link href="/dashboard/profile" className="flex items-center justify-between px-4 py-3 text-[11px] tracking-wider hover:bg-[#202b20] hover:text-white transition-colors border-b-2 border-[#202b20]" onClick={() => setUserMenuOpen(false)}>
                                                <div className="flex items-center gap-2">
                                                    <User size={14} />
                                                    <span className="mt-0.5">PROFILE</span>
                                                </div>
                                                {profileIncomplete && <span className="text-[8px] bg-[#ffa116] text-[#202b20] border-2 border-[#202b20] px-1.5 shadow-[2px_2px_0px_0px_#202b20]">INCOMPLETE</span>}
                                            </Link>
                                            <Link href="/dashboard/settings" className="flex items-center justify-between px-4 py-3 text-[11px] tracking-wider hover:bg-[#202b20] hover:text-white transition-colors border-b-2 border-[#202b20]" onClick={() => setUserMenuOpen(false)}>
                                                <div className="flex items-center gap-2">
                                                    <Settings size={14} />
                                                    <span className="mt-0.5">SETTINGS</span>
                                                </div>
                                                {profileIncomplete && <span className="w-2 h-2 bg-red-500 border border-[#202b20]"></span>}
                                            </Link>

                                            <button
                                                onClick={() => {
                                                    logout();
                                                    setUserMenuOpen(false);
                                                }}
                                                className="w-full flex items-center justify-start gap-2 px-4 py-3 text-[11px] tracking-wider hover:bg-[#ffa116] hover:text-[#202b20] transition-colors"
                                            >
                                                <LogOut size={14} />
                                                <span className="mt-0.5">SIGN OUT</span>
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <>
                                <Link href="/login" className="flex items-center px-4 lg:px-6 hover:bg-[#202b20] hover:text-white transition-colors text-[14px] lg:text-[15px] font-[500] tracking-tight text-[#202b20]">
                                    <span className="mt-1">Login</span>
                                </Link>
                                <Link href="/register" className="flex items-center px-4 lg:px-6 bg-[#ffa116] text-[#202b20] hover:bg-[#202b20] hover:text-white transition-colors border-l-2 border-[#202b20] text-[14px] lg:text-[15px] font-[500] tracking-tight leading-none pt-1">
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                        className="md:hidden flex items-center justify-center w-[46px] bg-white border-2 border-[#202b20] shadow-[2px_2px_0px_0px_#202b20] text-[#202b20] pointer-events-auto hover:bg-[#ffa116] transition-colors active:translate-y-[2px] active:translate-x-[2px] active:shadow-[2px_2px_0px_0px_#202b20]"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={20} strokeWidth={3} /> : <Menu size={20} strokeWidth={3} />}
                    </button>
                </div>

                {/* Mobile Menu dropdown inside the relatively floating space */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full pointer-events-auto">
                    {mobileMenuOpen && (
                        <div className="mt-4 bg-white border-2 border-[#202b20] flex flex-col md:hidden shadow-[3px_3px_0px_0px_#202b20] animate-fade-in-up max-h-[80vh] overflow-y-auto">
                            {user && (
                                <div className="flex flex-col gap-2 p-5 border-b-2 border-[#202b20] bg-white">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 border-2 border-[#202b20] shadow-[2px_2px_0px_0px_#202b20] flex items-center justify-center bg-[#ffa116] font-bold text-xs shrink-0 overflow-hidden">
                                            {avatarSrc ? (
                                                <img loading="lazy" decoding="async" src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                user.email[0].toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-[600] text-[#202b20] text-sm">{user.email.split('@')[0]}</div>
                                            <div className="text-[10px] tracking-wide mt-1">{user.email}</div>
                                        </div>
                                    </div>
                                    {profileIncomplete && (
                                        <span className="text-[10px] mt-2 inline-block self-start font-bold bg-[#ffa116] text-[#202b20] border-2 border-[#202b20] px-2 py-0.5 shadow-[2px_2px_0px_0px_#202b20]">
                                            PROFILE INCOMPLETE
                                        </span>
                                    )}
                                </div>
                            )}

                            <div className="flex flex-col bg-white">
                                {currentNavItems.map((item) => {
                                    const isAnchor = item.href.includes('#');
                                    const LinkComponent = isAnchor && pathname !== '/' ? 'a' : Link;
                                    
                                    return (
                                        <LinkComponent
                                            key={item.label}
                                            href={item.href}
                                            className="text-[13px] tracking-widest font-[600] text-[#202b20] hover:bg-[#ffa116] flex items-center gap-3 p-5 border-b-2 border-[#202b20] transition-colors group"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            {/* @ts-ignore */}
                                            {user && item.icon && <item.icon size={18} />}
                                            <span className="w-1.5 h-1.5 bg-transparent group-hover:bg-[#202b20] inline-block"></span>
                                            {item.label}
                                        </LinkComponent>
                                    );
                                })}

                                {user ? (
                                    <>
                                        <Link href="/dashboard/profile" className="flex items-center gap-3 p-5 text-[13px] tracking-widest font-[600] border-b-2 border-[#202b20] hover:bg-[#202b20] hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>
                                            <User size={18} /> PROFILE
                                        </Link>
                                        <Link href="/dashboard/settings" className="flex items-center gap-3 p-5 text-[13px] tracking-widest font-[600] border-b-2 border-[#202b20] hover:bg-[#202b20] hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>
                                            <Settings size={18} /> SETTINGS
                                        </Link>
                                        <button
                                            onClick={() => {
                                                logout();
                                                setMobileMenuOpen(false);
                                            }}
                                            className="flex items-center justify-start gap-3 p-5 text-[13px] tracking-widest font-[600] text-[#202b20] bg-[#ffa116] hover:bg-[#ff9100] transition-colors"
                                        >
                                            <LogOut size={18} /> SIGN OUT
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex flex-col">
                                        <Link href="/login" className="text-left p-5 text-[13px] tracking-widest font-[600] text-[#202b20] hover:bg-[#ffa116] border-b-2 border-[#202b20] transition-colors" onClick={() => setMobileMenuOpen(false)}>
                                            LOGIN
                                        </Link>
                                        <Link href="/register" className="bg-[#ffa116] text-[#202b20] p-5 text-left text-[13px] tracking-widest font-[600] hover:bg-[#ff9100] transition-colors" onClick={() => setMobileMenuOpen(false)}>
                                            GET STARTED
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </nav>
        </ScrollProgressProvider>
    );
}
