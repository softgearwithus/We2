'use client';

import { fetchApi } from '../lib/apiClient';

import { useEffect, useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import DriveCard from '../components/placements/DriveCard';
import { Briefcase, Search, Building2, Loader2 } from 'lucide-react';

export default function ActiveJobsPage() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [stats, setStats] = useState({ totalActiveJobs: 0, companiesHiring: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            try {
                const query = searchQuery.trim();
                const suffix = query ? `?q=${encodeURIComponent(query)}` : '';

                const [jobsRes, statsRes] = await Promise.all([
                    fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/placements/public/active${suffix}`),
                    fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/placements/public/stats`),
                ]);

                if (jobsRes.ok) {
                    const data = await jobsRes.json();
                    setJobs(data);
                }

                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    setStats(statsData);
                }
            } catch (error) {
                console.error('Failed to load active jobs', error);
            } finally {
                setIsLoading(false);
            }
        };

        const timeout = setTimeout(load, 250);
        return () => clearTimeout(timeout);
    }, [searchQuery]);

    return (
        <div className="min-h-screen bg-transparent text-foreground font-sans antialiased relative overflow-x-hidden">
            <Navbar />
            <main className="max-w-7xl mx-auto pt-28 pb-16 px-4 sm:px-6 space-y-8">
                <section className="bg-white rounded-3xl border border-slate-200 p-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                                <Briefcase size={28} className="text-slate-900" />
                                Active Jobs
                            </h1>
                            <p className="text-slate-600 mt-2">Live placement drives from verified hiring partners.</p>
                            <p className="text-sm text-slate-500 mt-3">From home, Apply now sends students to login first. After login, come here and click Apply on the specific job to open the form.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 min-w-[240px]">
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                                <p className="text-2xl font-black text-slate-900">{stats.totalActiveJobs}</p>
                                <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Active Jobs</p>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                                <p className="text-2xl font-black text-slate-900">{stats.companiesHiring}</p>
                                <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Companies</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-white rounded-2xl border border-slate-200 p-4">
                    <div className="relative max-w-xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by job title, profile, or company"
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300"
                        />
                    </div>
                </section>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="animate-spin text-slate-600" size={28} />
                    </div>
                ) : jobs.length ? (
                    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jobs.map((job) => (
                            <DriveCard key={job.id} drive={job} applyMode="login-then-list" />
                        ))}
                    </section>
                ) : (
                    <section className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                            <Building2 className="text-slate-400" size={28} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">No active jobs found</h2>
                        <p className="text-slate-500 mt-2">Try another search term or check again shortly.</p>
                    </section>
                )}
            </main>
            <Footer />
        </div>
    );
}
