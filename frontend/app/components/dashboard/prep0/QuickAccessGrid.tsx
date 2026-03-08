'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Database, Video, FileText, ChevronRight, Layers } from 'lucide-react';
import Link from 'next/link';

const modules = [
    {
        title: 'DSA Training',
        desc: 'Sharpen logic until hard problems feel familiar.',
        icon: Database,
        href: '/dashboard/dsa',
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20'
    },
    {
        title: 'SQL Training',
        desc: 'Turn data into clear, confident decisions.',
        icon: Code2,
        href: '/dashboard/sql',
        color: 'text-sky-500',
        bg: 'bg-sky-500/10',
        border: 'border-sky-500/20'
    },
    {
        title: 'Mock Interview',
        desc: 'Practice under pressure, speak with conviction.',
        icon: Video,
        href: '/dashboard/interview',
        color: 'text-purple-400',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20'
    },
    {
        title: 'Resume Builder',
        desc: 'Craft a story recruiters remember instantly.',
        icon: FileText,
        href: '/dashboard/resume',
        border: 'border-emerald-500/20'
    },
    {
        title: 'Project Labs',
        desc: 'Build proof of skill that speaks for itself.',
        icon: Layers,
        href: '/dashboard/projects',
        color: 'text-orange-400',
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/20'
    },
    // Skill Forge hidden for now; re-enable by restoring module below.
    // {
    //     title: 'Skill Forge',
    //     desc: 'Master New Technologies',
    //     icon: MonitorPlay,
    //     href: '/dashboard/skillforge',
    //     color: 'text-orange-400',
    //     bg: 'bg-orange-500/10',
    //     border: 'border-orange-500/20'
    // }
];

export default function QuickAccessGrid() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modules.map((item, index) => (
                <Link key={index} href={item.href}>
                    <motion.div
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        className={`h-full bg-white border border-slate-100 rounded-2xl p-6 cursor-pointer shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.08)] hover:border-indigo-100 group transition-all duration-300 relative overflow-hidden`}
                    >
                        {/* Hover Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                        <div className="relative z-10 flex items-start justify-between">
                            <div className={`p-3.5 rounded-xl ${item.bg} ${item.color} mb-5 shadow-inner`}>
                                <item.icon size={26} />
                            </div>
                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm group-hover:shadow-md group-hover:shadow-indigo-200">
                                <ChevronRight size={16} />
                            </div>
                        </div>
                        <h3 className="relative z-10 text-lg font-bold text-slate-900 mb-1 tracking-tight">{item.title}</h3>
                        <p className="relative z-10 text-sm text-slate-500 font-medium group-hover:text-slate-600 transition-colors">{item.desc}</p>
                    </motion.div>
                </Link>
            ))}
        </div>
    );
}
