'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Briefcase, FileText, Code, Mic, Users } from 'lucide-react';

const themes = [
    { id: 'all', label: 'All Features' },
    { id: 'assessments', label: 'Assessments' },
    { id: 'skills', label: 'Skill Building' },
    { id: 'career', label: 'Career Tools' }
];

const cards = [
    {
        id: 'test-series',
        theme: 'assessments',
        title: 'Platform Test Series',
        description: 'Company-agnostic coding assessments measuring logic, algorithms, and databases.',
        icon: Code,
        color: 'from-blue-500/20 to-indigo-500/20',
        textColor: 'text-blue-600',
    },
    {
        id: 'project-labs',
        theme: 'skills',
        title: 'Interactive Project Labs',
        description: 'Step-by-step guided virtual environments to build production-ready applications.',
        icon: Briefcase,
        color: 'from-emerald-500/20 to-teal-500/20',
        textColor: 'text-emerald-600',
    },
    {
        id: 'mock-interviews',
        theme: 'assessments',
        title: 'AI & Peer Mock Interviews',
        description: 'Live collaborative coding and behavioral pressure-testing sessions.',
        icon: Mic,
        color: 'from-rose-500/20 to-red-500/20',
        textColor: 'text-rose-600',
    },
    {
        id: 'mentorship',
        theme: 'skills',
        title: '1:1 Mentorship Sessions',
        description: 'Direct architecture reviews and unblocking by existing industry engineers.',
        icon: Users,
        color: 'from-purple-500/20 to-fuchsia-500/20',
        textColor: 'text-purple-600',
    },
    {
        id: 'resume-scanner',
        theme: 'career',
        title: 'Resume ATS Scanner',
        description: 'Automated formatting check and keyword optimization against actual ATS software.',
        icon: FileText,
        color: 'from-amber-500/20 to-orange-500/20',
        textColor: 'text-amber-600',
    }
];

export default function EngagementFilterHub() {
    const [activeTheme, setActiveTheme] = useState('all');

    const filteredCards = cards.filter(c => activeTheme === 'all' || c.theme === activeTheme);

    return (
        <div className="w-full space-y-6">
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {themes.map(theme => (
                    <button
                        key={theme.id}
                        onClick={() => setActiveTheme(theme.id)}
                        className={`px-5 py-2 rounded-full text-[13px] font-bold transition-all shadow-sm flex-shrink-0
                            ${activeTheme === theme.id
                                ? 'bg-primary text-primary-foreground shadow-md'
                                : 'bg-card text-foreground/60 hover:text-foreground border border-border hover:border-border/80'
                            }`}
                    >
                        {theme.label}
                    </button>
                ))}
            </div>

            {/* List Array (Card-23 Button Aesthetic) */}
            <div className="grid grid-cols-1 gap-3">
                <AnimatePresence mode="popLayout">
                    {filteredCards.map((card, i) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2, delay: i * 0.05 }}
                            key={card.id}
                        >
                            <button className="w-full group/btn text-left relative overflow-hidden bg-card border border-border hover:border-border/80 rounded-[24px] p-4 flex items-center justify-between gap-4 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                                
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br ${card.color}`}>
                                        <card.icon className={`${card.textColor}`} size={24} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-[16px] font-black tracking-tight text-card-foreground truncate">
                                            {card.title}
                                        </h4>
                                        <p className="text-[13px] font-medium text-foreground/60 mt-0.5 truncate pr-4">
                                            {card.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="shrink-0 w-12 h-12 rounded-full border border-border/50 bg-background flex items-center justify-center transition-all duration-300 shadow-sm text-foreground/40 overflow-hidden relative">
                                    <div className="absolute inset-0 bg-primary opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 z-0" />
                                    <ArrowUpRight size={20} strokeWidth={2.5} className="relative z-10 group-hover/btn:translate-x-[1px] group-hover/btn:-translate-y-[1px] group-hover/btn:text-primary-foreground transition-all" />
                                </div>
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
