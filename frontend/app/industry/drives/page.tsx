'use client';

import { fetchApi } from '../../lib/apiClient';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, MapPin, Calendar, Users, Eye, ArrowRight, Loader2, PlusCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function ActiveDrivesPage() {
    const router = useRouter();
    const [drives, setDrives] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        const fetchDrives = async () => {
            setLoading(true);
            setErrorMessage(null);
            try {
                const { getActiveToken } = await import('@/app/lib/auth-storage');
                const token = getActiveToken();
                if (!token) {
                    router.push('/login/industry?next=%2Findustry%2Fdrives');
                    return;
                }

                const res = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/placements/my-drives`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.status === 401) {
                    router.push('/login/industry?next=%2Findustry%2Fdrives');
                    return;
                }

                if (res.status === 403) {
                    setErrorMessage('You do not have permission to access company drives.');
                    setDrives([]);
                    return;
                }

                if (!res.ok) {
                    const err = await res.json().catch(() => null);
                    throw new Error(err?.message || 'Unable to load your active drives.');
                }

                const data = await res.json();
                setDrives(data);
            } catch (error) {
                console.error("Failed to fetch active drives", error);
                setErrorMessage('Unable to load active drives right now. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchDrives();
    }, [router, reloadKey]);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 size={32} className="animate-spin text-blue-600" />
            </div>
        );
    }

    if (errorMessage) {
        return (
            <div className="max-w-3xl mx-auto mt-12">
                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Unable to load drives</h2>
                    <p className="text-slate-600 mb-6">{errorMessage}</p>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setReloadKey((k) => k + 1)}
                            className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition"
                        >
                            Retry
                        </button>
                        <Link
                            href="/industry/dashboard"
                            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition"
                        >
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const getVerificationBadge = (status: string) => {
        switch (status) {
            case 'approved': return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-emerald-100 text-emerald-700 border border-emerald-200">Verified Drive</span>;
            case 'rejected': return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-red-100 text-red-700 border border-red-200">Rejected</span>;
            default: return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-amber-100 text-amber-700 border border-amber-200">Pending Review</span>;
        }
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                        <Briefcase size={28} className="text-blue-600" />
                        Active Campaigns
                    </h1>
                    <p className="text-slate-500 mt-2">Manage your ongoing hiring pipelines and review new applicants.</p>
                </div>
                <Link
                    href="/industry/drives/new"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm"
                >
                    <PlusCircle size={20} />
                    New Drive
                </Link>
            </div>

            {drives.length === 0 ? (
                <div className="bg-white border text-center border-slate-200 rounded-2xl p-12 shadow-sm">
                    <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Briefcase size={32} className="text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No Active Campaigns</h3>
                    <p className="text-slate-500 mb-6 max-w-md mx-auto">You haven't launched any placement drives yet. Start recruiting directly from our verified student pool.</p>
                    <Link
                        href="/industry/drives/new"
                        className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md"
                    >
                        Launch First Campaign
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {drives.map((drive) => (
                        <div key={drive.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-slate-100 flex-1">
                                <div className="flex flex-wrap justify-between items-start mb-4 gap-2">
                                    <div className="flex gap-2">
                                        <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${drive.status === 'Active Hiring' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                                            }`}>
                                            {drive.status}
                                        </span>
                                        {getVerificationBadge(drive.verificationStatus || 'pending')}
                                    </div>
                                    <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                                        <Calendar size={12} />
                                        {new Date(drive.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2" title={drive.title}>
                                    {drive.title}
                                </h3>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <Briefcase size={16} className="text-slate-400" />
                                        {drive.type}
                                    </div>
                                    {drive.location && (
                                        <div className="flex items-center gap-2 text-sm text-slate-500 mt-2">
                                            <MapPin size={16} className="text-slate-400" />
                                            {drive.location}
                                        </div>
                                    )}

                                    {drive.verificationStatus === 'rejected' && drive.rejectionReason && (
                                        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
                                            <span className="font-bold flex items-center gap-1 mb-1"><AlertCircle size={14} /> Reason for Rejection:</span>
                                            <p className="leading-relaxed">{drive.rejectionReason}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 border-t border-slate-100 flex gap-3 pb-2 pt-2">
                                {/* ATS Link */}
                                <Link
                                    href={`/industry/drives/${drive.id}/ats`}
                                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 py-2.5 rounded-lg text-sm font-bold transition-colors m-2"
                                >
                                    <Users size={16} /> Open ATS
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
