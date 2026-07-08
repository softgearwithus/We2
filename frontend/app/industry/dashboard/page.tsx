'use client';

import { fetchApi } from '../../lib/apiClient';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
    ArrowRight,
    Briefcase,
    BriefcaseBusiness,
    ClipboardList,
    Edit3,
    Plus,
    Settings,
} from 'lucide-react';
import Link from 'next/link';

type PipelineStage = 'invited' | 'in_progress' | 'pending_review' | 'advanced' | 'rejected' | 'expired';

type CompanyDrive = {
    id: string;
    title: string;
    status: string;
    type?: string;
    location?: string;
    assessmentCount?: number;
    candidateCount?: number;
    pipelineSummary?: Partial<Record<PipelineStage, number>>;
    latestCandidateActivity?: {
        id: string;
        candidateName?: string | null;
        candidateEmail?: string | null;
        pipelineStage?: PipelineStage;
        candidateJoinUrl?: string | null;
        inviteUrl?: string | null;
        interviewLaunchStatus?: string | null;
        interviewEmailStatus?: string | null;
        updatedAt?: string;
    } | null;
};

const EMPTY_PIPELINE: Record<PipelineStage, number> = {
    invited: 0,
    in_progress: 0,
    pending_review: 0,
    advanced: 0,
    rejected: 0,
    expired: 0,
};

const stageLabels: Record<PipelineStage, string> = {
    invited: 'Invited',
    in_progress: 'In progress',
    pending_review: 'Pending review',
    advanced: 'Advanced',
    rejected: 'Rejected',
    expired: 'Expired',
};

