'use client';

import React from 'react';
import Navbar from '@/app/components/layout/Navbar';
import Footer from '@/app/components/layout/Footer';
import DotBackground from '@/app/components/ui/DotBackground';
import { Terminal, Database, Cloud, Layout, GitPullRequest, Trello } from 'lucide-react';

const ROLES = [
    {
        title: 'Frontend Engineer',
        icon: Layout,
        color: 'text-brand-black',
        bg: 'bg-white border-2 border-gray-100',
        desc: 'Build responsive, accessible UIs using React, Next.js, and Tailwind. Implement pixel-perfect designs from Figma.'
    },
    {
        title: 'Backend Engineer',
        icon: Database,
        color: 'text-brand-black',
        bg: 'bg-white border-2 border-gray-100',
        desc: 'Design scalable APIs with NestJS and PostgreSQL. Manage database migrations, caching strategies, and security.'
    },
    {
        title: 'DevOps Engineer',
        icon: Cloud,
        color: 'text-brand-black',
        bg: 'bg-white border-2 border-gray-100',
        desc: 'Automate deployments with CI/CD pipelines. Manage docker containers and monitor system health.'
    },
    {
        title: 'Full Stack Developer',
        icon: Terminal,
        color: 'text-brand-orange',
        bg: 'bg-orange-50 border-2 border-orange-100',
        desc: 'Own the entire feature lifecycle. From database schema design to frontend integration and deployment.'
    }
];

export default function SimulationsPage() {
    return (
        <div className="min-h-screen bg-white font-sans text-brand-black relative selection:bg-brand-orange-hover selection:text-white">
            <DotBackground />
            <Navbar />

            <main className="relative z-10 pt-32 pb-32 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center max-w-3xl mx-auto mb-20 animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-brand-orange text-[11px] font-bold uppercase tracking-widest mb-6">
                            We2Hub — Virtual Internship
                        </div>
                        <h1 className="text-5xl md:text-6xl font-extrabold text-brand-black tracking-tight mb-6 leading-tight">
                            Experience the
                            <span className="text-brand-orange"> Real World.</span>
                        </h1>
                        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                            Don&apos;t just write code. Build software. We2Hub simulations mimic the tools, workflows, and pressure of a real tech company.
                        </p>
                    </div>

                    {/* Roles Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-32">
                        {ROLES.map((role, i) => (
                            <div key={i} className="p-8 rounded-2xl border border-gray-100 bg-white shadow-subtle hover:shadow-premium hover:-translate-y-1 transition-all duration-300">
                                <div className={`w-14 h-14 ${role.bg} ${role.color} rounded-xl flex items-center justify-center mb-6`}>
                                    <role.icon size={26} />
                                </div>
                                <h3 className="text-lg font-bold text-brand-black mb-3">{role.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{role.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* The Environment */}
                    <div className="bg-brand-black rounded-3xl p-8 md:p-12 overflow-hidden relative border border-gray-800">
                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div className="space-y-8">
                                <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                                    The "Stitch" Workflow. <br />
                                    <span className="text-brand-orange">Just like FAANG.</span>
                                </h2>
                                <p className="text-gray-400 text-lg leading-relaxed">
                                    We don't use toy problems. You join a team, pick up tickets from a board, create feature branches, and submit Pull Requests for review.
                                </p>

                                <ul className="space-y-4">
                                    <li className="flex items-center gap-4 text-white font-medium">
                                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-300 border border-gray-700">
                                            <Trello size={18} />
                                        </div>
                                        <span>Jira-style Kanban Boards</span>
                                    </li>
                                    <li className="flex items-center gap-4 text-white font-medium">
                                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-300 border border-gray-700">
                                            <GitPullRequest size={18} />
                                        </div>
                                        <span>Strict Git Flow & Code Reviews</span>
                                    </li>
                                    <li className="flex items-center gap-4 text-white font-medium">
                                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-brand-orange border border-gray-700">
                                            <Terminal size={18} />
                                        </div>
                                        <span>Production CI/CD Pipelines</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="relative rounded-xl overflow-hidden shadow-2xl border border-gray-800 bg-gray-900/50 backdrop-blur">
                                {/* Placeholder for Interface Image */}
                                <div className="aspect-video bg-gray-900 flex items-center justify-center text-gray-600">
                                    <span className="text-sm font-mono">Simulation Interface Preview</span>
                                </div>
                            </div>
                        </div>

                        {/* Background Glows */}
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-orange/5 blur-[100px] rounded-full pointer-events-none"></div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
