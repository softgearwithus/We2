'use client';

import { fetchApi } from '../../../../../lib/apiClient';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  FileCode2,
  FileText,
  Github,
  Loader2,
  Save,
  XCircle,
} from 'lucide-react';

type PipelineStage =
  | 'invited'
  | 'in_progress'
  | 'pending_review'
  | 'advanced'
  | 'rejected'
  | 'expired';

type ReviewDecision = 'pending' | 'advance' | 'reject';

const stageOptions: Array<{ value: PipelineStage; label: string }> = [
  { value: 'invited', label: 'Invited' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'pending_review', label: 'Pending review' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'expired', label: 'Expired' },
];

export default function CandidateReviewPage() {
  const params = useParams();
  const router = useRouter();
  const rawDriveId = params.id;
  const rawApplicationId = params.applicationId;
  const driveId = Array.isArray(rawDriveId) ? rawDriveId[0] : String(rawDriveId || '');
  const applicationId = Array.isArray(rawApplicationId)
    ? rawApplicationId[0]
    : String(rawApplicationId || '');
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    pipelineStage: 'pending_review' as PipelineStage,
    reviewDecision: 'pending' as ReviewDecision,
    score: '',
    reviewNotes: '',
    submissionSummary: '',
  });

  useEffect(() => {
    const fetchReview = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const { getActiveToken } = await import('@/app/lib/auth-storage');
        const token = getActiveToken();
        const res = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/applications/${applicationId}/review`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          router.push(`/login/industry?next=${encodeURIComponent(`/industry/drives/${driveId}/candidates/${applicationId}`)}`);
          return;
        }

        if (res.status === 403) {
          setErrorMessage('You do not have access to this candidate review.');
          return;
        }

        if (!res.ok) {
          const err = await res.json().catch(() => null);
          throw new Error(err?.message || 'Unable to load candidate review.');
        }

        const payload = await res.json();
        setCandidate(payload);
        setForm({
          pipelineStage: payload.effectivePipelineStage || payload.pipelineStage || 'pending_review',
          reviewDecision: payload.reviewDecision || 'pending',
          score: typeof payload.score === 'number' ? String(payload.score) : '',
          reviewNotes: payload.reviewNotes || '',
          submissionSummary: payload.submissionSummary || '',
        });
      } catch (error) {
        console.error('Failed to load candidate review', error);
        setErrorMessage('Unable to load candidate review right now.');
      } finally {
        setLoading(false);
      }
    };

    if (applicationId) fetchReview();
  }, [applicationId, driveId, router]);

  const saveReview = async () => {
    setSaving(true);
    try {
      const { getActiveToken } = await import('@/app/lib/auth-storage');
      const token = getActiveToken();
      const res = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/applications/${applicationId}/review`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pipelineStage: form.pipelineStage,
          reviewDecision: form.reviewDecision,
          score: form.score === '' ? undefined : Number(form.score),
          reviewNotes: form.reviewNotes,
          submissionSummary: form.submissionSummary,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || 'Unable to save review.');
      }

      setCandidate(await res.json());
    } catch (error: any) {
      alert(error.message || 'Unable to save review.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (errorMessage || !candidate) {
    return (
      <div className="mx-auto mt-12 max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-bold text-slate-950">Review unavailable</h1>
        <p className="mt-2 text-slate-600">{errorMessage || 'Candidate not found.'}</p>
        <Link
          href={`/industry/drives/${driveId}/ats`}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white"
        >
          <ArrowLeft size={16} /> Back to ATS
        </Link>
      </div>
    );
  }

  const displayName =
    candidate.candidateName ||
    `${candidate.student?.firstName || ''} ${candidate.student?.lastName || ''}`.trim() ||
    candidate.candidateEmail ||
    'Candidate';

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Link
        href={`/industry/drives/${driveId}/ats`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600"
      >
        <ArrowLeft size={16} />
        Back to ATS
      </Link>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_390px]">
        <main className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">Candidate review</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{displayName}</h1>
                <p className="mt-2 text-sm text-slate-500">{candidate.candidateEmail || candidate.student?.email}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <DecisionBadge decision={form.reviewDecision} />
                {candidate.inviteUrl ? (
                  <a
                    href={candidate.inviteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700"
                  >
                    Invite link <ExternalLink size={13} />
                  </a>
                ) : null}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label="Stage">
                <select
                  value={form.pipelineStage}
                  onChange={(event) => setForm((prev) => ({ ...prev, pipelineStage: event.target.value as PipelineStage }))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                >
                  {stageOptions.map((stage) => (
                    <option key={stage.value} value={stage.value}>{stage.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Decision">
                <select
                  value={form.reviewDecision}
                  onChange={(event) => setForm((prev) => ({ ...prev, reviewDecision: event.target.value as ReviewDecision }))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                >
                  <option value="pending">Pending</option>
                  <option value="advance">Advance</option>
                  <option value="reject">Reject</option>
                </select>
              </Field>
              <Field label="Score">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.score}
                  onChange={(event) => setForm((prev) => ({ ...prev, score: event.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  placeholder="0-100"
                />
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <FileText size={20} className="text-blue-600" />
              <h2 className="text-lg font-bold text-slate-950">Submission signal</h2>
            </div>
            <textarea
              value={form.submissionSummary}
              onChange={(event) => setForm((prev) => ({ ...prev, submissionSummary: event.target.value }))}
              className="mt-4 min-h-[150px] w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 custom-scrollbar"
              placeholder="Summarize what the candidate built, how they reasoned, and where the signal came from."
            />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">Reviewer notes</h2>
            <textarea
              value={form.reviewNotes}
              onChange={(event) => setForm((prev) => ({ ...prev, reviewNotes: event.target.value }))}
              className="mt-4 min-h-[150px] w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 custom-scrollbar"
              placeholder="Add decision rationale, follow-up questions, or concerns for the hiring team."
            />
            <button
              onClick={saveReview}
              disabled={saving}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Review
            </button>
          </section>
        </main>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">Role context</h2>
            <div className="mt-4 space-y-2">
              <ContextLink icon={<Github size={15} />} label="GitHub repo" href={candidate.placement?.githubRepositoryUrl} />
              <ContextLink icon={<BookOpen size={15} />} label="Docs" href={candidate.placement?.documentationUrl} />
              <ContextLink icon={<FileText size={15} />} label="Tickets" href={candidate.placement?.issueTrackerUrl} />
            </div>
            {candidate.placement?.workContext ? (
              <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">{candidate.placement.workContext}</p>
            ) : null}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <FileCode2 size={18} className="text-blue-600" />
              <h2 className="text-lg font-bold text-slate-950">Assessment</h2>
            </div>
            {candidate.assessment ? (
              <div className="mt-4 space-y-3">
                <div>
                  <h3 className="font-bold text-slate-950">{candidate.assessment.name}</h3>
                  <p className="text-sm text-slate-500">
                    {[candidate.assessment.language, candidate.assessment.timeLimitMinutes ? `${candidate.assessment.timeLimitMinutes} min` : null]
                      .filter(Boolean)
                      .join(' / ') || 'Draft assessment'}
                  </p>
                </div>
                {candidate.assessment.instructions ? (
                  <p className="rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">{candidate.assessment.instructions}</p>
                ) : null}
                {(candidate.assessment.files || []).length ? (
                  <div className="space-y-2">
                    {candidate.assessment.files.map((file: any) => (
                      <div key={file.path} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <div className="font-mono text-xs font-bold text-slate-700">{file.path}</div>
                        <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap text-xs text-slate-600 custom-scrollbar">{file.content}</pre>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">No assessment is attached to this candidate yet.</p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function DecisionBadge({ decision }: { decision: ReviewDecision }) {
  if (decision === 'advance') {
    return (
      <span className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
        <CheckCircle2 size={14} /> Advance
      </span>
    );
  }
  if (decision === 'reject') {
    return (
      <span className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
        <XCircle size={14} /> Reject
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">
      Pending
    </span>
  );
}

function ContextLink({
  href,
  icon,
  label,
}: {
  href?: string | null;
  icon: ReactNode;
  label: string;
}) {
  if (!href) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-400">
        {icon}
        {label} not connected
      </div>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
    >
      <span className="inline-flex min-w-0 items-center gap-2">
        {icon}
        <span className="truncate">{label}</span>
      </span>
      <ExternalLink size={14} />
    </a>
  );
}
