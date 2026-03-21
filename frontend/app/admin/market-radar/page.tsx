'use client';

import React, { useEffect, useState } from 'react';
import { getStoredToken } from '@/app/lib/auth-storage';
import { Save, Plus, Trash2, Activity, Globe, TrendingUp, Code2, Lightbulb, Sparkles } from 'lucide-react';
import { MARKET_DATA, JobTrend, TopLanguage, MarketInsight, ProfileEnhancement, MarketRadarPayload } from '@/app/lib/market-data';
import { fetchAdminMarketRadar, publishMarketRadar } from '@/app/lib/market-radar';

export default function AdminMarketRadar() {
    // Flatten MARKET_DATA into a single state object for the form
    const [formData, setFormData] = useState({
        globalStats: { ...MARKET_DATA.globalStats },
        jobTrends: [...MARKET_DATA.jobTrends],
        topLanguages: [...MARKET_DATA.topLanguages],
        insights: [...MARKET_DATA.insights],
        enhancements: [...MARKET_DATA.enhancements]
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadMarketRadar = async () => {
            try {
                const token = getStoredToken('admin') || '';
                const data = await fetchAdminMarketRadar(token);
                setFormData(data.payload as MarketRadarPayload);
            } catch (err: any) {
                setError('No market radar data found. Publish data to make it live.');
            } finally {
                setIsLoading(false);
            }
        };
        loadMarketRadar();
    }, []);

    const handleGlobalStatsChange = (field: keyof typeof MARKET_DATA.globalStats, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            globalStats: { ...prev.globalStats, [field]: value }
        }));
    };

    // --- Dynamic Array Handlers ---

    const handleArrayChange = (arrayName: 'jobTrends' | 'topLanguages' | 'insights' | 'enhancements', index: number, field: string, value: any) => {
        setFormData(prev => {
            const newArray = [...prev[arrayName]];
            newArray[index] = { ...newArray[index], [field]: value };
            return { ...prev, [arrayName]: newArray };
        });
    };

    const addArrayItem = (arrayName: 'jobTrends' | 'topLanguages' | 'insights' | 'enhancements', emptyItem: any) => {
        setFormData(prev => ({
            ...prev,
            [arrayName]: [...prev[arrayName], emptyItem]
        }));
    };

    const removeArrayItem = (arrayName: 'jobTrends' | 'topLanguages' | 'insights' | 'enhancements', index: number) => {
        setFormData(prev => ({
            ...prev,
            [arrayName]: prev[arrayName].filter((_, i) => i !== index)
        }));
    };

    // --- Form Submission ---

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            setError(null);
            const token = getStoredToken('admin') || '';
            await publishMarketRadar(token, formData);
        } catch (err: any) {
            setError('Failed to publish market radar data.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-8 max-w-full max-w-[1200px] mx-auto min-h-screen font-sans flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800"></div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-full max-w-[1200px] mx-auto min-h-screen font-sans pb-24">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Manage Market Radar</h1>
                    <p className="text-slate-500 font-medium mt-1">Update global job trends, insights, and recommendations</p>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold shadow-md shadow-slate-200 transition-all"
                >
                    <Save className="w-5 h-5" /> {isSaving ? 'Saving...' : 'Save Updates'}
                </button>
            </header>

            {error && (
                <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">

                {/* 1. Global Stats */}
                <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-slate-700" /> Global Market Stats
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Total Active Jobs</label>
                            <input type="text" value={formData.globalStats.totalActiveJobs} onChange={(e) => handleGlobalStatsChange('totalActiveJobs', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-slate-200 focus:outline-none placeholder-slate-400" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">New Jobs Today</label>
                            <input type="text" value={formData.globalStats.newJobsToday} onChange={(e) => handleGlobalStatsChange('newJobsToday', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-slate-200 focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Remote Work %</label>
                            <input type="number" value={formData.globalStats.remoteWorkPercentage} onChange={(e) => handleGlobalStatsChange('remoteWorkPercentage', Number(e.target.value))}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-slate-200 focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Avg Time to Hire</label>
                            <input type="text" value={formData.globalStats.averageHiringTime} onChange={(e) => handleGlobalStatsChange('averageHiringTime', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-slate-200 focus:outline-none" />
                        </div>
                    </div>
                </section>

                {/* 2. Job Trends */}
                <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-slate-500" />
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-slate-700" /> High-Demand Roles
                        </h2>
                        <button type="button" onClick={() => addArrayItem('jobTrends', { id: `role-${Date.now()}`, role: '', demandGrowth: 0, averageSalary: '', openingsGlobally: '', icon: 'briefcase', color: 'text-slate-500 bg-slate-50' })} className="text-sm font-bold text-slate-800 bg-slate-50 hover:bg-slate-100 px-4 py-2 rounded-lg transition-colors flex items-center gap-1">
                            <Plus size={16} /> Add Role
                        </button>
                    </div>
                    <div className="space-y-4">
                        {formData.jobTrends.map((job, index) => (
                            <div key={job.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl relative group">
                                <div className="md:col-span-3">
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Role Title</label>
                                    <input type="text" value={job.role} onChange={(e) => handleArrayChange('jobTrends', index, 'role', e.target.value)} className="w-full border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-slate-200" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Growth %</label>
                                    <input type="number" value={job.demandGrowth} onChange={(e) => handleArrayChange('jobTrends', index, 'demandGrowth', Number(e.target.value))} className="w-full border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-slate-200" />
                                </div>
                                <div className="md:col-span-3">
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Avg Salary</label>
                                    <input type="text" value={job.averageSalary} onChange={(e) => handleArrayChange('jobTrends', index, 'averageSalary', e.target.value)} className="w-full border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-slate-200" placeholder="e.g. $120k - $150k" />
                                </div>
                                <div className="md:col-span-3">
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Globally Open</label>
                                    <input type="text" value={job.openingsGlobally} onChange={(e) => handleArrayChange('jobTrends', index, 'openingsGlobally', e.target.value)} className="w-full border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-slate-200" placeholder="e.g. 150k+" />
                                </div>
                                <div className="md:col-span-1 flex items-end justify-end pb-1">
                                    <button type="button" onClick={() => removeArrayItem('jobTrends', index)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 3. Top Languages */}
                <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Code2 className="w-5 h-5 text-emerald-500" /> Trending Languages
                        </h2>
                        <button type="button" onClick={() => addArrayItem('topLanguages', { id: `lang-${Date.now()}`, name: '', share: 0, trending: 'stable', color: 'bg-slate-500' })} className="text-sm font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-lg transition-colors flex items-center gap-1">
                            <Plus size={16} /> Add Language
                        </button>
                    </div>
                    <div className="space-y-4">
                        {formData.topLanguages.map((lang, index) => (
                            <div key={lang.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Language Name</label>
                                    <input type="text" value={lang.name} onChange={(e) => handleArrayChange('topLanguages', index, 'name', e.target.value)} className="w-full border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-emerald-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Market Share %</label>
                                    <input type="number" value={lang.share} onChange={(e) => handleArrayChange('topLanguages', index, 'share', Number(e.target.value))} className="w-full border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-emerald-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Trend Status</label>
                                    <select value={lang.trending} onChange={(e) => handleArrayChange('topLanguages', index, 'trending', e.target.value)} className="w-full border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-emerald-500 bg-white">
                                        <option value="up">Going Up (Trending)</option>
                                        <option value="stable">Stable</option>
                                        <option value="down">Going Down (Fading)</option>
                                    </select>
                                </div>
                                <div className="flex items-end justify-between pb-1">
                                    <div className="flex-1 mr-2">
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Color Class</label>
                                        <input type="text" value={lang.color} onChange={(e) => handleArrayChange('topLanguages', index, 'color', e.target.value)} className="w-full border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-emerald-500" placeholder="e.g. bg-blue-500" />
                                    </div>
                                    <button type="button" onClick={() => removeArrayItem('topLanguages', index)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 4. Market Insights */}
                <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Lightbulb className="w-5 h-5 text-amber-500" /> Market Insights
                        </h2>
                        <button type="button" onClick={() => addArrayItem('insights', { id: `ins-${Date.now()}`, title: '', description: '', impactLevel: 'Medium', date: '' })} className="text-sm font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 px-4 py-2 rounded-lg transition-colors flex items-center gap-1">
                            <Plus size={16} /> Add Insight
                        </button>
                    </div>
                    <div className="space-y-4">
                        {formData.insights.map((insight, index) => (
                            <div key={insight.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                                <div className="md:col-span-8">
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Insight Headline</label>
                                    <input type="text" value={insight.title} onChange={(e) => handleArrayChange('insights', index, 'title', e.target.value)} className="w-full border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-amber-500" placeholder="e.g. The Rise of Rust" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Impact Level</label>
                                    <select value={insight.impactLevel} onChange={(e) => handleArrayChange('insights', index, 'impactLevel', e.target.value)} className="w-full border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-amber-500 bg-white">
                                        <option value="High">High Impact</option>
                                        <option value="Medium">Medium Impact</option>
                                        <option value="Low">Low Impact</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Month / Year</label>
                                    <input type="text" value={insight.date} onChange={(e) => handleArrayChange('insights', index, 'date', e.target.value)} className="w-full border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-amber-500" placeholder="e.g. Feb 2026" />
                                </div>
                                <div className="md:col-span-11">
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Detailed Analysis</label>
                                    <textarea value={insight.description} onChange={(e) => handleArrayChange('insights', index, 'description', e.target.value)} rows={2} className="w-full border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-amber-500 resize-none" placeholder="Explain the shift..." />
                                </div>
                                <div className="md:col-span-1 flex items-center justify-end">
                                    <button type="button" onClick={() => removeArrayItem('insights', index)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 5. Profile Enhancements */}
                <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-violet-500" />
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-violet-500" /> Profile Action Items
                        </h2>
                        <button type="button" onClick={() => addArrayItem('enhancements', { id: `enh-${Date.now()}`, category: 'Skill', title: '', rationale: '', difficulty: 'Beginner' })} className="text-sm font-bold text-violet-600 bg-violet-50 hover:bg-violet-100 px-4 py-2 rounded-lg transition-colors flex items-center gap-1">
                            <Plus size={16} /> Add Action Item
                        </button>
                    </div>
                    <div className="space-y-4">
                        {formData.enhancements.map((enh, index) => (
                            <div key={enh.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Category</label>
                                    <select value={enh.category} onChange={(e) => handleArrayChange('enhancements', index, 'category', e.target.value)} className="w-full border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-violet-500 bg-white">
                                        <option value="Skill">Skill to Learn</option>
                                        <option value="Project">Project to Build</option>
                                        <option value="Certification">Certification</option>
                                    </select>
                                </div>
                                <div className="md:col-span-7">
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Action Title</label>
                                    <input type="text" value={enh.title} onChange={(e) => handleArrayChange('enhancements', index, 'title', e.target.value)} className="w-full border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-violet-500" placeholder="e.g. Build a RAG App" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Difficulty</label>
                                    <select value={enh.difficulty} onChange={(e) => handleArrayChange('enhancements', index, 'difficulty', e.target.value)} className="w-full border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-violet-500 bg-white">
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                    </select>
                                </div>
                                <div className="md:col-span-11">
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Why do this? (Rationale)</label>
                                    <textarea value={enh.rationale} onChange={(e) => handleArrayChange('enhancements', index, 'rationale', e.target.value)} rows={2} className="w-full border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-violet-500 resize-none" placeholder="Explain why this action item boosts a resume..." />
                                </div>
                                <div className="md:col-span-1 flex items-center justify-end">
                                    <button type="button" onClick={() => removeArrayItem('enhancements', index)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="pt-6">
                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-xl shadow-slate-200 transition-all hover:-translate-y-1"
                    >
                        <Save className="w-6 h-6" /> Publish Market Radar Data to Platform
                    </button>
                    <p className="text-center text-sm font-bold text-slate-400 mt-4">This action pushes JSON payloads to the backend API.</p>
                </div>
            </form>
        </div>
    );
}
