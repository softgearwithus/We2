'use client';

import { fetchApi } from '@/app/lib/apiClient';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BriefcaseBusiness, ClipboardList, Loader2, Send, Sparkles, Trash2 } from 'lucide-react';

type Assessment = {
    id: string;
    name: string;
    prompt?: string | null;
    status?: string;
    attachedRoleCount?: number;
    attachedRoles?: Array<{ roleTitle?: string | null; placementId: string }>;
    updatedAt?: string;
};

export default function AssessmentsLibraryPage() {
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setErrorMessage(null);
            try {
                const { getActiveToken } = await import('@/app/lib/auth-storage');
                const token = getActiveToken();
                const assessmentsRes = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/assessments`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!assessmentsRes.ok) {
                    const payload = await assessmentsRes.json().catch(() => null);
                    throw new Error(payload?.message || 'Unable to load assessments.');
                }
                setAssessments(await assessmentsRes.json());
            } catch (error: any) {
                setErrorMessage(error.message || 'Unable to load assessments.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const startAssessmentHref = prompt.trim()
        ? `/industry/assessments/new?prompt=${encodeURIComponent(prompt.trim())}`
        : '/industry/assessments/new';

    const deleteAssessment = async (assessment: Assessment) => {
        const confirmed = window.confirm(`Delete "${assessment.name}" from the assessment library? This will detach it from roles.`);
        if (!confirmed) return;
        setDeletingId(assessment.id);
        try {
            const { getActiveToken } = await import('@/app/lib/auth-storage');
            const token = getActiveToken();
            const res = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/assessments/${assessment.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                const payload = await res.json().catch(() => null);
                throw new Error(payload?.message || 'Unable to delete assessment.');
            }
            setAssessments((current) => current.filter((item) => item.id !== assessment.id));
        } catch (error: any) {
            alert(error.message || 'Unable to delete assessment.');
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (value?: string) => {
        if (!value) return 'Recently';
        return new Date(value).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="mx-auto max-w-6xl pb-14">
            <header className="flex flex-col gap-4 border-b border-neutral-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">Assessments</p>
                    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-black">Assessment library</h1>
                    <p className="mt-2 max-w-2xl text-sm text-neutral-500">Create a reusable assessment first, then attach it to one or more roles from the role flow or ATS settings.</p>
                </div>
            </header>

            <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_280px] lg:items-end">
                    <div>
                        <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">Ready when you are</p>
                        <h2 className="mt-2 text-xl font-semibold text-black">Build an assessment from this library</h2>
                        <p className="mt-1 text-sm text-neutral-500">Start standalone, attach it to an existing role, or create a new role with the same assessment context.</p>
                        <textarea
                            value={prompt}
                            onChange={(event) => setPrompt(event.target.value)}
                            rows={3}
                            className="mt-4 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-emerald-900"
                            placeholder="Example: Create a TypeScript backend assessment for engineers who will work on repository-aware hiring workflows."
                        />
                    </div>
                    <div className="grid gap-2">
                        <Link href={startAssessmentHref} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-950 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-900">
                            <Send size={16} />
                            Standalone assessment
                        </Link>
                        <Link href={`${startAssessmentHref}${startAssessmentHref.includes('?') ? '&' : '?'}flow=existing`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-800 hover:bg-neutral-50">
                            <ClipboardList size={16} />
                            Use existing role
                        </Link>
                        <Link href={`${startAssessmentHref}${startAssessmentHref.includes('?') ? '&' : '?'}flow=new`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-800 hover:bg-neutral-50">
                            <BriefcaseBusiness size={16} />
                            New role + assessment
                        </Link>
                    </div>
                </div>
            </section>

            {loading ? (
                <div className="flex min-h-[48vh] items-center justify-center">
                    <Loader2 size={26} className="animate-spin text-emerald-900" />
                </div>
            ) : errorMessage ? (
                <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{errorMessage}</div>
            ) : (
                <>
                    {assessments.length > 0 ? (
                        <section className="mt-8 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-sm font-semibold text-black">Reuse context from saved assessments</h2>
                                    <p className="mt-1 text-xs text-neutral-500">Pick an older assessment prompt as a starting sentence for the next one.</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {assessments.slice(0, 4).map((assessment) => (
                                        <button
                                            key={assessment.id}
                                            type="button"
                                            onClick={() => setPrompt(assessment.prompt || assessment.name)}
                                            className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:border-emerald-900 hover:text-emerald-900"
                                        >
                                            {assessment.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </section>
                    ) : null}

                    <section className="mt-8">
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="text-lg font-semibold text-black">Library</h2>
                            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">{assessments.length} saved</span>
                        </div>

                        {assessments.length === 0 ? (
                            <div className="mt-5 rounded-2xl border border-dashed border-neutral-200 bg-white px-6 py-10 text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500">
                                    <Sparkles size={22} />
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-black">No assessments yet</h3>
                                <p className="mt-2 text-sm text-neutral-500">Use the builder above to create your first reusable assessment.</p>
                            </div>
                        ) : (
                            <div className="mt-4 divide-y divide-neutral-200 rounded-2xl border border-neutral-200 bg-white">
                                {assessments.map((assessment) => {
                                    const firstRole = assessment.attachedRoles?.[0];
                                    const roleHref = firstRole?.placementId
                                        ? `/industry/drives/${firstRole.placementId}/ats`
                                        : '/industry/assessments/new';
                                    return (
                                        <div key={assessment.id} className="flex flex-col gap-4 px-4 py-4 transition hover:bg-neutral-50 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="flex min-w-0 items-center gap-3">
                                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
                                                    <ClipboardList size={18} />
                                                </span>
                                                <span className="min-w-0">
                                                    <span className="block truncate text-sm font-semibold text-black">{assessment.name}</span>
                                                    <span className="block truncate text-xs text-neutral-500">
                                                        {assessment.prompt || firstRole?.roleTitle || 'Standalone assessment'}
                                                    </span>
                                                    <span className="mt-1 block text-[11px] font-semibold text-neutral-400">Updated {formatDate(assessment.updatedAt)}</span>
                                                </span>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-2">
                                                <span className="rounded-md bg-neutral-100 px-2 py-1 text-xs font-semibold text-neutral-600">
                                                    {assessment.attachedRoleCount || 0} roles
                                                </span>
                                                <Link href={roleHref} className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-white">
                                                    Open <ArrowRight size={13} />
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => deleteAssessment(assessment)}
                                                    disabled={deletingId === assessment.id}
                                                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                                                >
                                                    {deletingId === assessment.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </>
            )}
        </div>
    );
}
