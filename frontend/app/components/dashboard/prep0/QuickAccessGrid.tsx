'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Video, FileText, ChevronRight, Layers } from 'lucide-react';
import Link from 'next/link';

const modules = [
    {
        title: 'IDE Workspace',
        desc: 'Practice and prototype in a fast coding space.',
        icon: Code2,
        href: '/dashboard/ide',
        color: 'text-sky-500',
        bg: 'bg-sky-500/10',
        border: 'border-sky-500/20'
    },
    {
        title: 'Mock Interview',
        desc: 'Practice under pressure, speak with conviction.',
        icon: Video,
        href: '/dashboard/interview',
        color: 'text-slate-400',
        bg: 'bg-slate-500/10',
        border: 'border-slate-500/20'
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {modules.map((item, index) => (
                <Link key={index} href={item.href} className="group outline-none">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        className={`
                            h-full relative overflow-hidden rounded-[24px] p-6 lg:p-8 cursor-pointer
                            bg-white/80 backdrop-blur-xl border border-white/60 
                            shadow-[0_8px_30px_-10px_rgba(0,0,0,0.04)]
                            hover:shadow-[0_20px_40px_-15px_rgba(79,70,229,0.15)]
                            hover:border-slate-200/50 hover:bg-white
                            transition-all duration-300 ease-out flex flex-col
                        `}
                    >
                        {/* Dynamic Ambient Glow Behind Card Content */}
                        <div className={`absolute top-0 right-0 w-32 h-32 ${item.bg} rounded-full blur-[50px] opacity-40 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none -translate-y-1/2 translate-x-1/2`}></div>
                        
                        <div className="relative z-10 flex items-start justify-between mb-8">
                            <div className={`p-4 rounded-2xl ${item.bg} ${item.color} shadow-inner border ${item.border} group-hover:scale-110 transition-transform duration-300 ease-out`}>
                                <item.icon size={28} strokeWidth={2} />
                            </div>
                            <div className={`
                                w-10 h-10 rounded-full flex items-center justify-center 
                                bg-slate-50 text-slate-400 border border-slate-100
                                group-hover:bg-gradient-to-tr group-hover:from-slate-600 group-hover:to-slate-500 
                                group-hover:text-white group-hover:border-transparent group-hover:shadow-lg group-hover:shadow-slate-200
                                transition-all duration-300 ease-out
                            `}>
                                <ChevronRight size={18} className="transform group-hover:translate-x-0.5 transition-transform" />
                            </div>
                        </div>

                        <div className="relative z-10 mt-auto">
                            <h3 className="text-xl font-extrabold text-slate-900 mb-2 tracking-tight group-hover:text-slate-950 transition-colors">{item.title}</h3>
                            <p className="text-[15px] text-slate-500 font-medium leading-relaxed group-hover:text-slate-600 transition-colors">{item.desc}</p>
                        </div>

                        {/* Accent Bottom Border Line */}
                        <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-slate-500/0 to-transparent group-hover:via-slate-500/40 transition-all duration-500"></div>
                    </motion.div>
                </Link>
            ))}
        </div>
    );
}