export default function IndustryDashboard() {
    const router = useRouter();
    const { user } = useAuth();
    const [drives, setDrives] = useState<CompanyDrive[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            setErrorMessage(null);
            try {
                const { getActiveToken } = await import('@/app/lib/auth-storage');
                const token = getActiveToken();
                if (!token) {
                    router.push('/login/industry?next=%2Findustry%2Fdashboard');
                    return;
                }

                const drivesRes = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/placements/my-drives`, {
                    headers: { Authorization: `Bearer ${token}` },
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

                setDrives(await drivesRes.json());
            } catch (error) {
                console.error('Failed to fetch dashboard stats', error);
                setErrorMessage('Unable to load dashboard data right now. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchDashboardData();
    }, [user, router, reloadKey]);

    const stats = useMemo(() => {
        const pipeline = { ...EMPTY_PIPELINE };
        drives.forEach((drive) => {
            (Object.keys(EMPTY_PIPELINE) as PipelineStage[]).forEach((stage) => {
                pipeline[stage] += drive.pipelineSummary?.[stage] || 0;
            });
        });

        return {
            assessments: drives.reduce((total, drive) => total + (drive.assessmentCount || 0), 0),
            candidates: Object.values(pipeline).reduce((total, value) => total + value, 0),
            submissions: pipeline.pending_review + pipeline.advanced + pipeline.rejected,
            pipeline,
        };
    }, [drives]);

    const creditsRemaining = Math.max(0, 30 - stats.assessments * 6);
    const creditPercent = Math.max(0, Math.min(100, (creditsRemaining / 30) * 100));
    const submissionRows = drives
        .map((drive) => drive.latestCandidateActivity ? { drive, activity: drive.latestCandidateActivity } : null)
        .filter((entry): entry is { drive: CompanyDrive; activity: NonNullable<CompanyDrive['latestCandidateActivity']> } => Boolean(entry))
        .filter(({ activity }) => activity.pipelineStage === 'pending_review' || activity.pipelineStage === 'advanced' || activity.pipelineStage === 'rejected')
        .slice(0, 3);

    if (loading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center bg-white">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-950" />
            </div>
        );
    }

    if (errorMessage) {
        return (
            <div className="mx-auto mt-24 max-w-xl rounded-2xl border border-neutral-200 bg-white p-8">
                <h1 className="font-mono text-xl font-bold text-neutral-950">Dashboard unavailable</h1>
                <p className="mt-2 text-sm text-neutral-600">{errorMessage}</p>
                <button
                    onClick={() => setReloadKey((key) => key + 1)}
                    className="mt-6 rounded-lg bg-neutral-950 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="mx-auto w-full max-w-5xl px-6 py-12">
                {/* Header Section */}
                <div className="mb-10 flex flex-col items-center justify-center">
                    <h1 className="font-mono text-[4rem] leading-none font-black tracking-tighter text-black">
                        Emble
                    </h1>
                    <p className="mt-4 text-sm font-medium text-neutral-500">
                        Welcome back, {(user as any)?.companyName || user?.firstName || 'Company Name'}
                    </p>
                </div>

                {/* Action Bar */}
                <div className="mb-6 relative rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Link
                            href="/industry/assessments"
                            className="flex items-center gap-2 rounded-lg border border-neutral-200 px-5 py-2.5 text-sm font-bold text-black transition-colors hover:bg-neutral-50"
                        >
                            <Plus size={16} /> New Assessment
                        </Link>
                        <Link
                            href="/industry/assessments"
                            className="flex items-center gap-2 rounded-lg border border-neutral-200 px-5 py-2.5 text-sm font-bold text-black transition-colors hover:bg-neutral-50"
                        >
                            <ClipboardList size={16} /> Assessments
                        </Link>
                        <Link
                            href="/industry/drives"
                            className="flex items-center gap-2 rounded-lg border border-neutral-200 px-5 py-2.5 text-sm font-bold text-black transition-colors hover:bg-neutral-50"
                        >
                            <BriefcaseBusiness size={16} /> Postings
                        </Link>
                    </div>
                    <button className="absolute right-6 top-1/2 -translate-y-1/2 text-neutral-600 transition-colors hover:text-black hidden md:block">
                        <Edit3 size={18} />
                    </button>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Organization Panel */}
                    <Panel className="flex min-h-[250px] flex-col">
                        <div className="mb-8 flex items-center justify-between">
                            <h2 className="font-mono text-xl font-bold text-black">Organization</h2>
                            <Link href="/industry/settings" className="text-neutral-400 hover:text-black">
                                <Settings size={18} />
                            </Link>
                        </div>

                        <div className="mb-5 flex items-center justify-between text-sm">
                            <span className="text-neutral-500">Plan</span>
                            <span className="font-bold text-black">Sample</span>
                        </div>

                        <div className="mb-3 flex items-center justify-between text-sm">
                            <span className="text-neutral-500">Credits</span>
                            <span className="font-bold text-black">{creditsRemaining} / 30</span>
                        </div>
                        <div className="mb-8 h-2 w-full overflow-hidden rounded-full bg-neutral-100 relative">
                            <div className="h-full rounded-full bg-black absolute left-0 top-0" style={{ width: `${creditPercent}%` }} />
                        </div>

                        <div className="mt-auto grid grid-cols-3 gap-4 border-t border-neutral-100 pt-6">
                            <div className="text-center">
                                <div className="text-lg font-bold text-black">{stats.assessments}</div>
                                <div className="mt-1 text-xs text-neutral-400">Assessments</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-black">{stats.candidates}</div>
                                <div className="mt-1 text-xs text-neutral-400">Candidates</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-black">{stats.submissions}</div>
                                <div className="mt-1 text-xs text-neutral-400">Submissions</div>
                            </div>
                        </div>
                    </Panel>

                    {/* Tasks Panel */}
                    <Panel className="flex min-h-[250px] flex-col">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="font-mono text-xl font-bold text-black">Tasks</h2>
                            <button className="text-black hover:opacity-70">
                                <Plus size={18} />
                            </button>
                        </div>

                        <div className="mb-6 flex items-center gap-6 border-b border-neutral-100">
                            <button className="border-b-2 border-black pb-2 text-sm font-bold text-black">
                                Mine
                            </button>
                            <button className="border-b-2 border-transparent pb-2 text-sm font-medium text-neutral-400 hover:text-neutral-600">
                                Team
                            </button>
                        </div>

                        <div className="flex min-h-[120px] flex-1 items-center justify-center">
                            {/* Empty state or list */}
                        </div>
                    </Panel>

                    {/* Recent Submissions Panel */}
                    <Panel className="flex min-h-[200px] flex-col">
                        <div className="mb-8 flex items-center justify-between">
                            <h2 className="font-mono text-xl font-bold text-black">Recent Submissions</h2>
                            <Link href="/industry/drives" className="flex items-center gap-1 text-sm font-bold text-black hover:underline">
                                View All <ArrowRight size={14} />
                            </Link>
                        </div>

                        <div className="flex flex-1 flex-col justify-center">
                            {submissionRows.length ? (
                                <div className="flex w-full flex-col gap-3">
                                    {submissionRows.map(({ drive, activity }) => (
                                        <Link
                                            key={`${drive.id}-${activity.id}`}
                                            href={`/industry/drives/${drive.id}/candidates/${activity.id}`}
                                            className="group flex items-center justify-between rounded-lg border border-transparent p-2 transition-colors hover:border-neutral-200 hover:bg-neutral-50"
                                        >
                                            <div>
                                                <div className="font-semibold text-neutral-900 group-hover:text-black">
                                                    {activity.candidateName || activity.candidateEmail || 'Candidate'}
                                                </div>
                                                <div className="text-xs text-neutral-500">{drive.title}</div>
                                            </div>
                                            <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600">
                                                {activity.pipelineStage ? stageLabels[activity.pipelineStage] : 'Updated'}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-sm font-medium text-neutral-400">
                                    No submissions yet
                                </div>
                            )}
                        </div>
                    </Panel>

                    {/* Postings Panel */}
                    <Panel className="flex min-h-[200px] flex-col">
                        <div className="mb-8 flex items-center justify-between">
                            <h2 className="font-mono text-xl font-bold text-black">Postings</h2>
                            <Link href="/industry/drives" className="flex items-center gap-1 text-sm font-bold text-black hover:underline">
                                View All <ArrowRight size={14} />
                            </Link>
                        </div>

                        <div className="flex flex-1 flex-col gap-3 justify-center">
                            {drives.length ? (
                                drives.slice(0, 3).map((drive) => (
                                    <Link
                                        key={drive.id}
                                        href={`/industry/drives/${drive.id}/ats`}
                                        className="rounded-xl border border-neutral-200 p-4 transition-colors hover:border-black block"
                                    >
                                        <div className="mb-3 flex items-center gap-2">
                                            <span className="font-bold text-black text-sm">{drive.title}</span>
                                            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                                                Open
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-neutral-400">
                                            <span className="uppercase">{drive.location || drive.type || 'Remote'}</span>
                                            <span>{drive.candidateCount || 0} candidates</span>
                                            <span>{drive.pipelineSummary?.pending_review || 0} submitted</span>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="text-center text-sm font-medium text-neutral-400">
                                    No postings yet
                                </div>
                            )}
                        </div>
                    </Panel>
                </div>
            </div>
        </div>
    );
}

function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm ${className}`}>
            {children}
        </div>
    );
}
