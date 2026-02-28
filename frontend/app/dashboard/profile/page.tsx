'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import {
    Trophy, Medal, MapPin,
    Calendar, Code, Briefcase,
    Github, Linkedin, Globe, Edit3, XCircle, CheckCircle
} from 'lucide-react';
import EditProfileModal from '../../components/profile/EditProfileModal';
import { useAuth } from '@/app/context/AuthContext';
import API_BASE_URL from '@/app/lib/api-config';

export default function LeetCodeProfile() {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalSolved: 0,
        totalAttempted: 0,
        dsaSolved: 0,
        dsaTotal: 0,
        sqlSolved: 0,
        sqlTotal: 0,
        projectSolved: 0,
        projectTotal: 0,
    });
    const [badges, setBadges] = useState<Array<{ title: string; icon: string }>>([]);
    const [recentSubmissions, setRecentSubmissions] = useState<Array<{ title: string; type: string; status: string; time: string; lang: string }>>([]);
    const [skills, setSkills] = useState<Array<{ name: string; count: number }>>([]);

    useEffect(() => {
        const loadStats = async () => {
            const { getActiveToken } = await import('@/app/lib/auth-storage');
            const token = getActiveToken() || '';
            try {
                let dsaSolved = 0;
                let dsaTotal = 0;
                let sqlSolved = 0;
                let sqlTotal = 0;
                let projectSolved = 0;
                let projectTotal = 0;
                const [dsaStatsRes, sqlStatsRes, projectProgressRes, badgesRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/dsa/stats/me`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${API_BASE_URL}/sql/submissions/me`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${API_BASE_URL}/project-labs/me/progress`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${API_BASE_URL}/gamification/badges`, { headers: { Authorization: `Bearer ${token}` } }),
                ]);

                if (dsaStatsRes.ok) {
                    const dsaStats = await dsaStatsRes.json();
                    dsaSolved = dsaStats.problemsSolved || 0;
                    dsaTotal = dsaSolved + Math.max(0, (dsaStats.totalSubmissions || 0) - dsaSolved);
                }

                if (sqlStatsRes.ok) {
                    const sqlSubmissions = await sqlStatsRes.json();
                    sqlSolved = sqlSubmissions.filter((s: any) => s.status === 'accepted').length;
                    sqlTotal = sqlSubmissions.length || 0;
                    setRecentSubmissions(sqlSubmissions.slice(0, 5).map((s: any) => ({
                        title: s.problem?.title || 'SQL Submission',
                        type: 'SQL',
                        status: s.status === 'accepted' ? 'Accepted' : 'Attempted',
                        time: new Date(s.submittedAt).toLocaleString(),
                        lang: s.language || 'SQL',
                    })));
                    const languageCounts = sqlSubmissions.reduce((acc: Record<string, number>, submission: any) => {
                        const lang = submission.language || 'SQL';
                        acc[lang] = (acc[lang] || 0) + 1;
                        return acc;
                    }, {});
                    setSkills(Object.entries(languageCounts).map(([name, count]) => ({ name, count: count as number })));
                }

                if (projectProgressRes.ok) {
                    const progress = await projectProgressRes.json();
                    projectSolved = progress.completedProjectIds?.length || 0;
                    projectTotal = progress.submittedProjectIds?.length || 0;
                }

                if (badgesRes.ok) {
                    const data = await badgesRes.json();
                    const earned = data.earned || [];
                    setBadges(earned.map((b: any) => ({ title: b.name, icon: b.icon || '🏆' })));
                }

                setStats({
                    dsaSolved,
                    dsaTotal,
                    sqlSolved,
                    sqlTotal,
                    projectSolved,
                    projectTotal,
                    totalSolved: dsaSolved + sqlSolved + projectSolved,
                    totalAttempted: dsaTotal + sqlTotal + projectTotal,
                });
            } catch (error) {
                console.error('Failed to load profile stats', error);
            }
        };

        loadStats();
    }, []);

    const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();
    const displayName = fullName || user?.email?.split('@')[0] || 'Student';
    const avatarUrl = user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName)}`;
    const userLinks = {
        github: user?.githubUrl ? user.githubUrl.replace(/^https?:\/\//, '') : '—',
        linkedin: user?.linkedinUrl ? user.linkedinUrl.replace(/^https?:\/\//, '') : '—',
        website: user?.websiteUrl ? user.websiteUrl.replace(/^https?:\/\//, '') : '—',
    };
    const rank = 0;
    const roleTitle = user?.roleTitle || 'Student';
    const location = user?.location || '—';
    const username = user?.username || user?.email?.split('@')[0] || 'student';
    const solvedData = {
        total: stats.totalSolved,
        totalAttempted: stats.totalAttempted,
        dsa: {
            label: 'DSA',
            solved: stats.dsaSolved,
            total: stats.dsaTotal,
            color: 'text-emerald-600',
            bg: 'bg-emerald-500',
        },
        sql: {
            label: 'SQL',
            solved: stats.sqlSolved,
            total: stats.sqlTotal,
            color: 'text-indigo-600',
            bg: 'bg-indigo-500',
        },
        projects: {
            label: 'Projects',
            solved: stats.projectSolved,
            total: stats.projectTotal,
            color: 'text-amber-600',
            bg: 'bg-amber-500',
        },
    };
    const totalAttempted = Math.max(1, solvedData.totalAttempted);
    const sortedSkills = [...skills].sort((a, b) => b.count - a.count);

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
                                        <Image src={avatarUrl} alt="Avatar" width={96} height={96} className="object-cover" />
                                    </div>
                                    <button onClick={() => setIsEditModalOpen(true)} className="text-slate-400 hover:text-indigo-600 transition-colors p-2 bg-slate-50 hover:bg-indigo-50 rounded-lg">
                                        <Edit3 size={18} />
                                    </button>
                                </div>
                                <h1 className="text-xl font-bold text-slate-900">{displayName}</h1>
                                <p className="text-slate-500 font-medium text-sm mb-4">@{username}</p>

                                <div className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2">
                                    <Trophy size={16} className="text-amber-500" /> Rank ~{rank.toLocaleString()}
                                </div>

                                <p className="text-xs text-slate-500 flex items-center gap-2 mb-4">
                                    <Briefcase size={14} /> {roleTitle}
                                </p>

                            <button onClick={() => setIsEditModalOpen(true)} className="w-full block text-center py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors mb-6">
                                Edit Profile
                            </button>

                            <div className="space-y-3 pt-6 border-t border-slate-100 text-sm text-slate-600">
                                <div className="flex items-center gap-3">
                                    <MapPin size={16} className="text-slate-400" /> {location}
                                </div>
                                <div className="flex items-center gap-3">
                                    <Globe size={16} className="text-slate-400" /> {userLinks.website}
                                </div>
                                <div className="flex items-center gap-3">
                                    <Github size={16} className="text-slate-400" /> {userLinks.github}
                                </div>
                                <div className="flex items-center gap-3">
                                    <Linkedin size={16} className="text-slate-400" /> {userLinks.linkedin}
                                </div>
                            </div>
                        </div>

                        {/* Community Stats */}
                        <div className="bg-slate-50 border-t border-slate-200 p-6">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Community Stats</h3>
                            <div className="space-y-4 text-sm font-medium text-slate-700">
                                <div className="flex justify-between items-center">
                                    <span className="flex items-center gap-2 text-slate-500"><Code size={16} /> Views</span>
                                    <span>0</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="flex items-center gap-2 text-slate-500"><CheckCircle size={16} /> Solutions</span>
                                    <span>{stats.totalSolved}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="flex items-center gap-2 text-slate-500"><Medal size={16} /> Reputation</span>
                                    <span>0</span>
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
                                        strokeDasharray={`${(solvedData.total / totalAttempted) * 402} 402`}
                                        className="transition-all duration-1000"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-black text-slate-900">{solvedData.total}</span>
                                    <span className="text-xs font-bold text-slate-400 border-t border-slate-200 pt-1 mt-1">Solved</span>
                                </div>
                            </div>

                            {/* Linear Progress Bars */}
                            <div className="flex-1 w-full space-y-4 text-sm font-bold">
                                {[
                                    solvedData.dsa,
                                    solvedData.sql,
                                    solvedData.projects
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
                                                style={{ width: `${tier.total > 0 ? (tier.solved / tier.total) * 100 : 0}%` }}
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
                                Badges <span className="text-xs bg-slate-100 px-2 py-1 rounded-full text-slate-500">{badges.length}</span>
                            </h2>
                            <div className="flex flex-wrap gap-3">
                                {badges.map((badge, i) => (
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
                                {sortedSkills.map((skill, i) => (
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
                                    {recentSubmissions.length === 0 ? (
                                        <tr>
                                            <td className="px-4 py-6 text-slate-500" colSpan={4}>No submissions yet.</td>
                                        </tr>
                                    ) : (
                                        recentSubmissions.map((sub, i) => (
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
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

            </div>

            <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
        </div>
    );
}
