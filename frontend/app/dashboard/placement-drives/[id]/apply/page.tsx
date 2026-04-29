'use client';

import { fetchApi } from '@/app/lib/apiClient';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Briefcase, Building2, CheckCircle2, ExternalLink, Loader2, MapPin } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';

type PlacementDetail = {
    id: string;
    title: string;
    companyName: string;
    companyLogo?: string;
    jobProfile?: string;
    description?: string;
    type: string;
    workMode?: string;
    status: string;
    packageOffered?: string;
    salaryRange?: string;
    batchEligible?: string;
    location?: string;
    openings?: number;
    applicationDeadline?: string;
    skillsRequired?: string[];
    applyLink?: string;
};

type FormState = {
    candidateName: string;
    candidateEmail: string;
    candidatePhone: string;
    candidateDepartment: string;
    candidateYear: string;
    candidateLocation: string;
    candidateLinkedinUrl: string;
    resumeDriveUrl: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const EMPTY_FORM: FormState = {
    candidateName: '',
    candidateEmail: '',
    candidatePhone: '',
    candidateDepartment: '',
    candidateYear: '',
    candidateLocation: '',
    candidateLinkedinUrl: '',
    resumeDriveUrl: '',
};

const getSafeMessage = (payload: any, fallback: string) => {
    if (Array.isArray(payload?.message)) {
        return payload.message.join(', ');
    }
    return payload?.message || fallback;
};

const fieldClassName = (hasError: boolean) =>
    `w-full rounded-xl border px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 transition-colors ${hasError
        ? 'border-rose-300 bg-rose-50/40 focus:border-rose-400 focus:ring-rose-100'
        : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20'
    }`;

export default function PlacementDriveApplyPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const [placement, setPlacement] = useState<PlacementDetail | null>(null);
    const [formData, setFormData] = useState<FormState>(EMPTY_FORM);
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [pageError, setPageError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const driveId = typeof params.id === 'string' ? params.id : '';

    const applyPath = useMemo(() => {
        return `/dashboard/placement-drives/${driveId}/apply`;
    }, [driveId]);

    useEffect(() => {
        if (!user) return;

        const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
        setFormData((prev) => ({
            ...prev,
            candidateName: prev.candidateName || fullName || '',
            candidateEmail: prev.candidateEmail || user.email || '',
            candidateDepartment: prev.candidateDepartment || user.department || '',
            candidateYear: prev.candidateYear || user.year || '',
            candidateLocation: prev.candidateLocation || user.location || '',
            candidateLinkedinUrl: prev.candidateLinkedinUrl || user.linkedinUrl || '',
        }));
    }, [user]);

    useEffect(() => {
        if (authLoading || !driveId) return;

        if (!user) {
            return;
        }

        if (user.role !== 'student') {
            alert('Only student accounts can apply to Active Jobs. Please sign in with a student account to continue.');
            router.replace(`/login/student?next=${encodeURIComponent(applyPath)}`);
            return;
        }

        const loadPlacement = async () => {
            setLoading(true);
            setPageError(null);

            try {
                const { getActiveToken } = await import('@/app/lib/auth-storage');
                const token = getActiveToken();

                const res = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/placements/${driveId}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                });

                if (res.status === 401) {
                    router.replace(`/login/student?next=${encodeURIComponent(applyPath)}`);
                    return;
                }

                if (res.status === 404) {
                    setPageError('This active job could not be found. It may have been removed.');
                    setPlacement(null);
                    return;
                }

                if (!res.ok) {
                    const payload = await res.json().catch(() => null);
                    setPageError(getSafeMessage(payload, 'Unable to load this active job right now.'));
                    setPlacement(null);
                    return;
                }

                const data = await res.json();
                setPlacement(data);
            } catch (error) {
                console.error('Failed to load active job', error);
                setPageError('Unable to load this active job right now. Please try again.');
                setPlacement(null);
            } finally {
                setLoading(false);
            }
        };

        loadPlacement();
    }, [applyPath, authLoading, driveId, router, user]);

    const handleChange = (field: keyof FormState, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setFormErrors((prev) => {
            if (!prev[field]) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };

    const validateForm = () => {
        const nextErrors: FormErrors = {};
        const trimmedName = formData.candidateName.trim();
        const trimmedEmail = formData.candidateEmail.trim();
        const trimmedPhone = formData.candidatePhone.trim();
        const trimmedLinkedin = formData.candidateLinkedinUrl.trim();
        const trimmedResume = formData.resumeDriveUrl.trim();

        if (!trimmedName) {
            nextErrors.candidateName = 'Full name is required.';
        } else if (trimmedName.length < 2) {
            nextErrors.candidateName = 'Full name must be at least 2 characters.';
        } else if (trimmedName.length > 120) {
            nextErrors.candidateName = 'Full name must be 120 characters or fewer.';
        }

        if (!trimmedEmail) {
            nextErrors.candidateEmail = 'Email is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            nextErrors.candidateEmail = 'Enter a valid email address.';
        }

        if (!trimmedPhone) {
            nextErrors.candidatePhone = 'Phone number is required.';
        } else if (trimmedPhone.length < 8) {
            nextErrors.candidatePhone = 'Phone number must be at least 8 characters.';
        } else if (trimmedPhone.length > 20) {
            nextErrors.candidatePhone = 'Phone number must be 20 characters or fewer.';
        }

        if (trimmedLinkedin) {
            try {
                const linkedinUrl = new URL(trimmedLinkedin);
                if (linkedinUrl.protocol !== 'https:') {
                    nextErrors.candidateLinkedinUrl = 'LinkedIn URL must start with https://.';
                }
            } catch {
                nextErrors.candidateLinkedinUrl = 'Enter a valid LinkedIn URL.';
            }
        }

        if (!trimmedResume) {
            nextErrors.resumeDriveUrl = 'Resume Google Drive link is required.';
        } else {
            try {
                const resumeUrl = new URL(trimmedResume);
                const isGoogleDriveHost = resumeUrl.hostname.toLowerCase() === 'drive.google.com';
                if (resumeUrl.protocol !== 'https:') {
                    nextErrors.resumeDriveUrl = 'Resume link must start with https://.';
                } else if (!isGoogleDriveHost) {
                    nextErrors.resumeDriveUrl = 'Resume link must use the drive.google.com domain.';
                }
            } catch {
                nextErrors.resumeDriveUrl = 'Enter a valid Google Drive resume link.';
            }
        }

        setFormErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setPageError(null);
        setSuccessMessage(null);

        if (!validateForm()) {
            return;
        }

        setSubmitting(true);

        try {
            const { getActiveToken } = await import('@/app/lib/auth-storage');
            const token = getActiveToken();

            const res = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/applications`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    placementId: driveId,
                    candidateName: formData.candidateName.trim(),
                    candidateEmail: formData.candidateEmail.trim(),
                    candidatePhone: formData.candidatePhone.trim(),
                    candidateDepartment: formData.candidateDepartment.trim() || undefined,
                    candidateYear: formData.candidateYear.trim() || undefined,
                    candidateLocation: formData.candidateLocation.trim() || undefined,
                    candidateLinkedinUrl: formData.candidateLinkedinUrl.trim() || undefined,
                    resumeDriveUrl: formData.resumeDriveUrl.trim(),
                }),
            });

            if (res.status === 401) {
                router.replace(`/login/student?next=${encodeURIComponent(applyPath)}`);
                return;
            }

            const payload = await res.json().catch(() => null);

            if (res.status === 409) {
                setPageError('You have already applied to this active job.');
                return;
            }

            if (!res.ok) {
                setPageError(getSafeMessage(payload, 'Unable to submit your application right now.'));
                return;
            }

            setSuccessMessage('Application submitted successfully. Your resume link and candidate details have been shared with the hiring team.');
        } catch (error) {
            console.error('Failed to submit application', error);
            setPageError('Something went wrong while submitting your application. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="animate-spin text-slate-500" size={28} />
            </div>
        );
    }

    if (pageError && !placement && !successMessage) {
        return (
            <div className="max-w-3xl mx-auto space-y-6">
                <Link href="/dashboard/placement-drives" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
                    <ArrowLeft size={16} /> Back to Active Jobs
                </Link>
                <div className="bg-white rounded-3xl border border-rose-200 p-8 shadow-sm">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Unable to open application</h1>
                    <p className="text-slate-600 mb-6">{pageError}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-5 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const canApply = placement?.status === 'Active Hiring' && !successMessage;
    const compensation = placement?.packageOffered || placement?.salaryRange || 'Not Disclosed';

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-8">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <Link href="/dashboard/placement-drives" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
                    <ArrowLeft size={16} /> Back to Active Jobs
                </Link>
                {placement?.applyLink ? (
                    <a
                        href={placement.applyLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                    >
                        Official company link <ExternalLink size={16} />
                    </a>
                ) : null}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-6 items-start">
                <section className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
                            {placement?.companyLogo ? (
                                <img loading="lazy" decoding="async" src={placement.companyLogo} alt={placement.companyName} className="w-full h-full object-cover" />
                            ) : (
                                <Building2 className="text-slate-400" size={26} />
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">Active Job</p>
                            <h1 className="text-3xl font-bold text-slate-900 mt-2 leading-tight">{placement?.title}</h1>
                            <p className="text-slate-500 mt-2 text-base">{placement?.companyName}</p>
                            {placement?.jobProfile ? <p className="text-sm text-slate-500 mt-1">{placement.jobProfile}</p> : null}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Compensation</p>
                            <p className="text-sm font-semibold text-slate-900 mt-1">{compensation}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Work Setup</p>
                            <p className="text-sm font-semibold text-slate-900 mt-1">{placement?.workMode || placement?.type}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Batch Eligibility</p>
                            <p className="text-sm font-semibold text-slate-900 mt-1">{placement?.batchEligible || 'Any'}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Openings</p>
                            <p className="text-sm font-semibold text-slate-900 mt-1">{placement?.openings || 'Not specified'}</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 text-sm text-slate-600">
                        {placement?.location ? (
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
                                <MapPin size={14} /> {placement.location}
                            </span>
                        ) : null}
                        {placement?.type ? (
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
                                <Briefcase size={14} /> {placement.type}
                            </span>
                        ) : null}
                    </div>

                    {placement?.description ? (
                        <div>
                            <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-400 mb-3">Role Overview</h2>
                            <p className="text-sm leading-7 text-slate-600 whitespace-pre-line">{placement.description}</p>
                        </div>
                    ) : null}

                    {!!placement?.skillsRequired?.length && (
                        <div>
                            <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-400 mb-3">Skills Preferred</h2>
                            <div className="flex flex-wrap gap-2">
                                {placement.skillsRequired.map((skill) => (
                                    <span key={skill} className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-sm font-semibold">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </section>

                <section className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                    <div className="mb-6">
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Student Application</p>
                        <h2 className="text-2xl font-bold text-slate-900 mt-2">Submit your details</h2>
                        <p className="text-slate-600 mt-2">
                            Share the candidate details recruiters need upfront. Your resume link must be a public Google Drive link accessible to anyone.
                        </p>
                    </div>

                    <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-4">
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                            <div className="space-y-1 text-sm text-emerald-900">
                                <p className="font-semibold">Before you submit</p>
                                <p>Fill in your basic candidate details and paste a resume link from Google Drive.</p>
                                <p>The resume link must use https://, stay on drive.google.com, and be shared as "Anyone with the link".</p>
                            </div>
                        </div>
                    </div>

                    {pageError ? (
                        <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                            {pageError}
                        </div>
                    ) : null}

                    {successMessage ? (
                        <div className="space-y-5">
                            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
                                <h3 className="text-lg font-bold text-emerald-900">Application submitted</h3>
                                <p className="text-sm text-emerald-800 mt-2">{successMessage}</p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <Link href="/dashboard/placement-drives" className="px-5 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors">
                                    Back to Active Jobs
                                </Link>
                                {placement?.applyLink ? (
                                    <a
                                        href={placement.applyLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-5 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors inline-flex items-center gap-2"
                                    >
                                        Open official company link <ExternalLink size={16} />
                                    </a>
                                ) : null}
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Step 1</p>
                                    <p className="text-sm font-semibold text-slate-900 mt-1">Fill candidate details</p>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Step 2</p>
                                    <p className="text-sm font-semibold text-slate-900 mt-1">Paste public resume link</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Full name</label>
                                <input
                                    type="text"
                                    value={formData.candidateName}
                                    onChange={(e) => handleChange('candidateName', e.target.value)}
                                    className={fieldClassName(Boolean(formErrors.candidateName))}
                                    placeholder="Your full name"
                                    autoComplete="name"
                                />
                                {formErrors.candidateName ? <p className="text-xs text-rose-600 mt-2">{formErrors.candidateName}</p> : null}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email address</label>
                                    <input
                                        type="email"
                                        value={formData.candidateEmail}
                                        onChange={(e) => handleChange('candidateEmail', e.target.value)}
                                        className={fieldClassName(Boolean(formErrors.candidateEmail))}
                                        placeholder="name@example.com"
                                        autoComplete="email"
                                    />
                                    {formErrors.candidateEmail ? <p className="text-xs text-rose-600 mt-2">{formErrors.candidateEmail}</p> : null}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Phone number</label>
                                    <input
                                        type="tel"
                                        value={formData.candidatePhone}
                                        onChange={(e) => handleChange('candidatePhone', e.target.value)}
                                        className={fieldClassName(Boolean(formErrors.candidatePhone))}
                                        placeholder="Include WhatsApp or contact number"
                                        autoComplete="tel"
                                    />
                                    {formErrors.candidatePhone ? <p className="text-xs text-rose-600 mt-2">{formErrors.candidatePhone}</p> : null}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Department</label>
                                    <input
                                        type="text"
                                        value={formData.candidateDepartment}
                                        onChange={(e) => handleChange('candidateDepartment', e.target.value)}
                                        className={fieldClassName(false)}
                                        placeholder="Computer Science"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Year</label>
                                    <input
                                        type="text"
                                        value={formData.candidateYear}
                                        onChange={(e) => handleChange('candidateYear', e.target.value)}
                                        className={fieldClassName(false)}
                                        placeholder="3rd Year"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
                                    <input
                                        type="text"
                                        value={formData.candidateLocation}
                                        onChange={(e) => handleChange('candidateLocation', e.target.value)}
                                        className={fieldClassName(false)}
                                        placeholder="Bengaluru"
                                        autoComplete="address-level2"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">LinkedIn URL</label>
                                <input
                                    type="url"
                                    value={formData.candidateLinkedinUrl}
                                    onChange={(e) => handleChange('candidateLinkedinUrl', e.target.value)}
                                    className={fieldClassName(Boolean(formErrors.candidateLinkedinUrl))}
                                    placeholder="https://linkedin.com/in/your-profile"
                                />
                                {formErrors.candidateLinkedinUrl ? <p className="text-xs text-rose-600 mt-2">{formErrors.candidateLinkedinUrl}</p> : null}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Resume Google Drive link <span className="text-rose-500">*</span></label>
                                <input
                                    type="url"
                                    value={formData.resumeDriveUrl}
                                    onChange={(e) => handleChange('resumeDriveUrl', e.target.value)}
                                    className={fieldClassName(Boolean(formErrors.resumeDriveUrl))}
                                    placeholder="https://drive.google.com/file/d/..."
                                />
                                <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-600 space-y-1">
                                    <p>Accepted example: https://drive.google.com/file/d/.../view</p>
                                    <p>Before submitting, open sharing in Google Drive and set it to "Anyone with the link".</p>
                                </div>
                                {formErrors.resumeDriveUrl ? <p className="text-xs text-rose-600 mt-2">{formErrors.resumeDriveUrl}</p> : null}
                            </div>

                            <button
                                type="submit"
                                disabled={!canApply || submitting}
                                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white px-5 py-3.5 font-semibold hover:bg-slate-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {submitting ? <Loader2 className="animate-spin" size={18} /> : null}
                                {submitting ? 'Submitting application...' : canApply ? 'Submit application' : 'Applications currently unavailable'}
                            </button>

                            {!canApply ? (
                                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
                                    This job is not currently accepting new applications.
                                </p>
                            ) : null}
                        </form>
                    )}
                </section>
            </div>
        </div>
    );
}
