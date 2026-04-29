'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

interface DriveCardProps {
    drive: {
        id: string;
        title: string;
        jobProfile?: string;
        companyName: string;
        companyLogo?: string;
        type: string;
        workMode?: string;
        status: string;
        packageOffered?: string;
        salaryRange?: string;
        batchEligible?: string;
        location?: string;
        openings?: number;
        roles?: string[];
        applyLink?: string;
    };
    applyMode?: 'dashboard-apply' | 'login-then-list';
    onApply?: (driveId: string) => void;
}

export default function DriveCard({ drive, applyMode = 'dashboard-apply', onApply }: DriveCardProps) {
    const router = useRouter();
    const { user } = useAuth();
    const [isApplying, setIsApplying] = useState(false);
    const isInternship = drive.type === 'Internship';
    const isHiring = drive.status === 'Active Hiring';
    const compensation = drive.packageOffered || drive.salaryRange || 'Not Disclosed';

    const handleApply = async () => {
        if (isApplying) return;
        
        if (applyMode === 'dashboard-apply' && onApply) {
            onApply(drive.id);
            return;
        }

        setIsApplying(true);

        const activeJobsPath = '/dashboard/placement-drives';
        const applyPath = `/dashboard/placement-drives?apply=${drive.id}`;
        const studentLoginPath = `/login/student?next=${encodeURIComponent(
            applyMode === 'login-then-list' ? applyPath : applyPath
        )}`;

        try {
            const { getActiveToken } = await import('@/app/lib/auth-storage');
            const token = getActiveToken();
            if (!token || !user) {
                router.push(studentLoginPath);
                return;
            }

            if (user.role !== 'student') {
                alert('Only student accounts can apply to Active Jobs. Please sign in with a student account to continue.');
                router.push(studentLoginPath);
                return;
            }

            if (onApply) {
                onApply(drive.id);
            } else {
                router.push(applyPath);
            }
        } catch (e) {
            console.error('Failed to apply', e);
            alert('Something went wrong while opening the application page. Please try again.');
        } finally {
            setIsApplying(false);
        }
    };

    return (
        <div className="bg-white border-2 border-[#202b20] shadow-[2px_2px_0_0_#202b20] p-6 flex flex-col hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#ffa116] transition-all duration-300 group h-full">
            <div className="flex justify-between items-start mb-6 gap-4">
                <div className="flex items-center gap-4 flex-1">
                    <div className="w-14 h-14 bg-white border-2 border-[#202b20] shadow-[2px_2px_0_0_#202b20] flex items-center justify-center overflow-hidden shrink-0">
                        {drive.companyLogo ? (
                            <img loading="lazy" decoding="async" src={drive.companyLogo} alt={drive.companyName} className="w-full h-full object-cover" />
                        ) : (
                            <span className="material-symbols-outlined text-[#202b20] text-3xl">apartment</span>
                        )}
                    </div>
                    <div className="flex flex-col justify-center gap-0.5">
                        <h3 className="font-[800] text-lg leading-tight text-[#202b20] group-hover:text-[#ffa116] transition-colors line-clamp-1">{drive.title}</h3>
                        <p className="text-sm font-[700] text-[#202b20]/80 uppercase tracking-wide leading-tight">{drive.companyName}</p>
                        {drive.jobProfile && <p className="text-[10px] font-[800] text-[#202b20]/50 mt-1 uppercase tracking-wider leading-tight">{drive.jobProfile}</p>}
                    </div>
                </div>

                {isHiring && (
                    <span className="shrink-0 bg-[#ffa116] text-[#202b20] border-2 border-[#202b20] px-2 py-0.5 text-[9px] uppercase font-[800] tracking-widest mt-1">
                        Active Hiring
                    </span>
                )}
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
                <span className={`px-3 py-1 text-[10px] font-[800] uppercase tracking-widest border-2 border-[#202b20] ${isInternship ? 'bg-[#ffa116] text-[#202b20]' : 'bg-white text-[#202b20]'}`}>
                    {drive.type}
                </span>
                {drive.location && (
                    <span className="px-3 py-1 text-[10px] font-[800] uppercase tracking-widest border-2 border-[#202b20] bg-white text-[#202b20] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        {drive.location}
                    </span>
                )}
                {drive.workMode && (
                    <span className="px-3 py-1 text-[10px] font-[800] uppercase tracking-widest border-2 border-[#202b20] bg-white text-[#202b20]">
                        {drive.workMode}
                    </span>
                )}
            </div>

            <div className="space-y-3 mb-8 mt-auto">
                <div className="flex items-center gap-3 text-sm text-[#202b20]">
                    <span className="material-symbols-outlined text-[#ffa116] drop-shadow-[1px_1px_0_rgba(32,43,32,1)] text-[18px]">payments</span>
                    <span className="font-[700]">{compensation}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[#202b20]">
                    <span className="material-symbols-outlined text-[#ffa116] drop-shadow-[1px_1px_0_rgba(32,43,32,1)] text-[18px]">school</span>
                    <span className="font-[700]">Batch: {drive.batchEligible || 'Any'}</span>
                </div>
                {drive.openings ? (
                    <div className="flex items-center gap-3 text-sm text-[#202b20]">
                        <span className="material-symbols-outlined text-[#ffa116] drop-shadow-[1px_1px_0_rgba(32,43,32,1)] text-[18px]">groups</span>
                        <span className="font-[700]">Openings: {drive.openings}</span>
                    </div>
                ) : null}
            </div>

            {!!drive.roles?.length && (
                <div className="flex flex-wrap gap-2 mb-5">
                    {drive.roles.slice(0, 3).map((roleTag) => (
                        <span
                            key={`${drive.id}-${roleTag}`}
                            className="px-2.5 py-1 text-[10px] font-[800] uppercase tracking-widest bg-[#202b20] text-white border-2 border-[#202b20]"
                        >
                            {roleTag}
                        </span>
                    ))}
                </div>
            )}

            <button
                onClick={handleApply}
                disabled={isApplying}
                className="w-full py-3 bg-[#ffa116] hover:bg-[#ff9100] text-[#202b20] border-2 border-[#202b20] shadow-[2px_2px_0_0_#202b20] active:translate-y-[2px] active:shadow-none font-[800] uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isApplying
                    ? 'OPENING...'
                    : applyMode === 'login-then-list'
                        ? 'LOGIN TO APPLY'
                        : 'APPLY FOR THIS'}
                <span className="material-symbols-outlined text-sm">open_in_new</span>
            </button>
        </div>
    );
}
