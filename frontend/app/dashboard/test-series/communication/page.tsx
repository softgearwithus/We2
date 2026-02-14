'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Languages, Mail, PenTool, Users, Lock, ChevronRight } from 'lucide-react';

const COMMUNICATION_MODULES = [
    {
        title: 'Amcat English',
        icon: Languages,
        count: '12 Tests',
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        desc: 'Grammar, vocabulary, and error correction mastery.'
    },
    {
        title: 'WriteX Essay Writing',
        icon: PenTool,
        count: '5 Mock Rounds',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        desc: 'AI-evaluated essay writing practice for Wipro/Amcat.'
    },
    {
        title: 'Verbal Ability',
        icon: BookOpen,
        count: '15 Tests',
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        desc: 'Reading comprehension, para-jumbles, and logic.'
    },
    {
        title: 'Situational Judgment',
        icon: Users,
        count: '8 Scenarios',
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        desc: 'HR round preparation and workplace ethics.'
    },
    {
        title: 'Business Communication',
        icon: Mail,
        count: '6 Modules',
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
        desc: 'Email etiquette, corporate communication standards.'
    },
];

export default function CommunicationTestsPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-700">
            <div className="max-w-7xl mx-auto p-6 lg:p-12">
                <header className="mb-12">
                    <Link href="/dashboard/test-series" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium mb-6 transition-colors group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Test Series
                    </Link>
                    <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
                        Communication Skills <span className="text-emerald-600">.</span>
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl">
                        Master the verbal and written skills top companies demand. From Amcat English to automated essay grading.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {COMMUNICATION_MODULES.map((module, idx) => (
                        <div key={idx} className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:translate-y-[-4px] transition-all duration-300 cursor-pointer group flex flex-col justify-between h-full">
                            <div>
                                <div className={`w-16 h-16 ${module.bg} ${module.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <module.icon size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">{module.title}</h3>
                                <p className="text-slate-500 font-medium text-sm mb-2 uppercase tracking-wider">{module.count}</p>
                                <p className="text-slate-500 leading-relaxed text-base mb-8">
                                    {module.desc}
                                </p>
                            </div>

                            <button className="w-full py-4 rounded-xl border-2 border-slate-100 text-slate-700 font-bold text-base hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all flex items-center justify-center gap-2 group-hover:shadow-md">
                                <Lock size={18} className="text-slate-400 group-hover:text-emerald-500 transition-colors" /> Unlock Module
                            </button>
                        </div>
                    ))}

                    {/* Coming Soon Card */}
                    <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-200 border-dashed flex flex-col items-center justify-center text-center opacity-60 hover:opacity-100 transition-opacity">
                        <div className="w-16 h-16 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-3xl">more_horiz</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-700 mb-2">More Coming Soon</h3>
                        <p className="text-slate-500">We are adding interview speech analysis and more.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
