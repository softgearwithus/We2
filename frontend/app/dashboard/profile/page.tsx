'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy, Medal, MapPin,
    Calendar, Code, Briefcase,
    Github, Linkedin, Globe, Edit3, X, XCircle, CheckCircle
} from 'lucide-react';
import Link from 'next/link';

// Mock Data for the Profile
const USER_DATA = {
    username: 'alex_codes',
    name: 'Alex Johnson',
    role: 'Full Stack Engineer',
    location: 'San Francisco, CA',
    joined: 'Sep 2024',
    rank: 12450,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    links: {
        github: 'github.com/alexcodes',
        linkedin: 'linkedin.com/in/alexj',
        website: 'alex.dev'
    },
    stats: {
        views: 342,
        solutions: 45,
        reputation: 120
    }
};

const SOLVED_DATA = {
    total: 128,
    totalAttempted: 262,
    dsa: { label: 'DSA Problems', solved: 95, total: 192, color: 'text-indigo-500', bg: 'bg-indigo-500' },
    sql: { label: 'SQL Problems', solved: 25, total: 50, color: 'text-blue-500', bg: 'bg-blue-500' },
    projects: { label: 'Project Labs', solved: 8, total: 20, color: 'text-amber-500', bg: 'bg-amber-500' }
};

const BADGES = [
    { title: '100 Days Badge', icon: '🗓️' },
    { title: 'Dynamic Programming I', icon: '🧠' },
    { title: 'Graph Theory', icon: '🕸️' },
    { title: 'Top 5%', icon: '🏆' },
];

const SKILLS = [
    { name: 'JavaScript', count: 120 },
    { name: 'Python', count: 95 },
    { name: 'Java', count: 60 },
    { name: 'C++', count: 40 },
    { name: 'SQL', count: 35 },
];

const RECENT_SUBMISSIONS = [
    { title: 'Two Sum', type: 'DSA', status: 'Accepted', time: '10 mins ago', lang: 'JavaScript' },
    { title: 'Employee Bonus (Join)', type: 'SQL', status: 'Accepted', time: '2 hours ago', lang: 'PostgreSQL' },
    { title: 'E-Commerce Dashboard UI', type: 'Project Lab', status: 'Uploaded', time: '5 hours ago', lang: 'React' },
    { title: 'Add Two Numbers', type: 'DSA', status: 'Accepted', time: '1 day ago', lang: 'Java' },
    { title: 'Task Management API', type: 'Project Lab', status: 'Uploaded', time: '2 days ago', lang: 'Node.js' },
];

