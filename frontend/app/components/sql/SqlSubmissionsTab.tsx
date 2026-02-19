'use client';

import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { SqlTrainingSubmission } from '@/app/lib/sql-training';

type SqlSubmissionsTabProps = {
    submissions: SqlTrainingSubmission[];
    loading?: boolean;
};

const formatStatus = (status: string) => {
    if (!status) return 'Pending';
    const lower = status.toLowerCase();
    if (lower === 'accepted') return 'Accepted';
    if (lower === 'wrong_answer') return 'Wrong Answer';
    if (lower === 'runtime_error') return 'Runtime Error';
    if (lower === 'time_limit_exceeded') return 'Time Limit Exceeded';
    if (lower === 'compile_error') return 'Compile Error';
    return lower.replace(/_/g, ' ');
};

const formatLanguage = (lang: string) => {
    const map: Record<string, string> = {
        sql: 'SQL',
        mysql: 'MySQL',
        postgresql: 'PostgreSQL',
        sqlite: 'SQLite',
    };
    return map[lang] || lang;
};

export default function SqlSubmissionsTab({ submissions, loading = false }: SqlSubmissionsTabProps) {
    if (loading) {
        return <div className="p-6 text-sm text-slate-500">Loading submissions...</div>;
    }

    if (!submissions.length) {
        return <div className="p-6 text-sm text-slate-500">No submissions yet.</div>;
    }

    return (
        <div className="p-6 space-y-4">
            {submissions.map((sub) => {
                const statusLabel = formatStatus(sub.status);
                const isAccepted = statusLabel === 'Accepted';
                return (
                    <div
                        key={sub.id}
                        className="flex flex-col gap-3 p-4 bg-white border border-slate-100 rounded-lg shadow-sm"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                                {isAccepted ? (
                                    <CheckCircle2 size={18} className="text-emerald-500 mt-0.5" />
                                ) : (
                                    <XCircle size={18} className="text-rose-500 mt-0.5" />
                                )}
                                <div>
                                    <div className={`text-sm font-bold ${isAccepted ? 'text-emerald-700' : 'text-rose-700'}`}>
                                        {statusLabel}
                                    </div>
                                    <div className="text-[11px] text-slate-400 font-medium">
                                        {new Date(sub.submittedAt).toLocaleString()} • {formatLanguage(sub.language)}
                                    </div>
                                    {sub.evaluationSummary && (
                                        <div className="mt-2 text-xs text-slate-600">{sub.evaluationSummary}</div>
                                    )}
                                </div>
                            </div>
                            <div className="text-right text-xs text-slate-500">
                                <div className="font-mono text-slate-700">Score {sub.score ?? '-'}</div>
                                <div className="text-[10px]">Model {sub.evaluationModel || '-'}</div>
                            </div>
                        </div>
                        {(sub.evaluationStrengths?.length || sub.evaluationImprovements?.length) && (
                            <div className="border-t border-slate-100 pt-3 text-xs text-slate-600">
                                {sub.evaluationStrengths?.length ? (
                                    <div className="mb-2">
                                        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Strengths</div>
                                        <ul className="list-disc pl-4 space-y-1">
                                            {sub.evaluationStrengths.map((item, idx) => (
                                                <li key={`strength-${sub.id}-${idx}`}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : null}
                                {sub.evaluationImprovements?.length ? (
                                    <div>
                                        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Improvements</div>
                                        <ul className="list-disc pl-4 space-y-1">
                                            {sub.evaluationImprovements.map((item, idx) => (
                                                <li key={`improve-${sub.id}-${idx}`}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : null}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
