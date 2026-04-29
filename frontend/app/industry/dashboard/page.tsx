'use client';

import { fetchApi } from '../../lib/apiClient';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Building2, Briefcase, Users, PlusCircle, TrendingUp, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function IndustryDashboard() {
    const router = useRouter();
    const { user } = useAuth();
    const [stats, setStats] = useState({
        activeDrives: 0,
        totalApplicants: 0,
    });
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            setErrorMessage(null);
            try {
                // Fetch the company's drives
                const { getActiveToken } = await import('@/app/lib/auth-storage');
                const token = getActiveToken();
                if (!token) {
                    router.push('/login/industry?next=%2Findustry%2Fdashboard');
                    return;
                }
                const drivesRes = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/placements/my-drives`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (drivesRes.status === 401) {
                    router.push('/login/industry?next=%2Findustry%2Fdashboard');
                    return;
                }

                if (drivesRes.status === 403) {
                    setErrorMessage('You do not have permission to access the company dashboard.');
                    return;
                }

                if (!drivesRes.ok) {
                    const err = await drivesRes.json().catch(() => null);
                    throw new Error(err?.message || 'Unable to load dashboard data.');
                }

                const drives = await drivesRes.json();
                const activeDrivesCount = drives.filter((d: any) => d.status === 'Active Hiring').length;

                // For MVP, we simply tally applicants (requires the new ATS endpoint)
                // Let's do a mock up of stats until we build out the full application fetching logic
                setStats({
                    activeDrives: activeDrivesCount,
                    totalApplicants: activeDrivesCount * 12 // Placeholder calculation
                });

            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
                setErrorMessage('Unable to load dashboard data right now. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchDashboardData();
        }
    }, [user, router, reloadKey]);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (errorMessage) {
        return (
            <div className="max-w-3xl mx-auto mt-10">
                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Dashboard unavailable</h2>
                    <p className="text-slate-600 mb-6">{errorMessage}</p>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setReloadKey((k) => k + 1)}
                            className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition"
                        >
                            Retry
                        </button>
                        <Link
                            href="/industry/drives"
                            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition"
                        >
                            Go to Drives
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Welcome back, {user?.firstName}
                    </h1>
                    <p className="text-slate-500 mt-2">
                        Here's what's happening with your hiring pipeline today.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/industry/drives/new"
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm"
                    >
                        <PlusCircle size={20} />
                        Launch Campaign
                    </Link>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-blue-100 transition-all">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                            <Briefcase size={24} />
                        </div>
                        <span className="flex items-center gap-1 text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                            <TrendingUp size={14} /> +2 this week
                        </span>
                    </div>
                    <div className="mt-6">
                        <h3 className="text-3xl font-bold text-slate-900">{stats.activeDrives}</h3>
                        <p className="text-slate-500 font-medium text-sm mt-1">Active Drives</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-slate-200 transition-all">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-slate-50 text-slate-800 rounded-xl group-hover:scale-110 transition-transform">
                            <Users size={24} />
                        </div>
                        <span className="flex items-center gap-1 text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                            <TrendingUp size={14} /> +14
                        </span>
                    </div>
                    <div className="mt-6">
                        <h3 className="text-3xl font-bold text-slate-900">{stats.totalApplicants}</h3>
                        <p className="text-slate-500 font-medium text-sm mt-1">Total Applicants</p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-slate-700 p-6 rounded-2xl shadow-md text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Building2 size={120} />
                    </div>
                    <div className="relative z-10">
                        <div className="p-2 bg-white/20 w-fit rounded-xl backdrop-blur-sm">
                            <Building2 size={24} />
                        </div>
                    </div>
                    <div className="relative z-10 mt-6">
                        <h3 className="text-xl font-bold">Employer Branding</h3>
                        <p className="text-white/80 font-medium text-sm mt-2 line-clamp-2">Complete your company profile to attract 3x more students.</p>
                        <Link href="/industry/profile" className="inline-flex items-center gap-2 mt-4 text-sm font-bold bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
                            Edit Profile <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Quick Actions / Getting Started */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                    <Calendar className="text-blue-600" size={24} />
                    Getting Started with Hiring Hub
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-white p-2 rounded-lg shadow-sm">
                                <PlusCircle className="text-slate-600" size={20} />
                            </div>
                        </div>
                        <h3 className="font-bold text-slate-900 text-lg mb-2">1. Launch a Drive</h3>
                        <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                            Create an Internship or Full-Time campaign. You can add specific targeting criteria to reach the right engineers.
                        </p>
                        <Link href="/industry/drives/new" className="text-blue-600 font-semibold text-sm hover:text-blue-700 flex items-center gap-1">
                            Create Drive <ArrowRight size={14} />
                        </Link>
                    </div>

                    <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-white p-2 rounded-lg shadow-sm">
                                <Users className="text-slate-600" size={20} />
                            </div>
                        </div>
                        <h3 className="font-bold text-slate-900 text-lg mb-2">2. Review Candidates</h3>
                        <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                            Once students apply, they appear in your private Kanban board. Review their verified tech scores.
                        </p>
                        <Link href="/industry/drives" className="text-blue-600 font-semibold text-sm hover:text-blue-700 flex items-center gap-1">
                            View ATS Board <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
