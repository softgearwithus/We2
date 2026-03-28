'use client';

import { fetchApi } from '../../../../lib/apiClient';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, PlayCircle, Code2, Database, Mail, Phone, MapPin, Search, Filter } from 'lucide-react';
import Link from 'next/link';

// The Kanban Statuses matching ApplicationStatus enum
const COLUMNS = ['Applied', 'Reviewing', 'Interviewing', 'Offered', 'Rejected'];

export default function ATSBoardPage() {
    const params = useParams();
    const router = useRouter();
    const [applicants, setApplicants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [updatingParams, setUpdatingParams] = useState<string | null>(null);

    useEffect(() => {
        const fetchATSData = async () => {
            try {
                const { getActiveToken } = await import('@/app/lib/auth-storage');
                const token = getActiveToken();
                const res = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/applications/drive/${params.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('API Error');
                const data = await res.json();
                setApplicants(data);
            } catch (error) {
                console.error("Failed to fetch ATS data", error);
                router.push('/industry/drives');
            } finally {
                setLoading(false);
            }
        };

        if (params.id) fetchATSData();
    }, [params.id, router]);

    const moveApplicant = async (appId: string, newStatus: string) => {
        setUpdatingParams(appId);
        try {
            const { getActiveToken } = await import('@/app/lib/auth-storage');
            const token = getActiveToken();
            await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/applications/${appId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
        } catch (error) {
            console.error("Failed to move applicant status", error);
        } finally {
            setUpdatingParams(null);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <Loader2 size={32} className="animate-spin text-blue-600" />
            </div>
        );
    }

    const filteredApplicants = applicants.filter(a =>
        (a.student?.firstName + ' ' + a.student?.lastName).toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col pt-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <Link href="/industry/drives" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium mb-3 text-sm">
                        <ArrowLeft size={16} /> Back to Drives
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 border-b-2 border-slate-900 pb-1 w-fit">
                        Applicant Tracking Board
                    </h1>
                </div>

                <div className="flex items-center gap-3 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                    <div className="pl-3 text-slate-400">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search applicants..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="py-2 pr-3 outline-none text-sm w-48 md:w-64 bg-transparent rounded-r-xl"
                    />
                </div>
            </div>

            {/* Kanban Columns */}
            <div className="flex-1 flex gap-6 overflow-x-auto pb-8 custom-scrollbar pt-2">
                {COLUMNS.map(column => (
                    <div key={column} className="flex-shrink-0 w-80 bg-slate-100 rounded-2xl flex flex-col max-h-[calc(100vh-160px)] border border-slate-200 shadow-inner">
                        <div className="p-4 border-b border-slate-200 bg-slate-100/50 rounded-t-2xl flex items-center justify-between sticky top-0 backdrop-blur-sm z-10">
                            <h3 className="font-bold text-slate-800 tracking-wide uppercase text-sm">
                                {column}
                            </h3>
                            <span className="bg-white text-slate-600 text-xs font-bold px-2.5 py-1 rounded-full border border-slate-200 shadow-sm">
                                {filteredApplicants.filter(a => a.status === column).length}
                            </span>
                        </div>

                        <div className="p-4 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                            {filteredApplicants.filter(a => a.status === column).map(applicant => (
                                <div key={applicant.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group flex flex-col gap-4">
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold font-serif text-lg overflow-hidden shrink-0 border border-blue-200 shadow-inner">
                                                {applicant.student?.avatarUrl ? (
                                                    <img loading="lazy" decoding="async" src={applicant.student.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    (applicant.student?.firstName?.[0] || 'U')
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                                                    {applicant.student?.firstName} {applicant.student?.lastName}
                                                </h4>
                                                <div className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-1">
                                                    {applicant.student?.department || 'Student'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action bar for changing status */}
                                    <div className="pt-3 flex items-center justify-between gap-2 border-t border-slate-100 mt-1">
                                        <span className="text-xs font-bold text-slate-400">Move candidate to:</span>
                                        {updatingParams === applicant.id ? (
                                            <Loader2 size={16} className="animate-spin text-blue-500" />
                                        ) : (
                                            <select
                                                value={applicant.status}
                                                onChange={(e) => moveApplicant(applicant.id, e.target.value)}
                                                className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
                                            >
                                                {COLUMNS.map(col => (
                                                    <option key={col} value={col}>{col}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function generateStaticParams() { return []; }
