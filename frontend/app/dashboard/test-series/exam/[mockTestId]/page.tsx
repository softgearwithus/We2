'use client';

import { fetchApi } from '../../../../lib/apiClient';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
    Clock, Menu, CheckCircle2, Circle, AlertCircle,
    ChevronRight, ChevronLeft, Bookmark, Check, LogOut,
    Code2, MapIcon, Hash, Keyboard, ZoomOut, ZoomIn, Moon, Sun, RotateCcw
} from 'lucide-react';
import { fetchMockTestFull, submitMockTest, API_BASE } from '@/app/lib/test-series-builder';
import { getStoredToken } from '@/app/lib/auth-storage';
import { initVimMode } from 'monaco-vim';
import Editor from '@monaco-editor/react';
import CalculatorWidget from '@/app/components/simulator/CalculatorWidget';
import { sanitizeRichHtml } from '@/lib/sanitize-rich-text';

type QuestionStatus = 'not_visited' | 'not_answered' | 'answered' | 'marked_review' | 'answered_marked_review';

export default function ExamSimulatorPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const mockTestId = String(params.mockTestId || '');
    const reviewId = searchParams.get('review');
    const isReviewMode = !!reviewId;

    const [testData, setTestData] = useState<any>(null);
    const [resultData, setResultData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Exam State
    const [hasStarted, setHasStarted] = useState(false);
    const [activeSectionIndex, setActiveSectionIndex] = useState(0);
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

    // IDE Customization State
    const [language, setLanguage] = useState('javascript');
    const [fontSize, setFontSize] = useState(14);
    const [theme, setTheme] = useState<'light' | 'vs-dark'>('vs-dark');
    const [showMinimap, setShowMinimap] = useState(false);
    const [showLineNumbers, setShowLineNumbers] = useState(true);
    const [vimModeEnabled, setVimModeEnabled] = useState(false);
    const [showCalculator, setShowCalculator] = useState(false);

    // IDE Refs
    const editorRef = useRef<any>(null);
    const vimModeRef = useRef<any>(null);
    const vimStatusRef = useRef<HTMLDivElement>(null);

    // Handle VIM Mode Toggle
    useEffect(() => {
        if (!editorRef.current || !vimStatusRef.current) return;
        if (vimModeEnabled) {
            if (!vimModeRef.current) vimModeRef.current = initVimMode(editorRef.current, vimStatusRef.current);
        } else {
            if (vimModeRef.current) {
                vimModeRef.current.dispose();
                vimModeRef.current = null;
            }
        }
        return () => vimModeRef.current?.dispose();
    }, [vimModeEnabled]);

    const handleEditorMount = (editor: any) => {
        editorRef.current = editor;
    };

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

                let fetchedResultData = null;
                if (isReviewMode) {
                    const res = await fetchApi(`${API_BASE}/test-series/student/results/${reviewId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.ok) {
                        fetchedResultData = await res.json();
                        setResultData(fetchedResultData);
                    }
                }

                // Initialize response & status tracking
                const initialStatuses: Record<string, Record<string, QuestionStatus>> = {};
                const initialResponses: Record<string, Record<string, string>> = {};

                data.sections.forEach((sec: any) => {
                    initialStatuses[sec.id] = {};
                    initialResponses[sec.id] = {};
                    sec.questions.forEach((q: any) => {
                        let status: QuestionStatus = 'not_visited';
                        let answer = '';

                        if (fetchedResultData) {
                            // In review mode, prepopulate responses and strict correctness status
                            const r = fetchedResultData.responses?.find((resp: any) => resp.question.id === q.id);
                            if (r) {
                                answer = r.responseValue || '';
                                if (!answer) status = 'not_answered';
                                else status = 'answered'; // We'll override the rendering color differently in review mode
                            } else {
                                status = 'not_visited';
                            }
                        }

                        initialStatuses[sec.id][q.id] = status;
                        initialResponses[sec.id][q.id] = answer;
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

    const [startTimeMs, setStartTimeMs] = useState<number>(0);

    const beginTest = () => {
        setHasStarted(true);
        setStartTimeMs(Date.now());
        if (!isReviewMode) {
            startTimer();
        }
        // Mark first question as visited
        if (testData?.sections?.[0]?.questions?.[0]) {
            if (!isReviewMode) updateStatus(0, 0, 'not_answered');
        }
    };

    const buildSubmitPayload = () => {
        const flatResponses: any[] = [];
        Object.entries(responses).forEach(([sectionId, qMap]) => {
            Object.entries(qMap).forEach(([questionId, responseValue]) => {
                if (responseValue) {
                    flatResponses.push({
                        questionId,
                        responseValue,
                        timeSpentSeconds: 0 // Mocking time spent for now, can be evolved later
                    });
                }
            });
        });

        return {
            startTime: new Date(startTimeMs),
            endTime: new Date(),
            responses: flatResponses
        };
    };

    const handleForceSubmit = async () => {
        alert("Time is up! Auto-submitting the test...");
        await doSubmit();
    };

    const submitTest = async () => {
        if (confirm("Are you sure you want to submit the test early?")) {
            await doSubmit();
        }
    };

    const doSubmit = async () => {
        stopTimer();
        setIsLoading(true);
        try {
            let token = getStoredToken('user') || getStoredToken('admin');
            const payload = buildSubmitPayload();
            await submitMockTest(token!, mockTestId, payload);

            // Redirect to Mock Analysis (Result in Progress)
            alert("Test submitted successfully! Your result is being prepared.");
            router.push('/dashboard/test-series/mock-analysis');
        } catch (error) {
            console.error("Submission failed", error);
            alert("Failed to submit test. Please try again.");
            setIsLoading(false);
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

    const findNextQuestion = (sIdx: number, qIdx: number) => {
        if (!testData?.sections?.length) return null;
        for (let s = sIdx; s < testData.sections.length; s += 1) {
            const questions = testData.sections[s]?.questions || [];
            const startQ = s === sIdx ? qIdx : 0;
            for (let q = startQ; q < questions.length; q += 1) {
                return { sectionIndex: s, questionIndex: q };
            }
        }
        return null;
    };

    const findPrevQuestion = (sIdx: number, qIdx: number) => {
        if (!testData?.sections?.length) return null;
        for (let s = sIdx; s >= 0; s -= 1) {
            const questions = testData.sections[s]?.questions || [];
            const startQ = s === sIdx ? qIdx : questions.length - 1;
            for (let q = startQ; q >= 0; q -= 1) {
                return { sectionIndex: s, questionIndex: q };
            }
        }
        return null;
    };

    const updateStatus = (sIdx: number, qIdx: number, status: QuestionStatus) => {
        const section = testData?.sections?.[sIdx];
        const question = section?.questions?.[qIdx];
        if (!section || !question) return;
        const secId = section.id;
        const qId = question.id;
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
        const targetSection = testData?.sections?.[sIdx];
        const targetQuestion = targetSection?.questions?.[qIdx];
        if (!targetSection || !targetQuestion) return;

        // Evaluate current before moving
        if (activeSection && activeQuestion && !isReviewMode) {
            const currentStatus = statuses[activeSection.id]?.[activeQuestion.id] || 'not_visited';
            const hasAnswer = responses[activeSection.id]?.[activeQuestion.id];
            if (currentStatus === 'not_visited' || currentStatus === 'not_answered') {
                if (hasAnswer) updateStatus(activeSectionIndex, activeQuestionIndex, 'answered');
                else updateStatus(activeSectionIndex, activeQuestionIndex, 'not_answered');
            }
        }

        setActiveSectionIndex(sIdx);
        setActiveQuestionIndex(qIdx);

        // Mark new as visited if not visited
        const newSecId = targetSection.id;
        const newQId = targetQuestion.id;
        if (statuses[newSecId]?.[newQId] === 'not_visited' && !isReviewMode) {
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
        if (!testData?.sections?.length) return;
        const next = findNextQuestion(activeSectionIndex, activeQuestionIndex + 1)
            || findNextQuestion(activeSectionIndex + 1, 0);
        if (next) {
            navigateToQuestion(next.sectionIndex, next.questionIndex);
        }
    };

    const goPrev = () => {
        if (!testData?.sections?.length) return;
        const prev = findPrevQuestion(activeSectionIndex, activeQuestionIndex - 1)
            || findPrevQuestion(activeSectionIndex - 1, Number.POSITIVE_INFINITY);
        if (prev) {
            navigateToQuestion(prev.sectionIndex, prev.questionIndex);
        }
    };

    // Return Color classes based on status
    const getStatusStyle = (status: QuestionStatus, qId?: string) => {
        if (isReviewMode && resultData && qId) {
            const resp = resultData.responses?.find((r: any) => r.question.id === qId);
            if (!resp || !resp.responseValue) return 'bg-[#f1f5f9] text-slate-700 border-[#cbd5e1] rounded-md'; // Skipped
            if (resp.isCorrect) return 'bg-[#21b25b] text-white border-transparent rounded-md'; // Correct (Green)
            if (resp.isCorrect === false) return 'bg-[#eb3a34] text-white border-transparent rounded-md'; // Incorrect (Red)
            return 'bg-blue-500 text-white border-transparent rounded-md'; // Pending AI Evaluation
        }

        switch (status) {
            case 'answered':
                return 'bg-[#21b25b] text-white border-transparent rounded-t-[40%] rounded-b-md';
            case 'not_answered':
                return 'bg-[#eb3a34] text-white border-transparent rounded-b-[40%] rounded-t-md';
            case 'marked_review':
                return 'bg-[#6223b5] text-white border-transparent rounded-full';
            case 'answered_marked_review':
                return 'bg-[#6223b5] text-white border-transparent rounded-full';
            default: // not_visited
                return 'bg-[#f1f5f9] text-slate-700 border-[#cbd5e1] rounded-md';
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
                            <div className="flex items-center gap-3"><div className={`w-10 h-10 border flex items-center justify-center font-bold shadow-sm ${getStatusStyle('not_visited')}`}>1</div> <span className="text-slate-600">You have not visited the question yet.</span></div>
                            <div className="flex items-center gap-3"><div className={`w-10 h-10 border flex items-center justify-center font-bold shadow-sm ${getStatusStyle('not_answered')}`}>2</div> <span className="text-slate-600">You have not answered the question.</span></div>
                            <div className="flex items-center gap-3"><div className={`w-10 h-10 border flex items-center justify-center font-bold shadow-sm ${getStatusStyle('answered')}`}>3</div> <span className="text-slate-600">You have answered the question.</span></div>
                            <div className="flex items-center gap-3"><div className={`w-10 h-10 border flex items-center justify-center font-bold shadow-sm ${getStatusStyle('marked_review')}`}>4</div> <span className="text-slate-600">You have NOT answered the question, but have marked it for review.</span></div>
                            <div className="flex items-center gap-3"><div className={`w-10 h-10 border flex items-center justify-center font-bold relative shadow-sm ${getStatusStyle('answered_marked_review')}`}>5<div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" /></div> <span className="text-slate-600">The question is answered and marked for review.</span></div>
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
    const activeResultResponse = isReviewMode && resultData ? resultData.responses?.find((r: any) => r.question.id === activeQuestion?.id) : null;

    const statusCounts = {
        answered: 0,
        not_answered: 0,
        not_visited: 0,
        marked_review: 0,
        answered_marked_review: 0
    };
    Object.values(statuses).forEach(qMap => {
        Object.values(qMap).forEach(s => {
            if (statusCounts[s as keyof typeof statusCounts] !== undefined) {
                statusCounts[s as keyof typeof statusCounts]++;
            }
        });
    });

    return (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col font-sans text-sm selection:bg-orange-100 selection:text-orange-900 border-t-[6px] border-slate-800">
            {/* Top Navigation / Header */}
            <header className="h-14 bg-slate-50 border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-10 shrink-0">
                <div className="flex flex-col">
                    <span className="font-black text-slate-800 tracking-tight text-lg leading-tight">{testData.title}</span>
                </div>

                <div className="flex items-center gap-6">
                    {isReviewMode ? (
                        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold px-4 py-1.5 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                            <CheckCircle2 size={16} />
                            <span className="text-base tracking-widest">REVIEW MODE</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 text-slate-900 font-bold px-4 py-1.5 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                            <Clock size={16} />
                            <span className="text-base tracking-widest tabular-nums">{formatTime(timeLeftSeconds)}</span>
                        </div>
                    )}
                    <button
                        onClick={() => setShowCalculator(!showCalculator)}
                        className={`flex items-center gap-2 px-4 py-1.5 font-bold rounded-lg transition border ${showCalculator ? 'bg-slate-100 text-slate-900 border-slate-200 shadow-inner' : 'text-slate-600 hover:bg-slate-100 border-transparent hover:border-slate-200'}`}
                        title="Toggle Calculator"
                    >
                        <Hash size={16} /> Calculator
                    </button>
                    {isReviewMode ? (
                        <button
                            onClick={() => router.push(`/dashboard/test-series/analysis/${reviewId}`)}
                            className="flex items-center gap-2 text-slate-600 hover:bg-slate-100 px-4 py-1.5 font-bold rounded-lg transition border border-transparent hover:border-slate-200"
                        >
                            <LogOut size={16} /> Exit Review
                        </button>
                    ) : (
                        <button
                            onClick={submitTest}
                            className="flex items-center gap-2 text-rose-600 hover:bg-rose-50 px-4 py-1.5 font-bold rounded-lg transition border border-transparent hover:border-rose-200"
                        >
                            <LogOut size={16} /> Submit Test
                        </button>
                    )}
                </div>
            </header>

            {/* Draggable Calculator Widget */}
            {showCalculator && <CalculatorWidget onClose={() => setShowCalculator(false)} />}

            {/* Section Tabs */}
            <div className="bg-[#E9ECEF] border-b border-[#ced4da] flex overflow-x-auto shrink-0 select-none hide-scrollbar">
                {testData.sections.map((section: any, idx: number) => {
                    const isActive = idx === activeSectionIndex;
                    return (
                        <div
                            key={section.id}
                            onClick={() => navigateToQuestion(idx, 0)}
                            className={`px-8 py-2.5 cursor-pointer font-bold relative transition-colors ${isActive ? 'bg-slate-800 text-white shadow-md z-10' : 'text-[#495057] hover:bg-[#dee2e6]'
                                }`}
                        >
                            {section.title}
                            {isActive && <div className="absolute top-0 right-[-10px] w-0 h-0 border-t-[20px] border-b-[20px] border-l-[10px] border-l-slate-600 border-t-transparent border-b-transparent z-20" />}
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

                    {/* Split View Container for Passage vs Question */}
                    <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                        {activeQuestion?.passageContent && (
                            <div className="flex-1 overflow-y-auto p-8 lg:p-12 border-b md:border-b-0 md:border-r border-slate-200 bg-amber-50/30">
                                <h3 className="font-bold text-sm text-slate-500 uppercase tracking-widest mb-4">Reading Passage</h3>
                                <div
                                    className="text-base text-slate-800 leading-relaxed font-serif prose prose-slate max-w-none"
                                    dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(activeQuestion?.passageContent || '') }}
                                />
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto p-8 lg:p-12 text-base text-slate-800 leading-relaxed">
                            <div className="max-w-4xl mx-auto">
                                <div className="font-semibold text-lg mb-6 leading-relaxed text-slate-800 break-words" dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(activeQuestion?.questionText || '') }} />

                                {activeQuestion?.imageUrl && (
                                    <div className="mb-8 relative inline-block">
                                        <img loading="lazy" decoding="async" src={activeQuestion.imageUrl} alt="Question Graphic" className="max-w-full md:max-w-2xl h-auto max-h-96 rounded-xl border border-slate-200 shadow-sm object-contain bg-slate-50 block" />
                                    </div>
                                )}

                                {activeQuestion?.questionType === 'SINGLE_CORRECT' && (
                                    <div className="space-y-3 pl-4 border-l-2 border-slate-200">
                                        {activeQuestion?.optionsJson?.map((opt: string, idx: number) => {
                                            const isChecked = currentResponse === String(idx);
                                            return (
                                                <label
                                                    key={idx}
                                                    onClick={(e) => {
                                                        if (isReviewMode) { e.preventDefault(); return; }
                                                        setResponse(String(idx));
                                                    }}
                                                    className={`flex items-center gap-4 cursor-pointer p-3 rounded-lg border-2 transition-all select-none ${isReviewMode ? '' : 'hover:bg-slate-50'} ${isChecked ? 'border-slate-400 bg-slate-50/30' : 'border-transparent'} ${isReviewMode ? 'pointer-events-none' : ''}`}
                                                >
                                                    <div className="flex shrink-0 items-center justify-center border-2 border-slate-300 w-6 h-6 rounded-full bg-white relative">
                                                        {isChecked && <div className="w-3 h-3 bg-slate-800 rounded-full" />}
                                                        {isReviewMode && activeQuestion?.correctAnswer === String(idx) && (
                                                            <div className="absolute -right-8 text-emerald-600 font-bold"><CheckCircle2 size={20} /></div>
                                                        )}
                                                    </div>
                                                    <span className={`font-medium ${isChecked ? 'text-slate-900' : 'text-slate-700'}`}>{opt}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}

                                {activeQuestion?.questionType === 'MULTI_CORRECT' && (
                                    <div className="space-y-3 pl-4 border-l-2 border-slate-200">
                                        {activeQuestion?.optionsJson?.map((opt: string, idx: number) => {
                                            const checkedIndices = currentResponse ? currentResponse.split(',') : [];
                                            const isChecked = checkedIndices.includes(String(idx));
                                            return (
                                                <label
                                                    key={idx}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (isReviewMode) return;
                                                        let newArr = [...checkedIndices];
                                                        if (!isChecked) newArr.push(String(idx));
                                                        else newArr = newArr.filter(i => i !== String(idx));
                                                        setResponse(newArr.join(','));
                                                    }}
                                                    className={`flex items-center gap-4 cursor-pointer p-3 rounded-lg border-2 transition-all select-none ${isReviewMode ? '' : 'hover:bg-slate-50'} ${isChecked ? 'border-slate-400 bg-slate-50/30' : 'border-transparent'} ${isReviewMode ? 'pointer-events-none' : ''}`}
                                                >
                                                    <div className={`flex shrink-0 items-center justify-center border-2 w-6 h-6 rounded bg-white relative ${isChecked ? 'border-slate-800 bg-slate-800' : 'border-slate-300'}`}>
                                                        {isChecked && <Check size={16} className="text-white absolute" strokeWidth={3} />}
                                                        {isReviewMode && (activeQuestion?.correctAnswer || '').split(',').includes(String(idx)) && (
                                                            <div className="absolute -right-8 text-emerald-600 font-bold"><CheckCircle2 size={20} /></div>
                                                        )}
                                                    </div>
                                                    <span className={`font-medium ${isChecked ? 'text-slate-900' : 'text-slate-700'}`}>{opt}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}

                                {activeQuestion?.questionType === 'TEXT' && (
                                    <div className="mt-4">
                                        <textarea
                                            className={`w-full h-48 p-4 border border-slate-300 rounded-xl outline-none resize-none font-mono text-sm leading-relaxed ${isReviewMode ? 'bg-slate-50 text-slate-600 cursor-not-allowed' : 'focus:ring-2 focus:ring-slate-200 focus:border-slate-400'}`}
                                            placeholder="Write your answer here..."
                                            value={currentResponse}
                                            readOnly={isReviewMode}
                                            onChange={(e) => setResponse(e.target.value)}
                                        />
                                    </div>
                                )}

                                {activeQuestion?.questionType === 'CODE' && (
                                    <div className="mt-4 flex flex-col h-[500px] border border-slate-300 rounded-xl overflow-hidden shadow-sm">
                                        {/* Premium Editor Toolbar */}
                                        <div className="h-10 border-b border-slate-200 bg-slate-50 flex items-center justify-between px-3 shrink-0">
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded text-xs font-bold text-slate-700 shadow-sm">
                                                    <Code2 size={14} className="text-slate-800" /> Code
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center bg-white border border-slate-200 rounded-md shadow-sm mr-2">
                                                    <button
                                                        onClick={() => setShowMinimap(!showMinimap)}
                                                        className={`p-1.5 text-slate-500 border-r border-slate-100 transition-colors ${showMinimap ? 'bg-slate-50 text-slate-800' : 'hover:bg-slate-50'}`}
                                                        title="Toggle Minimap"
                                                    >
                                                        <MapIcon size={12} />
                                                    </button>
                                                    <button
                                                        onClick={() => setShowLineNumbers(!showLineNumbers)}
                                                        className={`p-1.5 text-slate-500 border-r border-slate-100 transition-colors ${showLineNumbers ? 'bg-slate-50 text-slate-800' : 'hover:bg-slate-50'}`}
                                                        title="Toggle Line Numbers"
                                                    >
                                                        <Hash size={12} />
                                                    </button>
                                                    <button
                                                        onClick={() => setVimModeEnabled(!vimModeEnabled)}
                                                        className={`p-1.5 text-slate-500 transition-colors ${vimModeEnabled ? 'bg-slate-50 text-slate-800' : 'hover:bg-slate-50'}`}
                                                        title={`Toggle VIM Mode ${vimModeEnabled ? '(On)' : '(Off)'}`}
                                                    >
                                                        <Keyboard size={12} />
                                                    </button>
                                                </div>
                                                <div className="flex items-center bg-white border border-slate-200 rounded-md shadow-sm mr-2">
                                                    <button
                                                        onClick={() => setFontSize(Math.max(10, fontSize - 1))}
                                                        className="p-1.5 hover:bg-slate-50 text-slate-500 border-r border-slate-100" title="Decrease Font"
                                                    >
                                                        <ZoomOut size={12} />
                                                    </button>
                                                    <span className="text-[10px] font-medium w-6 text-center text-slate-600">{fontSize}</span>
                                                    <button
                                                        onClick={() => setFontSize(Math.min(24, fontSize + 1))}
                                                        className="p-1.5 hover:bg-slate-50 text-slate-500 border-l border-slate-100" title="Increase Font"
                                                    >
                                                        <ZoomIn size={12} />
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => setTheme(theme === 'light' ? 'vs-dark' : 'light')}
                                                    className="p-1.5 rounded-md hover:bg-slate-200 text-slate-500 transition-colors"
                                                    title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                                                >
                                                    {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
                                                </button>
                                                <button
                                                    onClick={() => setResponse('')}
                                                    className="p-1.5 rounded-md hover:bg-slate-200 text-slate-500 transition-colors"
                                                    title="Clear Code"
                                                >
                                                    <RotateCcw size={14} />
                                                </button>
                                                <div className="h-4 w-[1px] bg-slate-200 mx-1" />
                                                <select
                                                    value={language}
                                                    onChange={(e) => setLanguage(e.target.value)}
                                                    className="bg-white border border-slate-200 text-xs font-medium text-slate-700 rounded-md px-2 py-1 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-200 shadow-sm"
                                                >
                                                    <option value="javascript">JavaScript</option>
                                                    <option value="python">Python</option>
                                                    <option value="cpp">C++</option>
                                                    <option value="java">Java</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="flex-1 overflow-hidden relative flex flex-col">
                                            <div className="flex-1 relative">
                                                <Editor
                                                    height="100%"
                                                    language={language}
                                                    value={currentResponse}
                                                    onChange={(value) => setResponse(value || '')}
                                                    onMount={handleEditorMount}
                                                    theme={theme}
                                                    options={{
                                                        readOnly: isReviewMode,
                                                        minimap: { enabled: showMinimap },
                                                        fontSize: fontSize,
                                                        lineNumbers: showLineNumbers ? 'on' : 'off',
                                                        scrollBeyondLastLine: false,
                                                        automaticLayout: true,
                                                        padding: { top: 16, bottom: 16 },
                                                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                                        fontLigatures: true,
                                                        cursorBlinking: "smooth",
                                                        smoothScrolling: true,
                                                        renderLineHighlight: 'all',
                                                    }}
                                                />
                                            </div>
                                            <div
                                                ref={vimStatusRef}
                                                className={`border-t border-slate-200 bg-slate-100 text-xs px-2 py-0.5 font-mono text-slate-700 ${!vimModeEnabled ? 'hidden' : 'block'}`}
                                                style={{ minHeight: '20px' }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                                {isReviewMode && activeResultResponse && (
                                    <div className="mt-8 pt-6 border-t border-slate-200">
                                        {activeResultResponse.aiFeedback && (
                                            <div className="mb-4 bg-blue-50/50 p-5 rounded-xl border border-blue-100 text-sm">
                                                <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                                                    AI Evaluation Feedback
                                                </h4>
                                                <div className="text-blue-800 leading-relaxed font-medium">
                                                    {activeResultResponse.aiFeedback}
                                                </div>
                                            </div>
                                        )}
                                        {activeQuestion?.solutionText && (
                                            <div className="bg-emerald-50/50 p-5 rounded-xl border border-emerald-100 text-sm">
                                                <h4 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
                                                    Detailed Solution
                                                </h4>
                                                <div className="text-emerald-800 leading-relaxed font-medium">
                                                    {activeQuestion.solutionText}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Action Footer */}
                            {!isReviewMode && (
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
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Palette Panel */}
                <div className="w-80 border-l border-slate-200 bg-slate-50 flex flex-col shrink-0 text-xs shadow-[-4px_0_15px_rgba(0,0,0,0.02)] z-10">
                    <div className="p-4 bg-[#E9ECEF] border-b border-slate-200 font-bold text-slate-700 flex items-center justify-center shrink-0">
                        {testData?.company?.logoUrl ? <img loading="lazy" decoding="async" src={testData.company.logoUrl} className="h-8 object-contain" /> : testData?.company?.name || 'Company'} Profile
                    </div>

                    {/* Palette Legend */}
                    <div className="p-4 bg-white grid grid-cols-2 gap-y-4 gap-x-2 border-b border-slate-200 shrink-0 text-xs font-semibold text-slate-700">
                        <div className="flex items-center gap-2.5"><div className={`w-8 h-8 flex items-center justify-center shadow-sm text-sm ${getStatusStyle('answered')}`}>{statusCounts.answered}</div> <span className="flex-1">Answered</span></div>
                        <div className="flex items-center gap-2.5"><div className={`w-8 h-8 flex items-center justify-center shadow-sm text-sm ${getStatusStyle('not_answered')}`}>{statusCounts.not_answered}</div> <span className="flex-1">Not Answered</span></div>
                        <div className="flex items-center gap-2.5"><div className={`w-8 h-8 flex items-center justify-center shadow-sm text-sm border ${getStatusStyle('not_visited')}`}>{statusCounts.not_visited}</div> <span className="flex-1">Not Visited</span></div>
                        <div className="flex items-center gap-2.5"><div className={`w-8 h-8 flex items-center justify-center shadow-sm text-sm ${getStatusStyle('marked_review')}`}>{statusCounts.marked_review}</div> <span className="flex-1">Marked for Review</span></div>
                        <div className="col-span-2 flex items-center gap-3 mt-1">
                            <div className={`w-8 h-8 flex items-center justify-center shadow-sm text-sm relative ${getStatusStyle('answered_marked_review')}`}>{statusCounts.answered_marked_review}<div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" /></div>
                            <span className="flex-1">Answered & Marked for Review</span>
                        </div>
                    </div>

                    {/* Question Grid */}
                    <div className="bg-[#eff1f4] flex-1 overflow-y-auto px-1">
                        <div className="bg-blue-600 text-white font-bold py-1.5 px-4 sticky top-0 z-10 mb-3 shadow">
                            Choose a Question
                        </div>
                        <div className="flex flex-wrap gap-2.5 px-4 pb-8">
                            {activeSection?.questions?.map((q: any, idx: number) => {
                                const status = statuses[activeSection.id]?.[q.id] || 'not_visited';
                                return (
                                    <button
                                        key={q.id}
                                        onClick={() => navigateToQuestion(activeSectionIndex, idx)}
                                        className={`relative w-10 h-10 flex items-center justify-center font-bold text-sm shadow-sm transition-all border
                                            ${getStatusStyle(status, q.id)}
                                            ${idx === activeQuestionIndex ? 'ring-2 ring-offset-2 ring-blue-500 z-10 scale-110' : 'hover:scale-105'}
                                         `}
                                    >
                                        {idx + 1}
                                        {status === 'answered_marked_review' && !isReviewMode && <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />}
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
