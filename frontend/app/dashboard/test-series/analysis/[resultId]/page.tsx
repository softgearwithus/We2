'use client';

import { fetchApi } from '../../../../lib/apiClient';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getStoredToken } from '@/app/lib/auth-storage';
import { CheckCircle2, XCircle, AlertCircle, BookOpen, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { API_BASE } from '@/app/lib/test-series-builder';
import { sanitizeRichHtml } from '@/lib/sanitize-rich-text';

export default function MockTestAnalysisPage() {
    const params = useParams();
    const resultId = String(params.resultId || '');

    const [resultData, setResultData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    const formatAnswer = (question: any, value?: string | null) => {
        if (!value || value.trim() === '') return null;
        const type = question?.questionType;
        const options = Array.isArray(question?.optionsJson) ? question.optionsJson : [];

        const mapIndex = (idx: string) => {
            const index = Number(idx);
            if (!Number.isFinite(index)) return idx;
            const option = options[index];
            return option ? option : `Option ${index + 1}`;
        };

        if (type === 'SINGLE_CORRECT') {
            return mapIndex(value.trim());
        }

        if (type === 'MULTI_CORRECT') {
            return value
                .split(',')
                .map((entry: string) => entry.trim())
                .filter((entry: string) => entry.length > 0)
                .map(mapIndex)
                .join(', ');
        }

        return value;
    };

    useEffect(() => {
        loadResult();
    }, [resultId]);

    const loadResult = async () => {
        setIsLoading(true);
        try {
            let token = getStoredToken('user') || getStoredToken('admin');
            if (!token) throw new Error("No token");

            const res = await fetchApi(`${API_BASE}/test-series/student/results/${resultId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) {
                if (res.status === 404) throw new Error("Result not found. It may be processing.");
                throw new Error("Failed to load result");
            }

            const data = await res.json();
            setResultData(data);
        } catch (err: any) {
            setErrorMsg(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
                <h2 className="text-xl font-bold text-slate-800">Analyzing Your Test...</h2>
                <p className="text-slate-500 mt-2 text-center max-w-md">We are currently evaluating your responses. If your test included Coding or subjective answers, our AI is grading them now.</p>
            </div>
        );
    }

    if (errorMsg || !resultData) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle className="text-rose-500 mb-4" size={48} />
                <h2 className="text-xl font-bold text-slate-800">Result Error</h2>
                <p className="text-slate-500 mt-2">{errorMsg || "Unable to load analysis."}</p>
                <Link href="/dashboard/test-series/mock-analysis" className="mt-6 text-blue-600 font-bold hover:underline">Back to Mock Analysis</Link>
            </div>
        );
    }

    // AI Check
    if (!resultData.isEvaluated) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
                <h2 className="text-xl font-bold text-slate-800">AI Evaluation in Progress...</h2>
                <p className="text-slate-500 mt-2 text-center max-w-md">Our Gemini AI is actively grading your CODE and TEXT submissions. This usually takes 10-30 seconds.</p>
                <button onClick={loadResult} className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">Refresh Status</button>
            </div>
        );
    }

    const percentage = resultData.totalMarks > 0 ? ((resultData.marksObtained / resultData.totalMarks) * 100).toFixed(1) : 0;

    return (
        <div className="min-h-screen bg-slate-100 p-6 md:p-12 font-sans selection:bg-blue-100">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Header Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-900 to-slate-900 p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 opacity-10 blur-3xl w-64 h-64 bg-white rounded-full translate-x-1/2 -translate-y-1/2" />
                        <h1 className="text-3xl font-black mb-2">{resultData.mockTest?.title || 'Mock Test Analysis'}</h1>
                        <p className="text-blue-200 font-medium">Session Report & Solution Review</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 p-6 bg-white">
                        <div className="p-4 text-center">
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Score</p>
                            <p className="text-3xl font-black text-slate-800">{resultData.marksObtained} / {resultData.totalMarks}</p>
                        </div>
                        <div className="p-4 text-center">
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Accuracy</p>
                            <p className="text-3xl font-black text-blue-600">{percentage}%</p>
                        </div>
                        <div className="p-4 text-center">
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Questions</p>
                            <p className="text-3xl font-black text-slate-800">{resultData.totalQuestions || resultData.responses?.length || 0}</p>
                        </div>
                        <div className="p-4 text-center">
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Status</p>
                            <p className="text-xl font-bold text-emerald-600 mt-2 flex items-center justify-center gap-1"><CheckCircle2 size={20} /> Evaluated</p>
                        </div>
                    </div>
                </div>

                {/* Responses List */}
                <h3 className="text-xl font-bold text-slate-800 mt-8 mb-4">Detailed Question Review</h3>
                <div className="space-y-6">

                    {resultData.responses?.map((resp: any, i: number) => (
                        <div key={resp.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 lg:p-8 relative">
                            <div className="flex gap-4 items-start border-b border-slate-100 pb-4 mb-4">
                                <span className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${resp.isCorrect ? 'bg-emerald-100 text-emerald-700' : (resp.isCorrect === false ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500')}`}>
                                    {i + 1}
                                </span>
                                <div className="flex-1 overflow-hidden">
                                    <div className="font-semibold text-slate-800 text-lg break-words" dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(resp.question.questionText || '') }} />
                                    {resp.question.imageUrl && (
                                        <div className="mt-4 mb-4 relative inline-block">
                                            <img loading="lazy" decoding="async" src={resp.question.imageUrl} alt="Question Graphic" className="max-w-full md:max-w-xl h-auto max-h-80 rounded-xl border border-slate-200 shadow-sm object-contain bg-slate-50 block" />
                                        </div>
                                    )}
                                    <p className="text-sm text-slate-500 font-medium mt-1 uppercase tracking-wider">{resp.question.questionType}</p>
                                </div>
                                <div className="shrink-0 text-right">
                                    <div className={`font-black text-lg ${resp.isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {resp.isCorrect ? `+${resp.marksAwarded}` : '0'} <span className="text-slate-400 text-sm font-medium">/ {resp.question.marks}</span>
                                    </div>
                                    <div className="mt-1 flex justify-end">
                                        {resp.isCorrect ? <CheckCircle2 className="text-emerald-500" size={24} /> : <XCircle className="text-rose-500" size={24} />}
                                    </div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-xl border border-slate-200 text-sm">
                                <div>
                                    <h4 className="font-bold text-slate-700 mb-2 uppercase tracking-wide text-xs">Your Answer</h4>
                                    <div className="bg-white p-3 rounded-lg border border-slate-200 text-slate-800 font-mono whitespace-pre-wrap break-words">
                                        {formatAnswer(resp.question, resp.responseValue) || <span className="text-slate-400 italic">Not Answered</span>}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-700 mb-2 uppercase tracking-wide text-xs">Correct Answer / Reference</h4>
                                    <div className="bg-white p-3 rounded-lg border border-slate-200 text-emerald-700 font-mono font-medium whitespace-pre-wrap break-words">
                                        {formatAnswer(resp.question, resp.question.correctAnswer) || <span className="text-slate-400 italic">No reference provided by admin</span>}
                                    </div>
                                </div>
                            </div>

                            {resp.aiFeedback && (
                                <div className="mt-4 bg-blue-50/50 p-5 rounded-xl border border-blue-100 text-sm">
                                    <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                                        <BookOpen size={16} className="text-blue-600" />
                                        Gemini Evaluation
                                    </h4>
                                    <div className="text-blue-800 leading-relaxed font-medium break-words">
                                        {resp.aiFeedback}
                                    </div>
                                </div>
                            )}

                            {resp.question.solutionText && (
                                <div className="mt-4 bg-emerald-50/60 p-5 rounded-xl border border-emerald-100 text-sm">
                                    <h4 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
                                        <BookOpen size={16} className="text-emerald-600" />
                                        Admin Feedback
                                    </h4>
                                    <div className="text-emerald-800 leading-relaxed font-medium break-words">
                                        {resp.question.solutionText}
                                    </div>
                                </div>
                            )}

                        </div>
                    ))}
                    {(!resultData.responses || resultData.responses.length === 0) && (
                        <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
                            No answers recorded for this test.
                        </div>
                    )}
                </div>

                <div className="text-center pt-8">
                    <Link href="/dashboard/test-series/mock-analysis" className="inline-block px-8 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-sm hover:bg-black transition">
                        Back to Mock Analysis
                    </Link>
                </div>
            </div>
        </div>
    );
}

export function generateStaticParams() { return []; }
