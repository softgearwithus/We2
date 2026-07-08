'use client';

import React, { useEffect, useState } from 'react';
import { fetchApi } from '@/app/lib/apiClient';
import { useAuth } from '@/app/context/AuthContext';
import { X, CheckCircle2, Loader2, ExternalLink, FileText, UploadCloud } from 'lucide-react';

interface ApplyJobModalProps {
    isOpen: boolean;
    onClose: () => void;
    driveId: string;
}

type PlacementDetail = {
    id: string;
    title: string;
    companyName: string;
    companyLogo?: string;
    status: string;
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

type FormErrors = Partial<Record<keyof FormState | 'resumeFile', string>>;

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
    `w-full rounded-xl border px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 transition-colors ${
        hasError
            ? 'border-rose-300 bg-rose-50/40 focus:border-rose-400 focus:ring-rose-100'
            : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20'
    }`;

const submitMultipartApplication = (token: string | null, payload: Record<string, string>, resumeFile: File) => {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
        if (value) formData.append(key, value);
    });
    formData.append('resumeFile', resumeFile);
    return fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/applications/apply-with-resume`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
    });
};

export default function ApplyJobModal({ isOpen, onClose, driveId }: ApplyJobModalProps) {
    const { user, isLoading: authLoading } = useAuth();
    const [placement, setPlacement] = useState<PlacementDetail | null>(null);
    const [formData, setFormData] = useState<FormState>(EMPTY_FORM);
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [resumeMode, setResumeMode] = useState<'upload' | 'link'>('upload');
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [pageError, setPageError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            // Reset state when closed
            setSuccessMessage(null);
            setPageError(null);
            setFormErrors({});
            setSubmitting(false);
            return;
        }

        if (user) {
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
                    setPageError('Session expired. Please log in again.');
                    setPlacement(null);
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
    }, [isOpen, driveId, user]);

    if (!isOpen) return null;

    const handleChange = (field: keyof FormState, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setFormErrors((prev) => {
            if (!prev[field]) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };

    const handleResumeFile = (file: File | null) => {
        if (!file) return;
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            setFormErrors((prev) => ({ ...prev, resumeFile: 'Please upload a PDF resume.' }));
            return;
        }
        setResumeFile(file);
        setFormErrors((prev) => {
            const next = { ...prev };
            delete next.resumeFile;
            delete next.resumeDriveUrl;
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

        if (resumeMode === 'upload') {
            if (!resumeFile) {
                nextErrors.resumeFile = 'Resume PDF upload is required.';
            }
        } else if (!trimmedResume) {
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

            const applicationPayload = {
                placementId: driveId,
                candidateName: formData.candidateName.trim(),
                candidateEmail: formData.candidateEmail.trim(),
                candidatePhone: formData.candidatePhone.trim(),
                candidateDepartment: formData.candidateDepartment.trim(),
                candidateYear: formData.candidateYear.trim(),
                candidateLocation: formData.candidateLocation.trim(),
                candidateLinkedinUrl: formData.candidateLinkedinUrl.trim(),
                resumeDriveUrl: formData.resumeDriveUrl.trim(),
            };
            const res = resumeMode === 'upload' && resumeFile
                ? await submitMultipartApplication(token, applicationPayload, resumeFile)
                : await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/applications`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify({
                        placementId: applicationPayload.placementId,
                        candidateName: applicationPayload.candidateName,
                        candidateEmail: applicationPayload.candidateEmail,
                        candidatePhone: applicationPayload.candidatePhone,
                        candidateDepartment: applicationPayload.candidateDepartment || undefined,
                        candidateYear: applicationPayload.candidateYear || undefined,
                        candidateLocation: applicationPayload.candidateLocation || undefined,
                        candidateLinkedinUrl: applicationPayload.candidateLinkedinUrl || undefined,
                        resumeDriveUrl: applicationPayload.resumeDriveUrl,
                    }),
                });

            if (res.status === 401) {
                setPageError('Session expired. Please log in again.');
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

            setSuccessMessage('Application submitted successfully. Your profile is now in screening, and your dashboard will update with the next status.');
        } catch (error) {
            console.error('Failed to submit application', error);
            setPageError('Something went wrong while submitting your application. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const canApply = placement?.status === 'Active Hiring' && !successMessage;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Apply for Job</h2>
                        {placement && <p className="text-sm text-slate-500">{placement.title} at {placement.companyName}</p>}
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 p-6 custom-scrollbar">
                    {authLoading || loading ? (
                        <div className="min-h-[40vh] flex items-center justify-center">
                            <Loader2 className="animate-spin text-slate-500" size={28} />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-4">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                                    <div className="space-y-1 text-sm text-emerald-900">
                                        <p className="font-semibold">Before you submit</p>
                                        <p>Upload your latest PDF resume so Emble can run ATS screening for this role. Google Drive links still work as a fallback.</p>
                                    </div>
                                </div>
                            </div>

                            {pageError ? (
                                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                                    {pageError}
                                </div>
                            ) : null}

                            {successMessage ? (
                                <div className="space-y-5">
                                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-6 text-center">
                                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle2 className="text-emerald-600" size={32} />
                                        </div>
                                        <h3 className="text-xl font-bold text-emerald-900">Application submitted!</h3>
                                        <p className="text-sm text-emerald-800 mt-2 max-w-md mx-auto">{successMessage}</p>
                                    </div>
                                    <div className="flex justify-center gap-3 pt-4 border-t border-slate-100">
                                        <button onClick={onClose} className="px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors">
                                            Close
                                        </button>
                                        {placement?.applyLink ? (
                                            <a
                                                href={placement.applyLink}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors inline-flex items-center gap-2"
                                            >
                                                Open official link <ExternalLink size={16} />
                                            </a>
                                        ) : null}
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-5">
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
                                        <div className="mb-3 flex rounded-xl border border-slate-200 bg-slate-50 p-1 text-sm font-semibold">
                                            <button type="button" onClick={() => setResumeMode('upload')} className={`flex-1 rounded-lg px-3 py-2 ${resumeMode === 'upload' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'}`}>Upload PDF</button>
                                            <button type="button" onClick={() => setResumeMode('link')} className={`flex-1 rounded-lg px-3 py-2 ${resumeMode === 'link' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'}`}>Use Drive link</button>
                                        </div>
                                        {resumeMode === 'upload' ? (
                                            <div>
                                                <label className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-7 text-center transition ${formErrors.resumeFile ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-slate-50 hover:border-emerald-300'}`}>
                                                    <input type="file" accept=".pdf,application/pdf" className="hidden" onChange={(event) => handleResumeFile(event.target.files?.[0] || null)} />
                                                    {resumeFile ? (
                                                        <span className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left">
                                                            <span className="flex min-w-0 items-center gap-3">
                                                                <FileText size={18} className="shrink-0 text-emerald-600" />
                                                                <span className="min-w-0">
                                                                    <span className="block truncate text-sm font-bold text-slate-900">{resumeFile.name}</span>
                                                                    <span className="text-xs text-slate-500">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</span>
                                                                </span>
                                                            </span>
                                                            <button type="button" onClick={(event) => { event.preventDefault(); setResumeFile(null); }} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                                                                <X size={16} />
                                                            </button>
                                                        </span>
                                                    ) : (
                                                        <>
                                                            <UploadCloud size={26} className="text-emerald-600" />
                                                            <p className="mt-3 text-sm font-bold text-slate-900">Click to upload resume PDF</p>
                                                            <p className="mt-1 text-xs text-slate-500">Emble will parse it for ATS screening.</p>
                                                        </>
                                                    )}
                                                </label>
                                                {formErrors.resumeFile ? <p className="text-xs text-rose-600 mt-2">{formErrors.resumeFile}</p> : null}
                                            </div>
                                        ) : (
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
                                                </div>
                                                {formErrors.resumeDriveUrl ? <p className="text-xs text-rose-600 mt-2">{formErrors.resumeDriveUrl}</p> : null}
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 flex gap-3">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="px-5 py-3.5 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors flex-1 border border-slate-200"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={!canApply || submitting}
                                            className="flex-[2] inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white px-5 py-3.5 font-semibold hover:bg-slate-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            {submitting ? <Loader2 className="animate-spin" size={18} /> : null}
                                            {submitting ? 'Submitting...' : canApply ? 'Submit application' : 'Unavailable'}
                                        </button>
                                    </div>

                                    {!canApply ? (
                                        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-center">
                                            This job is not currently accepting new applications.
                                        </p>
                                    ) : null}
                                </form>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
