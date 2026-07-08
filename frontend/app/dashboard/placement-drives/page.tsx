'use client';

import { fetchApi } from '../../lib/apiClient';

import React, { useEffect, useState, Suspense } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSearchParams, useRouter } from 'next/navigation';
import DriveCard from '../../components/placements/DriveCard';
import ApplyJobModal from '../../components/placements/ApplyJobModal';
import { Building2, CheckCircle2, ExternalLink, Filter, Search, UploadCloud, Video, XCircle } from 'lucide-react';

function ActiveJobsContent() {
    const { token } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [drives, setDrives] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<string>('All');
    const [selectedDriveId, setSelectedDriveId] = useState<string | null>(null);
    const [applications, setApplications] = useState<any[]>([]);
    const [applicationNotice, setApplicationNotice] = useState<string | null>(null);
    const [resumeReplacingId, setResumeReplacingId] = useState<string | null>(null);

    useEffect(() => {
        const applyId = searchParams.get('apply');
        if (applyId) {
            setSelectedDriveId(applyId);
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('apply');
            window.history.replaceState({}, '', newUrl.toString());
        }
    }, [searchParams]);

    useEffect(() => {
        const fetchDrives = async () => {
            setIsLoading(true);
            try {
                const publicParams = new URLSearchParams();
                const privateParams = new URLSearchParams({ status: 'Active Hiring' });

                if (activeFilter === 'Internship') {
                    publicParams.set('type', 'Internship');
                    privateParams.set('type', 'Internship');
                } else if (activeFilter === 'Remote') {
                    publicParams.set('mode', 'Remote');
                    privateParams.set('mode', 'Remote');
                } else if (activeFilter === 'Hybrid') {
                    publicParams.set('mode', 'Hybrid');
                    privateParams.set('mode', 'Hybrid');
                }

                const publicQuery = publicParams.toString();
                const privateQuery = privateParams.toString();

                const endpoint = token
                    ? `${process.env.NEXT_PUBLIC_API_URL}/placements${privateQuery ? `?${privateQuery}` : ''}`
                    : `${process.env.NEXT_PUBLIC_API_URL}/placements/public/active${publicQuery ? `?${publicQuery}` : ''}`;

                const response = await fetchApi(endpoint, token ? {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                } : undefined);
                if (response.ok) {
                    const data = await response.json();
                    setDrives(data);
                }

                if (token) {
                    const applicationsResponse = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/applications/my`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    if (applicationsResponse.ok) {
                        setApplications(await applicationsResponse.json());
                    }
                } else {
                    setApplications([]);
                }
            } catch (error) {
                console.error('Failed to fetch active jobs', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDrives();
    }, [token, activeFilter]);

    // Local Search Filtering
    const filteredDrives = drives.filter(drive =>
        drive.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        drive.companyName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filterOptions = ['All', 'Internship', 'Remote', 'Hybrid', 'Active Hiring'];

    const statusTone = (status?: string) => {
        switch (status) {
            case 'rejected':
                return 'bg-rose-50 text-rose-700 border-rose-200';
            case 'interview_invited':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'shortlisted':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            default:
                return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    const statusLabel = (status?: string) =>
        String(status || 'applied').replace(/_/g, ' ');

    const replaceApplicationResume = async (applicationId: string, file?: File | null) => {
        if (!file || !token) return;
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            setApplicationNotice('Please choose a PDF resume file.');
            return;
        }

        setResumeReplacingId(applicationId);
        setApplicationNotice(null);
        try {
            const formData = new FormData();
            formData.append('resumeFile', file);
            const response = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/applications/${applicationId}/resume`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });
            const payload = await response.json().catch(() => null);
            if (!response.ok) {
                setApplicationNotice(payload?.message || 'Unable to replace resume right now.');
                return;
            }
            setApplications((current) => current.map((application) => (
                application.id === applicationId ? payload : application
            )));
            setApplicationNotice('Resume updated. This application is ready for screening again.');
        } catch (error) {
            console.error('Failed to replace resume', error);
            setApplicationNotice('Unable to replace resume right now.');
        } finally {
            setResumeReplacingId(null);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 font-inter">
            <div className="bg-white p-8 border-2 border-[#202b20] shadow-[2px_2px_0_0_#202b20] relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
                    backgroundImage: `linear-gradient(to right, #202b20 1px, transparent 1px), linear-gradient(to bottom, #202b20 1px, transparent 1px)`,
                    backgroundSize: '20px 20px'
                }} />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-[#ffa116] border-2 border-[#202b20] shadow-[2px_2px_0_0_#202b20] flex items-center justify-center">
                            <Building2 size={24} className="text-[#202b20]" />
                        </div>
                        <h1 className="text-3xl font-[800] uppercase tracking-tight text-[#202b20]">Active Jobs</h1>
                    </div>
                    <p className="text-[#202b20]/80 max-w-2xl text-lg font-[500]">
                        Discover exclusive hiring opportunities, internships, and remote roles from our partner network.
                    </p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:max-w-md group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#202b20]" size={20} />
                    <input
                        type="text"
                        placeholder="SEARCH JOBS..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border-2 border-[#202b20] shadow-[2px_2px_0_0_#202b20] focus:outline-none focus:-translate-y-0.5 focus:shadow-[4px_4px_0_0_#ffa116] transition-all text-[#202b20] placeholder:text-[#202b20]/50 font-[700] uppercase tracking-wide"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
                    <div className="flex items-center gap-2 px-3 text-[#202b20] shrink-0">
                        <Filter size={16} />
                        <span className="text-sm font-[800] uppercase tracking-widest">Filters:</span>
                    </div>
                    {filterOptions.map(option => (
                        <button
                            key={option}
                            onClick={() => setActiveFilter(option)}
                            className={`px-4 py-2 text-xs font-[800] uppercase tracking-wider transition-all border-2 border-[#202b20] hover:-translate-y-0.5 ${activeFilter === option
                                    ? 'bg-[#ffa116] text-[#202b20] shadow-[2px_2px_0_0_#202b20]'
                                    : 'bg-white text-[#202b20] hover:shadow-[2px_2px_0_0_#202b20]'
                                }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </div>

            {token && applications.length > 0 ? (
                <section className="bg-white border-2 border-[#202b20] shadow-[2px_2px_0_0_#202b20] p-5">
                    <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                        <div>
                            <p className="text-xs font-[800] uppercase tracking-[0.22em] text-[#202b20]/60">Application History</p>
                            <h2 className="text-xl font-[800] uppercase tracking-tight text-[#202b20]">Your active hiring status</h2>
                        </div>
                        <span className="text-xs font-[800] uppercase tracking-widest text-[#202b20]/70">{applications.length} application{applications.length === 1 ? '' : 's'}</span>
                    </div>
                    {applicationNotice ? (
                        <div className="mb-4 border-2 border-[#202b20] bg-white px-3 py-2 text-xs font-[800] text-[#202b20] shadow-[1px_1px_0_0_#202b20]">
                            {applicationNotice}
                        </div>
                    ) : null}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {applications.slice(0, 6).map((application) => {
                            const resumeStatus =
                                application.submissionArtifacts?.resumeAsset?.extractionStatus ||
                                application.submissionArtifacts?.resumeExtractionStatus ||
                                null;
                            const canReplaceResume = Boolean(
                                resumeStatus &&
                                resumeStatus !== 'parsed' &&
                                !application.candidateJoinUrl &&
                                application.studentFacingStatus !== 'rejected',
                            );
                            return (
                                <div key={application.id} className="border-2 border-[#202b20] bg-[#f8faf4] p-4 shadow-[1px_1px_0_0_#202b20]">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h3 className="font-[800] text-[#202b20] line-clamp-1">{application.placement?.title || 'Hiring role'}</h3>
                                            <p className="text-sm font-[600] text-[#202b20]/70 line-clamp-1">{application.placement?.companyName || application.candidateEmail}</p>
                                        </div>
                                        <span className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-[800] uppercase ${statusTone(application.studentFacingStatus)}`}>
                                            {statusLabel(application.studentFacingStatus)}
                                        </span>
                                    </div>
                                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-[700] text-[#202b20]/70">
                                        {typeof application.score === 'number' ? (
                                            <span className="inline-flex items-center gap-1 rounded-full border border-[#202b20]/20 bg-white px-2 py-1">
                                                <CheckCircle2 size={13} /> Score {application.score}/100
                                            </span>
                                        ) : null}
                                        {resumeStatus ? (
                                            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 ${resumeStatus === 'parsed' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
                                                Resume {String(resumeStatus).replace(/_/g, ' ')}
                                            </span>
                                        ) : null}
                                        {application.studentFacingStatus === 'rejected' ? (
                                            <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-1 text-rose-700">
                                                <XCircle size={13} /> Not shortlisted
                                            </span>
                                        ) : null}
                                        {application.candidateJoinUrl ? (
                                            <a
                                                href={application.candidateJoinUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-700 hover:bg-emerald-100"
                                            >
                                                <Video size={13} /> Start interview <ExternalLink size={12} />
                                            </a>
                                        ) : null}
                                        {canReplaceResume ? (
                                            <label className={`inline-flex cursor-pointer items-center gap-1 rounded-full border border-[#202b20]/30 bg-white px-2 py-1 hover:bg-[#fff7df] ${resumeReplacingId === application.id ? 'opacity-60' : ''}`}>
                                                <UploadCloud size={13} />
                                                {resumeReplacingId === application.id ? 'Updating resume...' : 'Replace PDF'}
                                                <input
                                                    type="file"
                                                    accept=".pdf,application/pdf"
                                                    className="hidden"
                                                    disabled={resumeReplacingId === application.id}
                                                    onChange={(event) => replaceApplicationResume(application.id, event.target.files?.[0] || null)}
                                                />
                                            </label>
                                        ) : null}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            ) : null}

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-[#202b20] border-t-[#ffa116] animate-spin rounded-full"></div>
                </div>
            ) : filteredDrives.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDrives.map(drive => (
                        <DriveCard 
                            key={drive.id} 
                            drive={drive} 
                            onApply={(driveId) => setSelectedDriveId(driveId)} 
                        />
                    ))}
                </div>
            ) : (
                <div className="bg-white border-2 border-[#202b20] shadow-[2px_2px_0_0_#202b20] p-12 text-center">
                    <div className="w-20 h-20 bg-[#ffa116] border-2 border-[#202b20] flex items-center justify-center mx-auto mb-6 shadow-[2px_2px_0_0_#202b20]">
                        <span className="material-symbols-outlined text-4xl text-[#202b20]">work_off</span>
                    </div>
                    <h3 className="text-2xl font-[800] uppercase tracking-tight text-[#202b20] mb-2">No active jobs found</h3>
                    <p className="text-[#202b20]/70 font-[500] max-w-sm mx-auto">
                        We couldn't find any active jobs matching your current filters. Try an alternate search term.
                    </p>
                </div>
            )}

            <ApplyJobModal 
                isOpen={!!selectedDriveId} 
                onClose={() => setSelectedDriveId(null)} 
                driveId={selectedDriveId || ''} 
            />
        </div>
    );
}

export default function PlacementDrivesPage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div></div>}>
            <ActiveJobsContent />
        </Suspense>
    );
}
