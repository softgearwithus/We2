'use client';

import { fetchApi } from '../../../lib/apiClient';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { ArrowLeft, Briefcase, MapPin, Building2, Send, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';

type DriveFormData = {
    title: string;
    jobProfile: string;
    type: string;
    workMode: string;
    description: string;
    roles: string;
    skillsRequired: string;
    experienceRequired: string;
    openings: number;
    applicationDeadline: string;
    applyLink?: string;
    batchEligible: string;
    packageOffered: string;
    salaryRange: string;
    location: string;
};

export default function CreateDrivePage() {
    const { user } = useAuth();
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    // We auto-fill the companyName from the authenticated user's profile
    const { register, handleSubmit, formState: { errors } } = useForm<DriveFormData>({
        defaultValues: {
            type: 'Full-Time',
            workMode: 'Offline',
        }
    });

    const parseCsv = (value: string) =>
        value
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);

    const onSubmit = async (data: DriveFormData) => {
        setSubmitting(true);
        try {
            // The backend requires companyName. companyId is extracted from JWT by the controller.
            const payload = {
                title: data.title,
                jobProfile: data.jobProfile,
                type: data.type,
                workMode: data.workMode,
                description: data.description,
                roles: parseCsv(data.roles),
                skillsRequired: parseCsv(data.skillsRequired),
                experienceRequired: data.experienceRequired || undefined,
                openings: data.openings ? Number(data.openings) : undefined,
                applicationDeadline: data.applicationDeadline || undefined,
                applyLink: data.applyLink || undefined,
                batchEligible: data.batchEligible || undefined,
                packageOffered: data.packageOffered,
                salaryRange: data.salaryRange || data.packageOffered,
                location: data.location || undefined,
                companyName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || 'Corporate Partner'
            };

            const { getActiveToken } = await import('@/app/lib/auth-storage');
            const token = getActiveToken();
            const res = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/placements`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Server error');
            }

            alert('Campaign launched successfully!');
            router.push('/industry/dashboard');
        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Failed to launch drive. Check your connection.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-6">
            <Link href="/industry/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-8 font-medium">
                <ArrowLeft size={16} />
                Back to Dashboard
            </Link>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-slate-700 p-8 text-white flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl justify-start items-center gap-3 font-bold flex">
                            <Briefcase size={28} />
                            Launch a New Placement Drive
                        </h1>
                        <p className="opacity-80 mt-2 font-medium">
                            Attract verified engineers from our student pool natively over the ATS.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Job Details */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Position Title *</label>
                                <input
                                    {...register('title', { required: 'Title is required' })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all outline-none"
                                    placeholder="e.g. SDE-1 Frontend"
                                />
                                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Job Profile *</label>
                                <input
                                    {...register('jobProfile', { required: 'Job profile is required' })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all outline-none"
                                    placeholder="e.g. Frontend Engineering"
                                />
                                {errors.jobProfile && <p className="text-red-500 text-sm mt-1">{errors.jobProfile.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Employment Type *</label>
                                <select
                                    {...register('type', { required: 'Type is required' })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all outline-none bg-white"
                                >
                                    <option value="Full-Time">Full-Time</option>
                                    <option value="Internship">Internship</option>
                                    <option value="Part-Time">Part-Time</option>
                                    <option value="Contract">Contract</option>
                                    <option value="Remote">Remote</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Work Mode *</label>
                                <select
                                    {...register('workMode', { required: 'Work mode is required' })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all outline-none bg-white"
                                >
                                    <option value="Offline">Offline</option>
                                    <option value="Hybrid">Hybrid</option>
                                    <option value="Remote">Remote</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-2">
                                    <MapPin size={16} className="text-slate-400" />
                                    Location *
                                </label>
                                <input
                                    {...register('location', { required: 'Location is required' })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all outline-none"
                                    placeholder="e.g. Bangalore, India"
                                />
                                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
                            </div>
                        </div>

                        {/* Targeting Criteria */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Package Offered *</label>
                                <input
                                    {...register('packageOffered', { required: 'Package is required' })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all outline-none"
                                    placeholder="e.g. 14 LPA or 40,000/month stipend"
                                />
                                {errors.packageOffered && <p className="text-red-500 text-sm mt-1">{errors.packageOffered.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">External Application Link (Optional)</label>
                                <input
                                    {...register('applyLink')}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all outline-none font-mono text-sm"
                                    placeholder="https://company.careers/..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Salary Range / Stipend (Optional)</label>
                                <input
                                    {...register('salaryRange')}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all outline-none"
                                    placeholder="e.g. 12-18 LPA or ₹40,000/mo"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Batch Eligible</label>
                                <input
                                    {...register('batchEligible')}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all outline-none"
                                    placeholder="e.g. 2024, 2025"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Openings</label>
                                <input
                                    type="number"
                                    min={1}
                                    {...register('openings', { valueAsNumber: true })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all outline-none"
                                    placeholder="e.g. 12"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Application Deadline</label>
                                <input
                                    type="date"
                                    {...register('applicationDeadline')}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Roles (comma separated) *</label>
                            <input
                                {...register('roles', { required: 'At least one role is required' })}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all outline-none"
                                placeholder="e.g. Frontend Development, API Integration"
                            />
                            {errors.roles && <p className="text-red-500 text-sm mt-1">{errors.roles.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Skills Required (comma separated)</label>
                            <input
                                {...register('skillsRequired')}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all outline-none"
                                placeholder="e.g. React, Node.js, PostgreSQL"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Experience Required</label>
                        <input
                            {...register('experienceRequired')}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all outline-none"
                            placeholder="e.g. 0-2 years"
                        />
                    </div>

                    <div className="pt-4">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Job Description *</label>
                        <textarea
                            {...register('description', { required: 'Please provide the Job Description' })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all outline-none font-sans min-h-[160px] custom-scrollbar"
                            placeholder="Describe the role, responsibilities, and requirements strictly..."
                        ></textarea>
                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md disabled:opacity-50"
                        >
                            {submitting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                            {submitting ? 'Broadcasting...' : 'Launch Campaign to Students'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
