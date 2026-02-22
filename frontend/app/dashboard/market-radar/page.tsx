'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    Activity, Globe, TrendingUp, TrendingDown, Minus, Briefcase,
    Code2, Sparkles, Building2, Lightbulb, Target
} from 'lucide-react';
import { MARKET_DATA } from '@/app/lib/market-data';

export default function MarketRadarPage() {
    const { globalStats, jobTrends, topLanguages, insights, enhancements } = MARKET_DATA;

    return (
        <div className="max-w-[1400px] mx-auto min-h-[calc(100vh-8rem)] flex flex-col pt-6 font-sans pb-12">
            {/* Header */}
            <header className="flex items-center justify-between mb-8 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-600/20">
                        <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Market Radar</h1>
                        <p className="text-sm font-medium text-slate-500">Real-time global job trends and industry insights</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl border border-emerald-100 font-bold text-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Live Data Simulation
                </div>
            </header>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Column (Main Content) */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Global Stats Overview */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                            <Briefcase className="w-6 h-6 text-indigo-500 mb-2" />
                            <span className="text-2xl font-black text-slate-900">{globalStats.totalActiveJobs}</span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Active Jobs</span>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                            <Activity className="w-6 h-6 text-emerald-500 mb-2" />
                            <span className="text-2xl font-black text-slate-900">{globalStats.newJobsToday}</span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">New Today</span>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                            <Globe className="w-6 h-6 text-sky-500 mb-2" />
                            <span className="text-2xl font-black text-slate-900">{globalStats.remoteWorkPercentage}%</span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Remote</span>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                            <Building2 className="w-6 h-6 text-orange-500 mb-2" />
                            <span className="text-2xl font-black text-slate-900">{globalStats.averageHiringTime}</span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Avg Time to Hire</span>
                        </div>
                    </div>

                    {/* Job Trends List */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-indigo-500" /> High-Demand Roles
                            </h2>
                        </div>

                        <div className="space-y-4">
                            {jobTrends.map((job) => (
                                <div key={job.id} className="group relative flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all bg-slate-50/50">
                                    <div className="flex items-center gap-4 mb-4 sm:mb-0">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${job.color} font-bold text-xl`}>
                                            {job.role.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{job.role}</h3>
                                            <p className="text-sm text-slate-500 font-medium">Avg Salary: {job.averageSalary}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-emerald-600 flex items-center gap-1 justify-end">
                                                +{job.demandGrowth}% YoY
                                            </p>
                                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{job.openingsGlobally} Openings</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Market Analysis Insights */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {insights.map((insight) => (
                            <div key={insight.id} className="bg-slate-900 rounded-3xl p-6 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-indigo-500/10 transition-colors" />
                                <div className="flex items-center gap-2 mb-3 relative z-10">
                                    <Lightbulb className="w-4 h-4 text-emerald-400" />
                                    <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">{insight.date}</span>
                                </div>
                                <h3 className="text-white font-black leading-tight mb-3 relative z-10">{insight.title}</h3>
                                <p className="text-slate-400 text-sm font-medium relative z-10 line-clamp-3 leading-relaxed">
                                    {insight.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column (Sidebar Content) */}
                <div className="lg:col-span-4 space-y-8">

                    {/* Top Tech Stack / Languages */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6">
                        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-6">
                            <Code2 className="w-5 h-5 text-indigo-500" /> Trending Languages
                        </h2>

                        <div className="space-y-5">
                            {topLanguages.map((lang) => (
                                <div key={lang.id}>
                                    <div className="flex justify-between text-sm font-bold mb-2">
                                        <span className="text-slate-700">{lang.name}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-900">{lang.share}%</span>
                                            {lang.trending === 'up' && <TrendingUp className="w-4 h-4 text-emerald-500" />}
                                            {lang.trending === 'down' && <TrendingDown className="w-4 h-4 text-rose-500" />}
                                            {lang.trending === 'stable' && <Minus className="w-4 h-4 text-slate-400" />}
                                        </div>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${lang.share}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className={`h-full ${lang.color} rounded-full`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Profile Enhancements (Actionable Items) */}
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl border border-indigo-100 shadow-xl shadow-indigo-100/50 p-6">
                        <h2 className="text-lg font-black text-indigo-900 flex items-center gap-2 mb-6">
                            <Sparkles className="w-5 h-5 text-indigo-500" /> Action Items
                        </h2>
                        <p className="text-sm font-medium text-indigo-800/70 mb-6">
                            Based on current trends, prioritize these enhancements to stand out:
                        </p>

                        <div className="space-y-4">
                            {enhancements.map((enh) => (
                                <div key={enh.id} className="bg-white p-4 rounded-xl shadow-sm border border-white/50 relative overflow-hidden group">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md">
                                            {enh.category}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                                            {enh.difficulty}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-slate-900 mb-1">{enh.title}</h3>
                                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                        {enh.rationale}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
