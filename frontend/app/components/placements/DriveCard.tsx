import React from 'react';
import Link from 'next/link';

interface DriveCardProps {
    drive: {
        id: string;
        title: string;
        companyName: string;
        companyLogo?: string;
        type: string;
        status: string;
        salaryRange?: string;
        batchEligible?: string;
        location?: string;
        applyLink: string;
    }
}

export default function DriveCard({ drive }: DriveCardProps) {
    const isInternship = drive.type === 'Internship';
    const isHiring = drive.status === 'Active Hiring';

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col hover:shadow-lg transition-all duration-300 group h-full">
            <div className="flex justify-between items-start mb-6 gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                        {drive.companyLogo ? (
                            <img loading="lazy" decoding="async" src={drive.companyLogo} alt={drive.companyName} className="w-full h-full object-cover" />
                        ) : (
                            <span className="material-symbols-outlined text-slate-400 text-3xl">apartment</span>
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 group-hover:text-brand-orange transition-colors line-clamp-1">{drive.title}</h3>
                        <p className="text-sm text-slate-500">{drive.companyName}</p>
                    </div>
                </div>

                {isHiring && (
                    <span className="shrink-0 bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                        Active Hiring
                    </span>
                )}
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${isInternship ? 'bg-slate-50 text-slate-900 border-slate-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                    {drive.type}
                </span>
                {drive.location && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium border bg-slate-50 text-slate-600 border-slate-200 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        {drive.location}
                    </span>
                )}
            </div>

            <div className="space-y-3 mb-8 mt-auto">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                    <span className="material-symbols-outlined text-slate-400 text-[18px]">payments</span>
                    <span className="font-medium">{drive.salaryRange || 'Not Disclosed'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                    <span className="material-symbols-outlined text-slate-400 text-[18px]">school</span>
                    <span className="font-medium">Batch: {drive.batchEligible || 'Any'}</span>
                </div>
            </div>

            <button
                onClick={async () => {
                    try {
                        const { getActiveToken } = await import('@/app/lib/auth-storage');
                        const token = getActiveToken();
                        if (token) {
                            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/applications`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify({ placementId: drive.id })
                            });
                        }
                    } catch (e) {
                        console.error('Failed to notify ATS', e);
                    }
                    window.open(drive.applyLink, '_blank', 'noopener,noreferrer');
                }}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
            >
                Apply Now
                <span className="material-symbols-outlined text-sm">open_in_new</span>
            </button>
        </div>
    );
}
