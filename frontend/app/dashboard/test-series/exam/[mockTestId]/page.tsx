'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Clock, Menu, CheckCircle2, Circle, AlertCircle,
    ChevronRight, ChevronLeft, Bookmark, Check, LogOut
} from 'lucide-react';
import { fetchMockTestFull } from '@/app/lib/test-series-builder';
import { getStoredToken } from '@/app/lib/auth-storage';

type QuestionStatus = 'not_visited' | 'not_answered' | 'answered' | 'marked_review' | 'answered_marked_review';

export default function ExamSimulatorPage() {
    const params = useParams();
    const router = useRouter();
    const mockTestId = String(params.mockTestId || '');

    const [testData, setTestData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Exam State
    const [hasStarted, setHasStarted] = useState(false);
    const [activeSectionIndex, setActiveSectionIndex] = useState(0);
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

    // Tracking Array[sectionIndex][questionIndex]
    const [responses, setResponses] = useState<Record<string, Record<string, string>>>({});
    const [statuses, setStatuses] = useState<Record<string, Record<string, QuestionStatus>>>({});
    const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const loadTest = async () => {
            setIsLoading(true);
            try {
                let token = getStoredToken('user');
                if (!token) token = getStoredToken('admin');
                if (!token) throw new Error("No token");

                const data = await fetchMockTestFull(token, mockTestId);
                setTestData(data);

                // Initialize response & status tracking
                const initialStatuses: Record<string, Record<string, QuestionStatus>> = {};
                const initialResponses: Record<string, Record<string, string>> = {};

                data.sections.forEach((sec: any) => {
                    initialStatuses[sec.id] = {};
                    initialResponses[sec.id] = {};
                    sec.questions.forEach((q: any) => {
                        initialStatuses[sec.id][q.id] = 'not_visited';
                        initialResponses[sec.id][q.id] = '';
                    });
                });
                setStatuses(initialStatuses);
                setResponses(initialResponses);
                setTimeLeftSeconds((data.totalDurationMinutes || 60) * 60);

            } catch (err) {
                console.error("Failed to load test", err);
                alert("Failed to load test data.");
                router.back();
            }
            setIsLoading(false);
        };
        loadTest();
        return () => stopTimer();
    }, [mockTestId]);

    const startTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setTimeLeftSeconds(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    handleForceSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const stopTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const beginTest = () => {
        setHasStarted(true);
        startTimer();
        // Mark first question as visited
        if (testData?.sections?.[0]?.questions?.[0]) {
            updateStatus(0, 0, 'not_answered');
        }
    };

    const handleForceSubmit = () => {
        alert("Time is up! Auto-submitting the test.");
        // Submit logic would go here
        router.back();
    };

    const submitTest = () => {
        if (confirm("Are you sure you want to submit the test early?")) {
            stopTimer();
            alert("Test submitted successfully!");
            router.back();
        }
    };

    const formatTime = (totalSeconds: number) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // --- Active Item Helpers ---
    const activeSection = testData?.sections?.[activeSectionIndex] || null;
    const activeQuestion = activeSection?.questions?.[activeQuestionIndex] || null;

    const updateStatus = (sIdx: number, qIdx: number, status: QuestionStatus) => {
        const secId = testData.sections[sIdx].id;
        const qId = testData.sections[sIdx].questions[qIdx].id;
        setStatuses(prev => ({
            ...prev,
            [secId]: { ...prev[secId], [qId]: status }
        }));
    };

    const setResponse = (value: string) => {
        if (!activeSection || !activeQuestion) return;
        setResponses(prev => ({
            ...prev,
            [activeSection.id]: { ...prev[activeSection.id], [activeQuestion.id]: value }
        }));
    };

    const navigateToQuestion = (sIdx: number, qIdx: number) => {
        // Evaluate current before moving
        if (activeSection && activeQuestion) {
            const currentStatus = statuses[activeSection.id][activeQuestion.id];
            const hasAnswer = responses[activeSection.id][activeQuestion.id];
            if (currentStatus === 'not_visited' || currentStatus === 'not_answered') {
                if (hasAnswer) updateStatus(activeSectionIndex, activeQuestionIndex, 'answered');
                else updateStatus(activeSectionIndex, activeQuestionIndex, 'not_answered');
            }
        }

        setActiveSectionIndex(sIdx);
        setActiveQuestionIndex(qIdx);

        // Mark new as visited if not visited
        const newSecId = testData.sections[sIdx].id;
        const newQId = testData.sections[sIdx].questions[qIdx].id;
        if (statuses[newSecId][newQId] === 'not_visited') {
            updateStatus(sIdx, qIdx, 'not_answered');
        }
    };

    const handleSaveAndNext = () => {
        if (activeSection && activeQuestion) {
            const hasAnswer = !!responses[activeSection.id][activeQuestion.id];
            const currentStatus = statuses[activeSection.id][activeQuestion.id];

            if (hasAnswer) {
                if (currentStatus === 'marked_review') updateStatus(activeSectionIndex, activeQuestionIndex, 'answered_marked_review');
                else updateStatus(activeSectionIndex, activeQuestionIndex, 'answered');
            } else {
                if (currentStatus !== 'marked_review') updateStatus(activeSectionIndex, activeQuestionIndex, 'not_answered');
            }
        }
        goNext();
    };

    const handleMarkForReviewAndNext = () => {
        if (activeSection && activeQuestion) {
            const hasAnswer = !!responses[activeSection.id][activeQuestion.id];
            updateStatus(activeSectionIndex, activeQuestionIndex, hasAnswer ? 'answered_marked_review' : 'marked_review');
        }
        goNext();
    };

    const handleClearResponse = () => {
        if (activeSection && activeQuestion) {
            setResponse('');
            updateStatus(activeSectionIndex, activeQuestionIndex, 'not_answered');
        }
    };

    const goNext = () => {
        if (!activeSection) return;
        if (activeQuestionIndex < activeSection.questions.length - 1) {
            navigateToQuestion(activeSectionIndex, activeQuestionIndex + 1);
        } else if (activeSectionIndex < testData.sections.length - 1) {
            navigateToQuestion(activeSectionIndex + 1, 0);
        }
    };

    const goPrev = () => {
        if (!activeSection) return;
        if (activeQuestionIndex > 0) {
            navigateToQuestion(activeSectionIndex, activeQuestionIndex - 1);
        } else if (activeSectionIndex > 0) {
            const prevSec = testData.sections[activeSectionIndex - 1];
            navigateToQuestion(activeSectionIndex - 1, prevSec.questions.length - 1);
        }
    };

    // Return Color classes based on status
    const getStatusColors = (status: QuestionStatus) => {
        switch (status) {
            case 'answered': return 'bg-emerald-500 text-white border-emerald-600';
            case 'not_answered': return 'bg-rose-500 text-white border-rose-600';
            case 'marked_review': return 'bg-purple-500 text-white border-purple-600';
            case 'answered_marked_review': return 'bg-indigo-600 text-white border-indigo-700 shadow-[inset_0_-4px_0_rgba(0,0,0,0.2)]';
            default: return 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'; // not_visited
        }
    };


    if (isLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-semibold tracking-wide">Loading Simulator...</div>;
    if (!testData) return <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">Test not found.<button className="mt-4 text-orange-600 underline" onClick={() => router.back()}>Go Back</button></div>;

    if (!hasStarted) {
        return (
            <div className="fixed inset-0 z-50 bg-slate-100 overflow-y-auto">
                <div className="max-w-4xl mx-auto my-12 bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                    <div className="bg-slate-900 px-8 py-6 text-white text-center">
                        <h1 className="text-3xl font-black">{testData.title}</h1>
                        <p className="opacity-80 mt-2 text-lg">{testData.totalDurationMinutes} Minutes</p>
                    </div>

                    <div className="p-10 text-slate-700 font-medium space-y-6 text-lg leading-relaxed">
                        <h3 className="text-2xl font-bold text-slate-800 border-b pb-3 mb-6">General Instructions</h3>
                        <p>1. The clock will be set at the server. The countdown timer in the top right corner will display the remaining time available for you to complete the examination.</p>
                        <p>2. The Question Palette displayed on the right side of screen will show the status of each question using one of the following symbols:</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-base bg-slate-50 p-6 rounded-xl border border-slate-200">
                            <div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-md border flex items-center justify-center font-bold ${getStatusColors('not_visited')}`}>1</div> <span className="text-slate-600">You have not visited the question yet.</span></div>
                            <div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-md border flex items-center justify-center font-bold ${getStatusColors('not_answered')}`}>3</div> <span className="text-slate-600">You have not answered the question.</span></div>
                            <div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-md border flex items-center justify-center font-bold ${getStatusColors('answered')}`}>5</div> <span className="text-slate-600">You have answered the question.</span></div>
                            <div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-md border flex items-center justify-center font-bold ${getStatusColors('marked_review')}`}>7</div> <span className="text-slate-600">You have NOT answered the question, but have marked it for review.</span></div>
                            <div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-md border flex items-center justify-center font-bold ${getStatusColors('answered_marked_review')}`}>9</div> <span className="text-slate-600">The question is answered and marked for review.</span></div>
                        </div>

                        <p className="mt-8 text-sm opacity-80 italic">By clicking "Ready to Begin", you confirm you have read the instructions and agree to the academic integrity terms.</p>
                    </div>

                    <div className="px-10 py-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                        <button onClick={() => router.back()} className="text-slate-500 font-semibold hover:text-slate-700 transition px-4 py-2">
                            Cancel
                        </button>
                        <button
                            onClick={beginTest}
                            className="bg-emerald-600 text-emerald-50 px-8 py-3.5 rounded-xl font-bold text-lg hover:bg-emerald-700 transition shadow-sm shadow-emerald-500/20"
                        >
                            I am ready to begin
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Main Exam Layout
    const currentResponse = activeSection && activeQuestion ? responses[activeSection.id][activeQuestion.id] : '';

    return (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col font-sans text-sm selection:bg-orange-100 selection:text-orange-900 border-t-[6px] border-indigo-600">
            {/* Top Navigation / Header */}
            <header className="h-14 bg-slate-50 border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-10 shrink-0">
                <div className="flex flex-col">
                    <span className="font-black text-slate-800 tracking-tight text-lg leading-tight">{testData.title}</span>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold px-4 py-1.5 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                        <Clock size={16} />
                        <span className="text-base tracking-widest tabular-nums">{formatTime(timeLeftSeconds)}</span>
                    </div>
                    <button
                        onClick={submitTest}
                        className="flex items-center gap-2 text-rose-600 hover:bg-rose-50 px-4 py-1.5 font-bold rounded-lg transition border border-transparent hover:border-rose-200"
                    >
                        <LogOut size={16} /> Submit Test
                    </button>
                </div>
            </header>

            {/* Section Tabs */}
            <div className="bg-[#E9ECEF] border-b border-[#ced4da] flex overflow-x-auto shrink-0 select-none hide-scrollbar">
                {testData.sections.map((section: any, idx: number) => {
                    const isActive = idx === activeSectionIndex;
                    return (
                        <div
                            key={section.id}
                            onClick={() => navigateToQuestion(idx, 0)}
                            className={`px-8 py-2.5 cursor-pointer font-bold relative transition-colors ${isActive ? 'bg-indigo-600 text-white shadow-md z-10' : 'text-[#495057] hover:bg-[#dee2e6]'
                                }`}
                        >
                            {section.title}
                            {isActive && <div className="absolute top-0 right-[-10px] w-0 h-0 border-t-[20px] border-b-[20px] border-l-[10px] border-l-indigo-600 border-t-transparent border-b-transparent z-20" />}
                        </div>
                    );
                })}
            </div>

            <div className="flex flex-1 overflow-hidden bg-white">
                {/* Left Content Area */}
                <div className="flex-1 flex flex-col relative">
                    {/* Info bar */}
                    <div className="h-10 border-b border-slate-200 bg-slate-50 flex items-center justify-between px-6 shrink-0 text-slate-600 font-bold text-xs uppercase tracking-wider">
                        <span>Question No. {activeQuestionIndex + 1}</span>
                        <span>Marks for correct answer: <span className="text-emerald-600">{activeQuestion?.marks || 1}</span> | Negative Marks: <span className="text-rose-600">0</span></span>
                    </div>

                    {/* Question Content */}
                    <div className="flex-1 overflow-y-auto p-8 lg:p-12 text-base text-slate-800 leading-relaxed max-w-4xl">
                        <div className="font-semibold text-lg mb-8" dangerouslySetInnerHTML={{ __html: activeQuestion?.questionText || '' }} />

                        {activeQuestion?.questionType === 'MCQ' && (
                            <div className="space-y-3 pl-4 border-l-2 border-indigo-100">
                                {activeQuestion?.optionsJson?.map((opt: string, idx: number) => {
                                    const isChecked = currentResponse === String(idx);
                                    return (
                                        <label
                                            key={idx}
                                            className={`flex items-center gap-4 cursor-pointer p-3 rounded-lg border-2 transition-all select-none hover:bg-slate-50 ${isChecked ? 'border-indigo-500 bg-indigo-50/30' : 'border-transparent'}`}
                                        >
                                            <div className="flex shrink-0 items-center justify-center border-2 border-slate-300 w-6 h-6 rounded-full bg-white relative">
                                                {isChecked && <div className="w-3 h-3 bg-indigo-600 rounded-full" />}
                                            </div>
                                            <span className={`font-medium ${isChecked ? 'text-indigo-900' : 'text-slate-700'}`}>{opt}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        )}

                        {activeQuestion?.questionType === 'TEXT' && (
                            <div className="mt-4">
                                <textarea
                                    className="w-full h-48 p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none font-mono text-sm leading-relaxed"
                                    placeholder="Write your answer here..."
                                    value={currentResponse}
                                    onChange={(e) => setResponse(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    {/* Action Footer */}
                    <div className="border-t border-slate-200 bg-slate-50 h-16 shrink-0 px-6 flex items-center justify-between">
                        <div className="flex gap-3">
                            <button onClick={handleMarkForReviewAndNext} className="bg-white border border-slate-300 text-slate-700 font-bold px-5 py-2 rounded shadow-sm hover:bg-slate-100 transition active:scale-[0.98]">
                                Mark for Review & Next
                            </button>
                            <button onClick={handleClearResponse} className="bg-white border border-slate-300 text-slate-700 font-bold px-5 py-2 rounded shadow-sm hover:bg-slate-100 transition active:scale-[0.98]">
                                Clear Response
                            </button>
                        </div>
                        <button onClick={handleSaveAndNext} className="bg-emerald-600 text-white font-bold px-8 py-2.5 rounded shadow-sm hover:bg-emerald-700 transition active:scale-[0.98] border border-emerald-700">
                            Save & Next
                        </button>
                    </div>
                </div>

                {/* Right Palette Panel */}
                <div className="w-80 border-l border-slate-200 bg-slate-50 flex flex-col shrink-0 text-xs shadow-[-4px_0_15px_rgba(0,0,0,0.02)] z-10">
                    <div className="p-4 bg-[#E9ECEF] border-b border-slate-200 font-bold text-slate-700 flex items-center justify-center shrink-0">
                        {testData?.company?.logoUrl ? <img src={testData.company.logoUrl} className="h-8 object-contain" /> : testData?.company?.name || 'Company'} Profile
                    </div>

                    {/* Palette Legend */}
                    <div className="p-4 bg-white grid grid-cols-2 gap-y-3 gap-x-2 border-b border-slate-200 shrink-0 font-medium">
                        <div className="flex items-center gap-2"><div className={`w-6 h-6 rounded flex items-center justify-center text-white border border-slate-300 ${getStatusColors('answered')}`}>0</div> Answered</div>
                        <div className="flex items-center gap-2"><div className={`w-6 h-6 rounded flex items-center justify-center text-white ${getStatusColors('not_answered')}`}>0</div> Not Answered</div>
                        <div className="flex items-center gap-2"><div className={`w-6 h-6 rounded flex items-center justify-center text-slate-600 ${getStatusColors('not_visited')}`}>0</div> Not Visited</div>
                        <div className="flex items-center gap-2"><div className={`w-6 h-6 rounded flex items-center justify-center text-white ${getStatusColors('marked_review')}`}>0</div> Marked for Review</div>
                        <div className="col-span-2 flex items-center gap-2 mt-1">
                            <div className={`w-6 h-6 rounded flex items-center justify-center text-white ${getStatusColors('answered_marked_review')}`}>0</div>
                            Answered & Marked for Review (will be considered for evaluation)
                        </div>
                    </div>

                    {/* Question Grid */}
                    <div className="bg-[#eff1f4] flex-1 overflow-y-auto px-1">
                        <div className="bg-blue-600 text-white font-bold py-1.5 px-4 sticky top-0 z-10 mb-3 shadow">
                            Choose a Question
                        </div>
                        <div className="grid grid-cols-5 gap-2 px-3 pb-8">
                            {activeSection?.questions?.map((q: any, idx: number) => {
                                const status = statuses[activeSection.id]?.[q.id] || 'not_visited';
                                return (
                                    <button
                                        key={q.id}
                                        onClick={() => navigateToQuestion(activeSectionIndex, idx)}
                                        className={`relative aspect-square rounded-md border flex items-center justify-center font-bold text-sm shadow-sm transition-all hover:-translate-y-0.5
                                            ${getStatusColors(status)}
                                            ${idx === activeQuestionIndex ? 'ring-2 ring-offset-1 ring-blue-500 scale-105 z-10 shadow-md' : 'opacity-90'}
                                         `}
                                    >
                                        {idx + 1}
                                        {status === 'answered_marked_review' && <div className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 bg-green-400 rounded-full" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