export default function LeetCodeProfile() {
    return (
        <div className="min-h-screen bg-[#fafafa] font-sans text-slate-900 pb-20">
            <div className="max-w-[1200px] mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-6">

                {/* LEFT SIDEBAR (User Info) */}
                <div className="w-full md:w-[320px] shrink-0 space-y-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        {/* Avatar & Basic Info */}
                        <div className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 mb-4 border border-slate-200">
                                    <Image src={USER_DATA.avatar} alt="Avatar" width={96} height={96} className="object-cover" />
                                </div>
                                <Link href="/dashboard/settings" className="text-slate-400 hover:text-indigo-600 transition-colors p-2 bg-slate-50 hover:bg-indigo-50 rounded-lg">
                                    <Edit3 size={18} />
                                </Link>
                            </div>
                            <h1 className="text-xl font-bold text-slate-900">{USER_DATA.name}</h1>
                            <p className="text-slate-500 font-medium text-sm mb-4">@{USER_DATA.username}</p>

                            <div className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2">
                                <Trophy size={16} className="text-amber-500" /> Rank ~{USER_DATA.rank.toLocaleString()}
                            </div>

                            <p className="text-xs text-slate-500 flex items-center gap-2 mb-4">
                                <Briefcase size={14} /> {USER_DATA.role}
                            </p>

                            <Link href="/dashboard/settings" className="w-full block text-center py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors mb-6">
                                Edit Profile
                            </Link>

                            <div className="space-y-3 pt-6 border-t border-slate-100 text-sm text-slate-600">
                                <div className="flex items-center gap-3">
                                    <MapPin size={16} className="text-slate-400" /> {USER_DATA.location}
                                </div>
                                <div className="flex items-center gap-3">
                                    <Globe size={16} className="text-slate-400" /> {USER_DATA.links.website}
                                </div>
                                <div className="flex items-center gap-3">
                                    <Github size={16} className="text-slate-400" /> {USER_DATA.links.github}
                                </div>
                                <div className="flex items-center gap-3">
                                    <Linkedin size={16} className="text-slate-400" /> {USER_DATA.links.linkedin}
                                </div>
                            </div>
                        </div>

                        {/* Community Stats */}
                        <div className="bg-slate-50 border-t border-slate-200 p-6">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Community Stats</h3>
                            <div className="space-y-4 text-sm font-medium text-slate-700">
                                <div className="flex justify-between items-center">
                                    <span className="flex items-center gap-2 text-slate-500"><Code size={16} /> Views</span>
                                    <span>{USER_DATA.stats.views.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="flex items-center gap-2 text-slate-500"><CheckCircle size={16} /> Solutions</span>
                                    <span>{USER_DATA.stats.solutions}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="flex items-center gap-2 text-slate-500"><Medal size={16} /> Reputation</span>
                                    <span>{USER_DATA.stats.reputation}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT CONTENT AREA */}
                <div className="flex-1 space-y-6">

                    {/* Top Row: Problems Solved */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-slate-900 font-bold mb-6 flex items-center gap-2">
                            <Code className="text-indigo-500" size={20} /> Solved Problems
                        </h2>

                        <div className="flex flex-col md:flex-row items-center gap-8">
                            {/* Circular Progress */}
                            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="72" cy="72" r="64" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                                    <circle
                                        cx="72" cy="72" r="64" fill="none"
                                        stroke="#f59e0b" strokeWidth="8"
                                        strokeDasharray={`${(SOLVED_DATA.total / SOLVED_DATA.totalAttempted) * 402} 402`}
                                        className="transition-all duration-1000"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-black text-slate-900">{SOLVED_DATA.total}</span>
                                    <span className="text-xs font-bold text-slate-400 border-t border-slate-200 pt-1 mt-1">Solved</span>
                                </div>
                            </div>

                            {/* Linear Progress Bars */}
                            <div className="flex-1 w-full space-y-4 text-sm font-bold">
                                {[
                                    SOLVED_DATA.dsa,
                                    SOLVED_DATA.sql,
                                    SOLVED_DATA.projects
                                ].map((tier) => (
                                    <div key={tier.label}>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <span className={`${tier.color}`}>{tier.label}</span>
                                            <span className="text-slate-900 font-medium">
                                                {tier.solved} <span className="text-slate-400 text-xs">/ {tier.total}</span>
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${tier.bg}`}
                                                style={{ width: `${(tier.solved / tier.total) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Middle Row: Badges & Skills */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Badges */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-slate-900 font-bold mb-4 flex items-center justify-between">
                                Badges <span className="text-xs bg-slate-100 px-2 py-1 rounded-full text-slate-500">{BADGES.length}</span>
                            </h2>
                            <div className="flex flex-wrap gap-3">
                                {BADGES.map((badge, i) => (
                                    <div key={i} className="flex-1 min-w-[80px] text-center p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-300 hover:shadow-sm transition-all cursor-crosshair">
                                        <div className="text-3xl mb-1">{badge.icon}</div>
                                        <div className="text-[10px] uppercase font-bold text-slate-500 whitespace-nowrap overflow-hidden text-ellipsis px-1">{badge.title}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Top Skills */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-slate-900 font-bold mb-4">Top Languages & Skills</h2>
                            <div className="flex flex-wrap gap-2">
                                {SKILLS.map((skill, i) => (
                                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-sm font-medium">
                                        <span className="text-slate-900">{skill.name}</span>
                                        <span className="text-xs text-slate-400 items-center flex gap-1"><CheckCircle className="w-3 h-3 text-emerald-500" />{skill.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row: Recent Submissions */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-slate-900 font-bold mb-6 flex items-center gap-2">
                            <Calendar className="text-indigo-500" size={20} /> Recent Submissions
                        </h2>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs font-bold uppercase text-slate-400 border-b border-slate-100">
                                    <tr>
                                        <th className="px-4 py-3">Time</th>
                                        <th className="px-4 py-3">Problem</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Language</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {RECENT_SUBMISSIONS.map((sub, i) => (
                                        <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{sub.time}</td>
                                            <td className="px-4 py-3 font-medium text-slate-900 hover:text-indigo-600 cursor-pointer">{sub.title}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1.5 font-bold ${sub.status === 'Accepted' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    {sub.status === 'Accepted' ? <CheckCircle size={14} /> : <XCircle size={14} />} {sub.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-1 bg-slate-100 rounded-md text-xs font-bold text-slate-600">{sub.lang}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
