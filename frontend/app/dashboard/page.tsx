'use client';

import { fetchApi } from '../lib/apiClient';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDashboardMode } from '../context/DashboardModeContext';
import SimulationDashboard from '../components/dashboard/SimulationDashboard';
import UpgradeNowCard from '../components/dashboard/UpgradeNowCard';
import {
    ArrowRight, Mic, Brain, Award,
    Search, Target, FileText,
    Users, MessageSquare, Zap,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface DashboardStats {
    readinessScore: number;
    problemsSolved: number;
    interviewsCompleted: number;
    streakDays: number;
    skillProficiency: number[];
    recentActivity: Array<{ title: string; time: string; icon: string; color: string }>;
}

/* ─── Feature Card ─────────────────────────────────────────────── */
interface FeatureCardProps {
    href: string;
    imageSrc: string;
    imageAlt: string;
    badge?: string;
    badgeAccent?: boolean;
    title: string;
    description: string;
    bullets: Array<{ icon: React.ReactNode; text: string }>;
    ctaLabel: string;
    delay?: number;
    colSpan?: string;
    imagePosition?: string;
}

const appleFont = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif';
const appleTextFont = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif';

function FeatureCard({
    href, imageSrc, imageAlt, badge, badgeAccent,
    title, description, bullets, ctaLabel, delay = 0, colSpan = '',
    imagePosition = 'object-center'
}: FeatureCardProps) {
    return (
        <Link href={href} className={`block group ${colSpan}`}>
            <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay, ease: [0.25, 0.1, 0.25, 1] }}
                className="h-full bg-white border-2 border-[#202b20] hover:border-[#ffa116] transition-colors duration-200 flex flex-col"
            >
                {/* ── Image banner ── */}
                <div className="relative w-full h-56 border-b-2 border-[#202b20] group-hover:border-[#ffa116] overflow-hidden bg-[#f0ede8] flex-shrink-0 transition-colors duration-200">
                    <Image
                        src={imageSrc}
                        alt={imageAlt}
                        fill
                        className={`object-cover ${imagePosition}`}
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    {badge && (
                        <div className={`absolute top-3 left-3 text-[9px] font-[900] px-2 py-1 uppercase tracking-[0.15em] border-2 border-[#202b20] ${badgeAccent ? 'bg-[#ffa116] text-[#202b20]' : 'bg-[#202b20] text-white'}`}>
                            {badge}
                        </div>
                    )}
                </div>

                {/* ── Content ── */}
                <div className="p-6 flex flex-col flex-1">
                    <h3
                        className="text-[20px] font-[700] text-[#202b20] tracking-[-0.025em] leading-snug mb-2.5"
                        style={{ fontFamily: appleFont }}
                    >
                        {title}
                    </h3>
                    <p
                        className="text-[14px] text-[#202b20]/50 leading-[1.6] mb-5 font-[400] tracking-[-0.01em]"
                        style={{ fontFamily: appleTextFont }}
                    >
                        {description}
                    </p>

                    <ul className="space-y-2.5 mb-6 flex-1">
                        {bullets.map((b, i) => (
                            <li key={i} className="flex items-center gap-2.5">
                                <div className="w-5 h-5 bg-[#202b20] flex items-center justify-center text-white shrink-0">
                                    {b.icon}
                                </div>
                                <span
                                    className="text-[13px] font-[600] text-[#202b20]/75 tracking-[-0.01em]"
                                    style={{ fontFamily: appleTextFont }}
                                >
                                    {b.text}
                                </span>
                            </li>
                        ))}
                    </ul>

                    {/* CTA */}
                    <div className="flex items-center justify-between border-t-2 border-[#202b20] pt-4 mt-auto">
                        <span
                            className="text-[11px] font-[800] text-[#202b20] uppercase tracking-[0.12em] group-hover:text-[#ffa116] transition-colors"
                            style={{ fontFamily: appleFont }}
                        >
                            {ctaLabel}
                        </span>
                        <div className="w-7 h-7 bg-[#202b20] group-hover:bg-[#ffa116] flex items-center justify-center transition-colors border-2 border-[#202b20]">
                            <ArrowRight size={13} className="text-white group-hover:text-[#202b20] group-hover:translate-x-0.5 transition-all" />
                        </div>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}

