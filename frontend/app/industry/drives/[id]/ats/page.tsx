'use client';

import { fetchApi } from '../../../../lib/apiClient';

import type { FormEvent, ReactNode, SVGProps } from 'react';
import { useMemo, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

type PipelineStage = 'invited' | 'in_progress' | 'pending_review' | 'advanced' | 'rejected' | 'expired';

const STAGES: Array<{ key: PipelineStage; label: string; tone: string }> = [
    { key: 'invited', label: 'Invited', tone: 'bg-blue-50 text-blue-700 border-blue-100' },
    { key: 'in_progress', label: 'In progress', tone: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
    { key: 'pending_review', label: 'Pending review', tone: 'bg-amber-50 text-amber-700 border-amber-100' },
    { key: 'advanced', label: 'Advanced', tone: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    { key: 'rejected', label: 'Rejected', tone: 'bg-red-50 text-red-700 border-red-100' },
    { key: 'expired', label: 'Expired', tone: 'bg-slate-100 text-slate-600 border-slate-200' },
];

const legacyStatusToStage: Record<string, PipelineStage> = {
    Applied: 'pending_review',
    Reviewing: 'pending_review',
    Interviewing: 'in_progress',
    Offered: 'advanced',
    Rejected: 'rejected',
};

type LocalIconProps = SVGProps<SVGSVGElement> & { size?: number };

function IconSvg({ size = 16, children, ...props }: LocalIconProps & { children: ReactNode }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            {...props}
        >
            {children}
        </svg>
    );
}

function ArrowLeft(props: LocalIconProps) {
    return (
        <IconSvg {...props}>
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
        </IconSvg>
    );
}

function ExternalLink(props: LocalIconProps) {
    return (
        <IconSvg {...props}>
            <path d="M15 3h6v6" />
            <path d="M10 14 21 3" />
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        </IconSvg>
    );
}

function FileCheck2(props: LocalIconProps) {
    return (
        <IconSvg {...props}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
            <path d="m9 15 2 2 4-4" />
        </IconSvg>
    );
}

function Gauge(props: LocalIconProps) {
    return (
        <IconSvg {...props}>
            <path d="M12 14 16 8" />
            <path d="M3.34 19a10 10 0 1 1 17.32 0" />
        </IconSvg>
    );
}

function Loader2(props: LocalIconProps) {
    return (
        <IconSvg {...props}>
            <path d="M21 12a9 9 0 1 1-6.22-8.56" />
        </IconSvg>
    );
}

function Mail(props: LocalIconProps) {
    return (
        <IconSvg {...props}>
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-10 6L2 7" />
        </IconSvg>
    );
}

function RefreshCcw(props: LocalIconProps) {
    return (
        <IconSvg {...props}>
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
            <path d="M3 21v-5h5" />
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
            <path d="M16 8h5V3" />
        </IconSvg>
    );
}

function Save(props: LocalIconProps) {
    return (
        <IconSvg {...props}>
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <path d="M17 21v-8H7v8" />
            <path d="M7 3v5h8" />
        </IconSvg>
    );
}

function Search(props: LocalIconProps) {
    return (
        <IconSvg {...props}>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
        </IconSvg>
    );
}

function UserPlus(props: LocalIconProps) {
    return (
        <IconSvg {...props}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M19 8v6" />
            <path d="M22 11h-6" />
        </IconSvg>
    );
}

function CleanATSBoardPage() {
    const params = useParams();
    const router = useRouter();
    const rawDriveId = params.id || '';
    const driveId = Array.isArray(rawDriveId) ? rawDriveId[0] : String(rawDriveId || '');
    const [drive, setDrive] = useState<any>(null);
    const [applicants, setApplicants] = useState<any[]>([]);
    const [assessments, setAssessments] = useState<any[]>([]);
    const [assessmentLibrary, setAssessmentLibrary] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [reloadKey, setReloadKey] = useState(0);
    const [automationBusy, setAutomationBusy] = useState(false);
    const [retryingInterviewId, setRetryingInterviewId] = useState<string | null>(null);
    const [inviteOpen, setInviteOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [submittingInvite, setSubmittingInvite] = useState(false);
    const [savingSettings, setSavingSettings] = useState(false);
    const [inviteForm, setInviteForm] = useState({
        candidateName: '',
        candidateEmail: '',
        candidatePhone: '',
        assessmentId: '',
    });
    const [settingsForm, setSettingsForm] = useState({
        shortlistScoreThreshold: '75',
        interviewDurationMinutes: '45',
        assessmentId: '',
    });

    const primaryAssessment = assessments[0] || null;

    useEffect(() => {
        const fetchATSData = async () => {
            setLoading(true);
            setErrorMessage(null);
            try {
                const { getActiveToken } = await import('@/app/lib/auth-storage');
                const token = getActiveToken();
                const [driveRes, applicantsRes, assessmentsRes, libraryRes] = await Promise.all([
                    fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/placements/${driveId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/applications/drive/${driveId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/placements/${driveId}/assessments`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/assessments`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                if ([driveRes, applicantsRes, assessmentsRes, libraryRes].some((res) => res.status === 401)) {
                    router.push(`/login/industry?next=${encodeURIComponent(`/industry/drives/${driveId}/ats`)}`);
                    return;
                }
                if ([driveRes, applicantsRes, assessmentsRes, libraryRes].some((res) => res.status === 403)) {
                    setErrorMessage('You do not have permission to access this role ATS.');
                    setApplicants([]);
                    return;
                }
                if (driveRes.status === 404 || applicantsRes.status === 404) {
                    setErrorMessage('This role was not found. It may have been removed.');
                    setApplicants([]);
                    return;
                }
                if (!driveRes.ok || !applicantsRes.ok || !assessmentsRes.ok || !libraryRes.ok) {
                    throw new Error('Unable to load ATS data.');
                }

                const drivePayload = await driveRes.json();
                const attachedAssessments = await assessmentsRes.json();
                setDrive(drivePayload);
                setApplicants(await applicantsRes.json());
                setAssessments(Array.isArray(attachedAssessments) ? attachedAssessments : []);
                setAssessmentLibrary(await libraryRes.json());
                setSettingsForm({
                    shortlistScoreThreshold: String(drivePayload.shortlistScoreThreshold ?? 75),
                    interviewDurationMinutes: String(drivePayload.interviewDurationMinutes ?? 45),
                    assessmentId: attachedAssessments?.[0]?.id || '',
                });
                setInviteForm((current) => ({
                    ...current,
                    assessmentId: current.assessmentId || attachedAssessments?.[0]?.id || '',
                }));
            } catch (error) {
                console.error('Failed to fetch ATS data', error);
                setErrorMessage(error instanceof Error ? error.message : 'Unable to load ATS data.');
            } finally {
                setLoading(false);
            }
        };

        if (driveId) void fetchATSData();
    }, [driveId, reloadKey, router]);

    const getApplicantStage = (applicant: any): PipelineStage => {
        return (
            applicant.effectivePipelineStage ||
            applicant.pipelineStage ||
            legacyStatusToStage[applicant.status] ||
            'pending_review'
        ) as PipelineStage;
    };

    const filteredApplicants = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return applicants;
        return applicants.filter((applicant) =>
            [
                applicant.candidateName,
                applicant.candidateEmail,
                applicant.student?.firstName,
                applicant.student?.lastName,
                applicant.student?.email,
                applicant.screeningSummary,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase()
                .includes(term),
        );
    }, [applicants, searchTerm]);

    const counts = useMemo(() => {
        const base = {
            total: applicants.length,
            pending: 0,
            shortlisted: 0,
            rejected: 0,
            interviewReady: 0,
            retryPending: 0,
        };
        for (const applicant of applicants) {
            const stage = getApplicantStage(applicant);
            if (stage === 'pending_review' || applicant.screeningStatus === 'not_screened') base.pending += 1;
            if (stage === 'advanced' || applicant.screeningStatus === 'shortlisted') base.shortlisted += 1;
            if (stage === 'rejected' || applicant.screeningStatus === 'rejected') base.rejected += 1;
            if (applicant.candidateJoinUrl || applicant.interviewLaunchStatus === 'ready') base.interviewReady += 1;
            if (applicant.interviewLaunchStatus === 'failed' || applicant.screeningStatus === 'retry_pending') base.retryPending += 1;
        }
        return base;
    }, [applicants]);

    const runScreening = async () => {
        setAutomationBusy(true);
        setNotice(null);
        try {
            const { getActiveToken } = await import('@/app/lib/auth-storage');
            const token = getActiveToken();
            const res = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/placements/${driveId}/screening/run`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    onlyPending: true,
                    autoInvite: true,
                }),
            });
            const payload = await res.json().catch(() => null);
            if (!res.ok) throw new Error(payload?.message || 'Unable to run screening.');
            if (Array.isArray(payload?.applicants)) setApplicants(payload.applicants);
            const summary = payload?.summary || {};
            setNotice(
                `Screened ${summary.processed ?? payload?.processed ?? 0}. Shortlisted ${summary.shortlisted ?? 0}, rejected ${summary.rejected ?? 0}, retry pending ${summary.retryPending ?? 0}.`,
            );
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Unable to run screening.');
        } finally {
            setAutomationBusy(false);
        }
    };

    const retryInterview = async (applicationId: string) => {
        setRetryingInterviewId(applicationId);
        setNotice(null);
        try {
            const { getActiveToken } = await import('@/app/lib/auth-storage');
            const token = getActiveToken();
            const res = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/applications/${applicationId}/interview/retry`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            const payload = await res.json().catch(() => null);
            if (!res.ok) throw new Error(payload?.message || 'Unable to retry interview.');
            if (payload?.id) {
                setApplicants((current) => current.map((item) => (item.id === payload.id ? payload : item)));
            }
            setNotice('Interview retry finished.');
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Unable to retry interview.');
        } finally {
            setRetryingInterviewId(null);
        }
    };

    const inviteCandidate = async (event: FormEvent) => {
        event.preventDefault();
        setSubmittingInvite(true);
        setNotice(null);
        try {
            const { getActiveToken } = await import('@/app/lib/auth-storage');
            const token = getActiveToken();
            const res = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/applications/drive/${driveId}/invites`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    candidateName: inviteForm.candidateName,
                    candidateEmail: inviteForm.candidateEmail,
                    candidatePhone: inviteForm.candidatePhone || undefined,
                    assessmentId: inviteForm.assessmentId || primaryAssessment?.id || undefined,
                }),
            });
            const invited = await res.json().catch(() => null);
            if (!res.ok) throw new Error(invited?.message || 'Unable to invite candidate.');
            setApplicants((current) => [invited, ...current]);
            setInviteForm({
                candidateName: '',
                candidateEmail: '',
                candidatePhone: '',
                assessmentId: inviteForm.assessmentId,
            });
            setInviteOpen(false);
            setNotice(`Invite created for ${invited.candidateEmail}.`);
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Unable to invite candidate.');
        } finally {
            setSubmittingInvite(false);
        }
    };

    const saveRoleSettings = async (event: FormEvent) => {
        event.preventDefault();
        setSavingSettings(true);
        setNotice(null);
        try {
            const { getActiveToken } = await import('@/app/lib/auth-storage');
            const token = getActiveToken();
            const res = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/placements/${driveId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    shortlistScoreThreshold: Number(settingsForm.shortlistScoreThreshold) || 75,
                    interviewDurationMinutes: Number(settingsForm.interviewDurationMinutes) || 45,
                    autoInviteShortlisted: true,
                    automationEnabled: true,
                    automationMode: 'auto_invite_after_screening',
                }),
            });
            const updatedDrive = await res.json().catch(() => null);
            if (!res.ok) throw new Error(updatedDrive?.message || 'Unable to save role settings.');

            const selectedAssessmentId = settingsForm.assessmentId;
            const alreadyAttached = selectedAssessmentId && assessments.some((assessment) => assessment.id === selectedAssessmentId);
            if (selectedAssessmentId && !alreadyAttached) {
                const attachRes = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/placements/${driveId}/assessments/${selectedAssessmentId}/attach`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ isPrimary: true }),
                });
                const attachPayload = await attachRes.json().catch(() => null);
                if (!attachRes.ok) throw new Error(attachPayload?.message || 'Unable to attach assessment.');
            }

            setDrive(updatedDrive);
            setSettingsOpen(false);
            setReloadKey((key) => key + 1);
            setNotice('Role settings saved.');
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Unable to save role settings.');
        } finally {
            setSavingSettings(false);
        }
    };

    const latestEmailNotification = (applicant: any) => {
        const notifications = applicant.submissionArtifacts?.emailNotifications;
        return Array.isArray(notifications) && notifications.length
            ? notifications[notifications.length - 1]
            : null;
    };

    const statusLabel = (value?: string | null) =>
        value ? String(value).replace(/_/g, ' ') : 'Not started';

    const candidateName = (applicant: any) =>
        applicant.candidateName ||
        `${applicant.student?.firstName || ''} ${applicant.student?.lastName || ''}`.trim() ||
        applicant.student?.email ||
        'Unknown candidate';

    const candidateEmail = (applicant: any) => applicant.candidateEmail || applicant.student?.email || 'No email';

    const parseStatus = (applicant: any) =>
        applicant.screeningDetails?.parseStatus ||
        applicant.submissionArtifacts?.resumeAsset?.extractionStatus ||
        applicant.submissionArtifacts?.resumeExtractionStatus ||
        null;

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="animate-spin text-slate-500" size={30} />
            </div>
        );
    }

    if (errorMessage) {
        return (
            <div className="min-h-screen bg-slate-50 p-6">
                <Link href="/industry/drives" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900">
                    <ArrowLeft size={16} />
                    Roles
                </Link>
                <div className="rounded-xl border border-red-100 bg-white p-6 text-red-700 shadow-sm">{errorMessage}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 text-slate-950 sm:p-6">
            <div className="mx-auto flex max-w-7xl flex-col gap-5">
                <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <Link href="/industry/drives" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900">
                        <ArrowLeft size={16} />
                        Roles
                    </Link>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
                                    {drive?.status || 'Posting'}
                                </span>
                                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
                                    Threshold {drive?.shortlistScoreThreshold ?? 75}
                                </span>
                                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
                                    {drive?.interviewDurationMinutes ?? 45} min interview
                                </span>
                            </div>
                            <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">{drive?.title || 'Role ATS'}</h1>
                            <p className="mt-1 max-w-2xl text-sm text-slate-500">
                                {drive?.companyName || 'Company'} hiring pipeline. Screen pending applicants and let Emble update student statuses automatically.
                            </p>
                            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
                                <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1">
                                    <FileCheck2 size={13} />
                                    {primaryAssessment?.name || 'No assessment attached'}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1">
                                    <Mail size={13} />
                                    Shortlisted emails use Emble mail
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Link href="/dashboard/placement-drives" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
                                View posting
                                <ExternalLink size={15} />
                            </Link>
                            <button type="button" onClick={() => setSettingsOpen(true)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
                                <Save size={15} />
                                Role settings
                            </button>
                            <button type="button" onClick={() => setInviteOpen(true)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
                                <UserPlus size={15} />
                                Invite
                            </button>
                            <button type="button" onClick={runScreening} disabled={automationBusy} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60">
                                {automationBusy ? <Loader2 size={16} className="animate-spin" /> : <Gauge size={16} />}
                                Screen pending candidates
                            </button>
                        </div>
                    </div>
                </header>

                {notice ? (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                        {notice}
                    </div>
                ) : null}

                <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                    <ATSMetric label="Candidates" value={counts.total} />
                    <ATSMetric label="Pending" value={counts.pending} />
                    <ATSMetric label="Shortlisted" value={counts.shortlisted} />
                    <ATSMetric label="Rejected" value={counts.rejected} />
                    <ATSMetric label="Interview ready" value={counts.interviewReady} />
                    <ATSMetric label="Retry needed" value={counts.retryPending} alert={counts.retryPending > 0} />
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-slate-100 p-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-base font-bold text-slate-950">Candidates</h2>
                            <p className="text-sm text-slate-500">Scores, email delivery, interview links, and student-facing status stay in one place.</p>
                        </div>
                        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                            <Search size={16} className="text-slate-400" />
                            <input
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Search candidates"
                                className="w-full bg-transparent text-sm outline-none md:w-64"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[980px] text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                                    <th className="px-4 py-3">Candidate</th>
                                    <th className="px-4 py-3">Score</th>
                                    <th className="px-4 py-3">Stage</th>
                                    <th className="px-4 py-3">Student sees</th>
                                    <th className="px-4 py-3">Email</th>
                                    <th className="px-4 py-3">Interview</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredApplicants.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-500">
                                            No candidates yet for this role.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredApplicants.map((applicant) => {
                                        const latestEmail = latestEmailNotification(applicant);
                                        const stage = getApplicantStage(applicant);
                                        const retryable = (stage === 'advanced' || applicant.interviewLaunchStatus === 'failed' || applicant.screeningStatus === 'retry_pending') && !applicant.candidateJoinUrl;
                                        return (
                                            <tr key={applicant.id} className="border-b border-slate-100 last:border-b-0">
                                                <td className="px-4 py-4 align-top">
                                                    <div className="font-bold text-slate-950">{candidateName(applicant)}</div>
                                                    <div className="mt-1 text-xs text-slate-500">{candidateEmail(applicant)}</div>
                                                    {applicant.resumeDriveUrl ? (
                                                        <a href={applicant.resumeDriveUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700">
                                                            Resume <ExternalLink size={12} />
                                                        </a>
                                                    ) : null}
                                                </td>
                                                <td className="px-4 py-4 align-top">
                                                    {typeof applicant.score === 'number' ? (
                                                        <span className="text-base font-bold text-slate-950">{applicant.score}/100</span>
                                                    ) : (
                                                        <span className="text-slate-400">Not screened</span>
                                                    )}
                                                    {typeof applicant.screeningDetails?.confidence === 'number' ? (
                                                        <p className="mt-1 text-xs font-semibold text-slate-500">
                                                            Confidence {Math.round(applicant.screeningDetails.confidence * 100)}%
                                                        </p>
                                                    ) : null}
                                                    {parseStatus(applicant) ? (
                                                        <p className={`mt-1 text-xs font-semibold ${parseStatus(applicant) === 'parsed' ? 'text-emerald-700' : 'text-amber-700'}`}>
                                                            Resume {parseStatus(applicant)}
                                                        </p>
                                                    ) : null}
                                                    {applicant.screeningSummary ? (
                                                        <p className="mt-1 max-w-[220px] text-xs leading-5 text-slate-500 line-clamp-2">{applicant.screeningSummary}</p>
                                                    ) : null}
                                                    {Array.isArray(applicant.screeningMatchedSkills) && applicant.screeningMatchedSkills.length ? (
                                                        <div className="mt-2 flex max-w-[240px] flex-wrap gap-1">
                                                            {applicant.screeningMatchedSkills.slice(0, 4).map((skill: string) => (
                                                                <span key={skill} className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">{skill}</span>
                                                            ))}
                                                        </div>
                                                    ) : null}
                                                    {Array.isArray(applicant.screeningMissingSkills) && applicant.screeningMissingSkills.length ? (
                                                        <p className="mt-2 max-w-[240px] text-[11px] font-semibold text-amber-700">
                                                            Missing: {applicant.screeningMissingSkills.slice(0, 4).join(', ')}
                                                        </p>
                                                    ) : null}
                                                </td>
                                                <td className="px-4 py-4 align-top">
                                                    <StageBadge stage={stage} />
                                                </td>
                                                <td className="px-4 py-4 align-top capitalize text-slate-700">
                                                    {statusLabel(applicant.studentFacingStatus)}
                                                </td>
                                                <td className="px-4 py-4 align-top">
                                                    <EmailBadge status={latestEmail?.status || applicant.interviewEmailStatus} />
                                                    {latestEmail?.error || applicant.interviewEmailError ? (
                                                        <p className="mt-1 max-w-[220px] text-xs text-red-600">{latestEmail?.error || applicant.interviewEmailError}</p>
                                                    ) : null}
                                                </td>
                                                <td className="px-4 py-4 align-top">
                                                    <InterviewBadge status={applicant.interviewLaunchStatus} hasLink={Boolean(applicant.candidateJoinUrl)} />
                                                    {applicant.candidateJoinUrl ? (
                                                        <a href={applicant.candidateJoinUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800">
                                                            Open link <ExternalLink size={12} />
                                                        </a>
                                                    ) : null}
                                                    {applicant.interviewLaunchError ? (
                                                        <p className="mt-1 max-w-[220px] text-xs text-red-600">{applicant.interviewLaunchError}</p>
                                                    ) : null}
                                                </td>
                                                <td className="px-4 py-4 text-right align-top">
                                                    <div className="flex justify-end gap-2">
                                                        {retryable ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => retryInterview(applicant.id)}
                                                                disabled={retryingInterviewId === applicant.id}
                                                                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                                                            >
                                                                {retryingInterviewId === applicant.id ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} />}
                                                                Retry
                                                            </button>
                                                        ) : null}
                                                        <Link href={`/industry/drives/${driveId}/candidates/${applicant.id}`} className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800">
                                                            Review
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>

            {inviteOpen ? (
                <ATSModal title="Invite candidate" onClose={() => setInviteOpen(false)}>
                    <form onSubmit={inviteCandidate} className="space-y-4">
                        <input required value={inviteForm.candidateName} onChange={(event) => setInviteForm((current) => ({ ...current, candidateName: event.target.value }))} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500" placeholder="Candidate name" />
                        <input required type="email" value={inviteForm.candidateEmail} onChange={(event) => setInviteForm((current) => ({ ...current, candidateEmail: event.target.value }))} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500" placeholder="candidate@example.com" />
                        <input value={inviteForm.candidatePhone} onChange={(event) => setInviteForm((current) => ({ ...current, candidatePhone: event.target.value }))} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500" placeholder="Phone optional" />
                        <select value={inviteForm.assessmentId} onChange={(event) => setInviteForm((current) => ({ ...current, assessmentId: event.target.value }))} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500">
                            <option value="">Use role default assessment</option>
                            {assessments.map((assessment) => (
                                <option key={assessment.id} value={assessment.id}>{assessment.name}</option>
                            ))}
                        </select>
                        <button type="submit" disabled={submittingInvite} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60">
                            {submittingInvite ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                            Create invite
                        </button>
                    </form>
                </ATSModal>
            ) : null}

            {settingsOpen ? (
                <ATSModal title="Role settings" onClose={() => setSettingsOpen(false)}>
                    <form onSubmit={saveRoleSettings} className="space-y-4">
                        <label className="block">
                            <span className="mb-1 block text-xs font-bold text-slate-600">Shortlist threshold</span>
                            <input type="number" min={0} max={100} value={settingsForm.shortlistScoreThreshold} onChange={(event) => setSettingsForm((current) => ({ ...current, shortlistScoreThreshold: event.target.value }))} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500" />
                        </label>
                        <label className="block">
                            <span className="mb-1 block text-xs font-bold text-slate-600">Interview duration</span>
                            <input type="number" min={5} value={settingsForm.interviewDurationMinutes} onChange={(event) => setSettingsForm((current) => ({ ...current, interviewDurationMinutes: event.target.value }))} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500" />
                        </label>
                        <label className="block">
                            <span className="mb-1 block text-xs font-bold text-slate-600">Assessment</span>
                            <select value={settingsForm.assessmentId} onChange={(event) => setSettingsForm((current) => ({ ...current, assessmentId: event.target.value }))} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500">
                                <option value="">No assessment selected</option>
                                {assessmentLibrary.map((assessment) => (
                                    <option key={assessment.id} value={assessment.id}>{assessment.name}</option>
                                ))}
                            </select>
                        </label>
                        <p className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
                            Screening uses these settings automatically and emails shortlisted or rejected candidates through Emble.
                        </p>
                        <button type="submit" disabled={savingSettings} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60">
                            {savingSettings ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Save role settings
                        </button>
                    </form>
                </ATSModal>
            ) : null}
        </div>
    );
}

function ATSMetric({ label, value, alert }: { label: string; value: number; alert?: boolean }) {
    return (
        <div className={`rounded-2xl border bg-white p-4 shadow-sm ${alert ? 'border-amber-200' : 'border-slate-200'}`}>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
        </div>
    );
}

function StageBadge({ stage }: { stage: PipelineStage }) {
    const meta = STAGES.find((item) => item.key === stage) || STAGES[2];
    return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold capitalize ${meta.tone}`}>{meta.label}</span>;
}

function EmailBadge({ status }: { status?: string | null }) {
    const normalized = status || 'pending';
    const tone = normalized === 'sent'
        ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
        : normalized === 'failed'
            ? 'border-red-100 bg-red-50 text-red-700'
            : 'border-slate-200 bg-slate-50 text-slate-500';
    return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold capitalize ${tone}`}>Email {statusLabelForBadge(normalized)}</span>;
}

function InterviewBadge({ status, hasLink }: { status?: string | null; hasLink: boolean }) {
    const normalized = hasLink ? 'ready' : status || 'not_started';
    const tone = normalized === 'ready'
        ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
        : normalized === 'failed'
            ? 'border-red-100 bg-red-50 text-red-700'
            : 'border-slate-200 bg-slate-50 text-slate-500';
    return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold capitalize ${tone}`}>{statusLabelForBadge(normalized)}</span>;
}

function statusLabelForBadge(value: string) {
    return value.replace(/_/g, ' ');
}

function ATSModal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <h2 className="text-base font-bold text-slate-950">{title}</h2>
                    <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50">
                        Close
                    </button>
                </div>
                <div className="p-5">{children}</div>
            </div>
        </div>
    );
}

export default function ATSBoardPage() {
    return <CleanATSBoardPage />;
}