/* ─── Page ─────────────────────────────────────────────────────── */
export default function DashboardPage() {
    const { user, isLoading: authLoading } = useAuth();
    const dashboardContext = useDashboardMode();
    const mode = dashboardContext?.mode;
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const normalizedPlan = (user?.subscriptionPlan || '').toLowerCase();
    const isFreeUser = normalizedPlan !== 'pro';
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && user) {
            const fetchStats = async () => {
                const { getActiveToken } = await import('@/app/lib/auth-storage');
                const token = getActiveToken();
                try {
                    const response = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/users/dashboard-stats`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) setStats(await response.json());
                } catch (err) {
                    console.error('Failed to fetch stats', err);
                } finally {
                    setLoading(false);
                }
            };
            fetchStats();
        }
    }, [authLoading, user]);

    if (mode === 'work') return <SimulationDashboard />;

    if (loading || !stats) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#202b20] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f7f7f5] text-foreground font-sans antialiased pb-24 pt-2">

            <div className="max-w-6xl mx-auto px-6 md:px-10 py-10 space-y-8">

                {/* ── Page Header ── */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                    className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b-2 border-[#202b20]"
                >
                    <div>
                        <h1
                            className="text-[32px] md:text-[38px] font-[700] text-[#202b20] tracking-[-0.04em] leading-none"
                            style={{ fontFamily: appleFont }}
                        >
                            Your Dashboard
                        </h1>
                    </div>

                    {/* Inline stats */}
                    <div className="flex items-center gap-5 sm:gap-7 pb-0.5">
                        {[
                            { label: 'Readiness', value: `${stats.readinessScore}%` },
                            { label: 'Streak', value: `${stats.streakDays}d` },
                            { label: 'Interviews', value: stats.interviewsCompleted },
                        ].map((s, i) => (
                            <div key={i} className={`text-right ${i > 0 ? 'pl-5 sm:pl-7 border-l-2 border-[#202b20]/10' : ''}`}>
                                <p className="text-[9px] font-[800] uppercase tracking-[0.15em] text-[#202b20]/35 mb-0.5"
                                    style={{ fontFamily: appleFont }}>{s.label}</p>
                                <p className="text-[20px] font-[800] text-[#202b20] leading-none tracking-[-0.03em]"
                                    style={{ fontFamily: appleFont }}>{s.value}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* ── Upgrade Banner (free users only) ── */}
                {isFreeUser && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: 0.05, ease: [0.25, 0.1, 0.25, 1] }}
                    >
                        <UpgradeNowCard />
                    </motion.div>
                )}

                {/* ── Feature Cards — even 2×2 grid ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* 1. Video Based AI Interview */}
                    <FeatureCard
                        href="/dashboard/interview"
                        imageSrc="/images/interview-hero.png"
                        imageAlt="Student doing a video AI interview"
                        imagePosition="object-center object-[50%_30%]"
                        badge="Flagship"
                        badgeAccent
                        title="Video Based AI Interview"
                        description="Practice with an AI interviewer that watches, listens, and adapts in real-time — company-specific questions, brutally honest feedback."
                        bullets={[
                            { icon: <Mic size={10} />, text: 'Live video & audio with speech recognition' },
                            { icon: <Brain size={10} />, text: 'Adaptive follow-ups based on your answers' },
                            { icon: <Award size={10} />, text: `${stats.interviewsCompleted} sessions completed on your account` },
                        ]}
                        ctaLabel="Start a Session"
                        delay={0.1}
                    />

                    {/* 2. Resume & ATS */}
                    <FeatureCard
                        href="/dashboard/resume"
                        imageSrc="/images/resume-hero.png"
                        imageAlt="Student reviewing their resume"
                        imagePosition="object-center object-[50%_20%]"
                        title="Resume & ATS Suite"
                        description="Build resumes that pass automated screening and get instant scoring against live tech industry benchmarks."
                        bullets={[
                            { icon: <Search size={10} />, text: 'Instant ATS keyword analysis' },
                            { icon: <Target size={10} />, text: 'Role-specific gap identification' },
                            { icon: <FileText size={10} />, text: 'One-click PDF & DOCX export' },
                        ]}
                        ctaLabel="Scan My Resume"
                        delay={0.15}
                    />

                    {/* 3. Mentorship */}
                    <FeatureCard
                        href="/dashboard/mentors"
                        imageSrc="/images/mentor-hero.png"
                        imageAlt="Student in a 1:1 mentorship session"
                        imagePosition="object-center object-[50%_25%]"
                        title="1:1 Expert Mentorship"
                        description="Pay-per-minute access to verified MNC engineers and tech leads. Get your specific doubts solved fast."
                        bullets={[
                            { icon: <Users size={10} />, text: '120+ verified engineers & team leads' },
                            { icon: <MessageSquare size={10} />, text: 'Chat, audio, or video — your choice' },
                            { icon: <Zap size={10} />, text: 'Average response under 3 minutes' },
                        ]}
                        ctaLabel="Find a Mentor"
                        delay={0.2}
                    />

                    {/* 4. Active Jobs */}
                    <FeatureCard
                        href="/dashboard/placement-drives"
                        imageSrc="/images/placement-drives-hero.png"
                        imageAlt="Student getting hired at a placement drive"
                        imagePosition="object-center object-[50%_35%]"
                        title="Active Jobs"
                        description="Explore live hiring opportunities matched to your skills and branch, then apply from a dedicated student flow with your resume link ready."
                        bullets={[
                            { icon: <Target size={10} />, text: 'Live company jobs updated daily' },
                            { icon: <Award size={10} />, text: 'Eligibility matched automatically' },
                            { icon: <Zap size={10} />, text: 'Dedicated apply page for every role' },
                        ]}
                        ctaLabel="Browse Jobs"
                        delay={0.25}
                    />

                </div>

            </div>
        </div>
    );
}
