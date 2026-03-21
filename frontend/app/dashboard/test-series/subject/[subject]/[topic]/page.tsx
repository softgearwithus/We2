'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Clock, CheckCircle2, Hash, ZoomOut, ZoomIn, Moon, Sun, RotateCcw,
    Code2, MapIcon, Keyboard, LogOut, Check
} from 'lucide-react';
import { getStoredToken } from '@/app/lib/auth-storage';
import API_BASE_URL from '@/app/lib/api-config';
import { initVimMode } from 'monaco-vim';
import Editor from '@monaco-editor/react';
import CalculatorWidget from '@/app/components/simulator/CalculatorWidget';

type QuestionStatus = 'not_visited' | 'not_answered' | 'answered' | 'marked_review' | 'answered_marked_review';

const SUBJECT_LABELS: Record<string, string> = {
    english: 'English',
    aptitude: 'Aptitude',
    logical_reasoning: 'Logical Reasoning',
    computer_science: 'Computer Science',
};

export default function SubjectModuleSimulatorPage() {
    const params = useParams();
    const router = useRouter();
    const subject = String(params.subject || '');
    const topic = String(params.topic || '');
    
    const subjectLabel = SUBJECT_LABELS[subject] || 'Subject';
    const topicLabel = topic ? decodeURIComponent(topic).replace(/_/g, ' ') : 'Module';

    const [isReviewMode, setIsReviewMode] = useState(false);
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
        let cancelled = false;

        const loadTest = async () => {
            setIsLoading(true);
            try {
                const tokens = [getStoredToken('user'), getStoredToken('admin')].filter((token, index, arr): token is string => Boolean(token) && arr.indexOf(token) === index);
                if (tokens.length === 0) throw new Error('No token');

                // Fetch raw MCQs for the module
                const params = new URLSearchParams({
                    category: 'subject',
                    groupKey: subject,
                    limit: '100',
                });
                if (topic) {
                    params.set('topicKey', topic);
                }

                let data: any = null;
                let lastError: Error | null = null;

                for (const token of tokens) {
                    try {
                        const response = await fetch(`${API_BASE_URL}/mcqs?${params.toString()}`, {
                            headers: { Authorization: `Bearer ${token}` },
                            cache: 'no-store',
                        });

                        if (!response.ok) {
                            const payload = await response.json().catch(() => null);
                            throw new Error(payload?.message || `Failed to load practice set (${response.status})`);
                        }

                        data = await response.json();
                        lastError = null;
                        break;
                    } catch (fetchError) {
                        lastError = fetchError instanceof Error ? fetchError : new Error('Failed to load practice set');
                    }
                }

                if (!data) {
                    throw lastError || new Error('Failed to load practice set');
                }
                
                if (!data || !data.items || data.items.length === 0) {
                     if (!cancelled) {
                         setTestData(null);
                         setIsLoading(false);
                     }
                     return;
                 }

                // Determine max duration from the questions or default to 60
                const maxDuration = data.items.reduce((max: number, q: any) => Math.max(max, q.topicDurationMinutes || 1.5), 0) || 60;

                // Transform into Simulator format
                const simTest = {
                    title: `${subjectLabel} - ${topicLabel}`,
                    totalDurationMinutes: maxDuration, 
                    company: { name: 'Practice Module' },
                    sections: [
                        {
                            id: 'sec1',
                            title: 'Practice Set',
                            questions: data.items.map((q: any) => ({
                                id: q.id,
                                questionText: q.question,
                                optionsJson: q.options,
                                correctAnswer: String(q.correctOptionIndex),
                                questionType: 'SINGLE_CORRECT',
                                marks: 1
                            }))
                        }
                    ]
                };
                
                if (cancelled) {
                    return;
                }

                setTestData(simTest);

                // Initialize response & status tracking
                const initialStatuses: Record<string, Record<string, QuestionStatus>> = {};
                const initialResponses: Record<string, Record<string, string>> = {};

                simTest.sections.forEach((sec: any) => {
                    initialStatuses[sec.id] = {};
                    initialResponses[sec.id] = {};
                    sec.questions.forEach((q: any) => {
                        initialStatuses[sec.id][q.id] = 'not_visited';
                        initialResponses[sec.id][q.id] = '';
                    });
                });
                setStatuses(initialStatuses);
                setResponses(initialResponses);
                setTimeLeftSeconds(Math.floor(simTest.totalDurationMinutes * 60));

            } catch (err) {
                console.error("Failed to load test", err);
            }
            if (!cancelled) {
                setIsLoading(false);
            }
        };
        loadTest();

        return () => {
            cancelled = true;
            stopTimer();
        };
    }, [subject, topic]);

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
        if (!isReviewMode) {
            startTimer();
        }
        if (testData?.sections?.[0]?.questions?.[0]) {
            if (!isReviewMode) updateStatus(0, 0, 'not_answered');
        }
    };

    const handleForceSubmit = () => {
        alert("Time is up! Auto-submitting your test...");
        doSubmit();
    };

    const submitTest = () => {
        if (confirm("Are you ready to submit your test?")) {
            doSubmit();
        }
    };

    const doSubmit = async () => {
        stopTimer();
        setIsLoading(true);
        
        // Generate result evaluation
        const sec1Id = testData.sections[0].id;
        let correctCount = 0;
        let incorrectCount = 0;
        let unattemptedCount = 0;

        const mappedResponses = Object.entries(responses[sec1Id]).map(([qId, val]) => {
            const question = testData.sections[0].questions.find((q: any) => q.id === qId);
            const isCorrect = val !== '' ? val === question?.correctAnswer : null;
            
            if (val === '') unattemptedCount++;
            else if (isCorrect) correctCount++;
            else incorrectCount++;

            return {
                question: { id: qId },
                responseValue: val,
                isCorrect: val === '' ? false : isCorrect
            };
        });

        const partialPayload = {
            totalScore: correctCount, // Assuming 1 mark per question
            correctAnswers: correctCount,
            incorrectAnswers: incorrectCount,
            unattemptedQuestions: unattemptedCount,
            timeTakenSeconds: (testData.totalDurationMinutes * 60) - timeLeftSeconds,
            responses: mappedResponses
        };

        // Attempt to submit to backend for the /mock-analysis page
        try {
            const token = getStoredToken('user') || getStoredToken('admin');
            if (!token) {
                throw new Error('No token');
            }
            
            // We need a specific endpoint to save Subject results. If it doesn't exist, we fallback to local review.
            // Assuming we're creating a POST /student-results/subject endpoint or using the mock-test one with a flag.
            // To be safe without throwing errors if the endpoint isn't ready yet, we'll try/catch.
            const submitResponse = await fetch(`${API_BASE_URL}/test-series/student/results/subject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    subject,
                    topic,
                    title: testData.title,
                    ...partialPayload
                })
            });

            if (submitResponse.ok) {
                const result = await submitResponse.json();
                router.push(`/dashboard/test-series/analysis/${result.id}`);
                return;
            } else {
                console.warn("Could not save to backend, falling back to local review");
            }
        } catch (e) {
            console.error("Submission failed", e);
        }

        // Fallback to local evaluation if backend fails
        setResultData({ responses: mappedResponses });
        setIsReviewMode(true);
        setIsLoading(false);
        setActiveSectionIndex(0);
        setActiveQuestionIndex(0);
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

        // Evaluate current before moving (if not reviewing)
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

    const getStatusStyle = (status: QuestionStatus, qId?: string) => {
        if (isReviewMode && resultData && qId) {
            const resp = resultData.responses?.find((r: any) => r.question.id === qId);
            if (!resp || !resp.responseValue) return 'bg-[#f1f5f9] text-slate-700 border-[#cbd5e1] rounded-md';
            if (resp.isCorrect) return 'bg-[#21b25b] text-white border-transparent rounded-md';
            if (resp.isCorrect === false) return 'bg-[#eb3a34] text-white border-transparent rounded-md';
            return 'bg-blue-500 text-white border-transparent rounded-md';
        }

        switch (status) {
            case 'answered': return 'bg-[#21b25b] text-white border-transparent rounded-t-[40%] rounded-b-md';
            case 'not_answered': return 'bg-[#eb3a34] text-white border-transparent rounded-b-[40%] rounded-t-md';
            case 'marked_review': return 'bg-[#6223b5] text-white border-transparent rounded-full';
            case 'answered_marked_review': return 'bg-[#6223b5] text-white border-transparent rounded-full';
            default: return 'bg-[#f1f5f9] text-slate-700 border-[#cbd5e1] rounded-md';
        }
    };


    if (isLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-semibold tracking-wide">Loading Practice Set...</div>;
    if (!testData) return <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">No questions inside this module.<button className="mt-4 text-slate-800 font-bold underline px-6 py-2 rounded border border-slate-200" onClick={() => router.back()}>Go Back</button></div>;

    if (!hasStarted) {
        return (
            <div className="fixed inset-0 z-50 bg-slate-100 overflow-y-auto">
                <div className="max-w-4xl mx-auto my-12 bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                    <div className="bg-slate-900 px-8 py-6 text-white text-center">
                        <h1 className="text-3xl font-black">{testData.title}</h1>
                        <p className="opacity-80 mt-2 text-lg">Practice Set • {testData.totalDurationMinutes} Minutes recommended</p>
                    </div>

                    <div className="p-10 text-slate-700 font-medium space-y-6 text-lg leading-relaxed">
                        <h3 className="text-2xl font-bold text-slate-800 border-b pb-3 mb-6">General Instructions</h3>
                        <p>1. This is a local practice set Simulator. Your score will not be uploaded to the server.</p>
                        <p>2. The Question Palette displayed on the right side of screen will show the status of each question using one of the following symbols:</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-base bg-slate-50 p-6 rounded-xl border border-slate-200">
                            <div className="flex items-center gap-3"><div className={`w-10 h-10 border flex items-center justify-center font-bold shadow-sm ${getStatusStyle('not_visited')}`}>1</div> <span className="text-slate-600">You have not visited the question yet.</span></div>
                            <div className="flex items-center gap-3"><div className={`w-10 h-10 border flex items-center justify-center font-bold shadow-sm ${getStatusStyle('not_answered')}`}>2</div> <span className="text-slate-600">You have not answered the question.</span></div>
                            <div className="flex items-center gap-3"><div className={`w-10 h-10 border flex items-center justify-center font-bold shadow-sm ${getStatusStyle('answered')}`}>3</div> <span className="text-slate-600">You have answered the question.</span></div>
                            <div className="flex items-center gap-3"><div className={`w-10 h-10 border flex items-center justify-center font-bold shadow-sm ${getStatusStyle('marked_review')}`}>4</div> <span className="text-slate-600">You have NOT answered the question, but have marked it for review.</span></div>
                            <div className="flex items-center gap-3"><div className={`w-10 h-10 border flex items-center justify-center font-bold relative shadow-sm ${getStatusStyle('answered_marked_review')}`}>5<div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" /></div> <span className="text-slate-600">The question is answered and marked for review.</span></div>
                        </div>
                    </div>

                    <div className="px-10 py-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                        <button onClick={() => router.back()} className="text-slate-500 font-semibold hover:text-slate-700 transition px-4 py-2">
                            Cancel Setup
                        </button>
                        <button
                            onClick={beginTest}
                            className="bg-slate-800 text-slate-50 px-8 py-3.5 rounded-xl font-bold text-lg hover:bg-slate-900 transition shadow-sm"
                        >
                            Begin Practice Session
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const currentResponse = activeSection && activeQuestion ? responses[activeSection.id][activeQuestion.id] : '';
    const activeResultResponse = isReviewMode && resultData ? resultData.responses?.find((r: any) => r.question.id === activeQuestion?.id) : null;

    const statusCounts = { answered: 0, not_answered: 0, not_visited: 0, marked_review: 0, answered_marked_review: 0 };
    Object.values(statuses).forEach(qMap => { Object.values(qMap).forEach(s => { statusCounts[s as keyof typeof statusCounts]++; }); });

    return (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col font-sans text-sm border-t-[6px] border-slate-800">
            <header className="h-14 bg-slate-50 border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-10 shrink-0">
                <div className="flex flex-col">
                    <span className="font-black text-slate-800 tracking-tight text-lg leading-tight">{testData.title}</span>
                </div>

                <div className="flex items-center gap-6">
                    {isReviewMode ? (
                        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold px-4 py-1.5 rounded-full">
                            <CheckCircle2 size={16} />
                            <span className="text-base tracking-widest">EVALUATION OVERVIEW</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 text-slate-900 font-bold px-4 py-1.5 rounded-full">
                            <Clock size={16} />
                            <span className="text-base tracking-widest tabular-nums">{formatTime(timeLeftSeconds)}</span>
                        </div>
                    )}
                    <button onClick={() => setShowCalculator(!showCalculator)} className={`flex items-center gap-2 px-4 py-1.5 font-bold rounded-lg ${showCalculator ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-100'}`}><Hash size={16} /> Calculator</button>
                    {isReviewMode ? (
                        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-600 hover:bg-slate-100 px-4 py-1.5 font-bold rounded-lg"><LogOut size={16} /> Exit Practice</button>
                    ) : (
                        <button onClick={submitTest} className="flex items-center gap-2 text-rose-600 hover:bg-rose-50 px-4 py-1.5 font-bold rounded-lg"><Check size={16} /> Submit Test</button>
                    )}
                </div>
            </header>

            {showCalculator && <CalculatorWidget onClose={() => setShowCalculator(false)} />}

            <div className="bg-[#E9ECEF] border-b border-[#ced4da] flex overflow-x-auto shrink-0 select-none hide-scrollbar">
                {testData.sections.map((section: any, idx: number) => {
                    const isActive = idx === activeSectionIndex;
                    return (
                        <div key={section.id} onClick={() => navigateToQuestion(idx, 0)} className={`px-8 py-2.5 cursor-pointer font-bold relative transition-colors ${isActive ? 'bg-slate-800 text-white shadow-md z-10' : 'text-[#495057] hover:bg-[#dee2e6]'}`}>
                            {section.title}
                            {isActive && <div className="absolute top-0 right-[-10px] w-0 h-0 border-t-[20px] border-b-[20px] border-l-[10px] border-l-slate-600 border-t-transparent border-b-transparent z-20" />}
                        </div>
                    );
                })}
            </div>

            <div className="flex flex-1 overflow-hidden bg-white">
                <div className="flex-1 flex flex-col relative">
                    <div className="h-10 border-b border-slate-200 bg-slate-50 flex items-center justify-between px-6 shrink-0 text-slate-600 font-bold text-xs uppercase tracking-wider">
                        <span>Question No. {activeQuestionIndex + 1}</span>
                        <span>Marks: <span className="text-emerald-600">{activeQuestion?.marks || 1}</span></span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 lg:p-12 text-base text-slate-800 leading-relaxed">
                        <div className="max-w-4xl mx-auto">
                            <div className="font-semibold text-lg mb-6 leading-relaxed text-slate-800 break-words" dangerouslySetInnerHTML={{ __html: activeQuestion?.questionText || '' }} />

                            {activeQuestion?.questionType === 'SINGLE_CORRECT' && (
                                <div className="space-y-3 pl-4 border-l-2 border-slate-200">
                                    {activeQuestion?.optionsJson?.map((opt: string, idx: number) => {
                                        const isChecked = currentResponse === String(idx);
                                        return (
                                            <label key={idx} onClick={(e) => { if (isReviewMode) { e.preventDefault(); return; } setResponse(String(idx)); }} 
                                                className={`flex items-center gap-4 cursor-pointer p-3 rounded-lg border-2 transition-all select-none ${isReviewMode ? '' : 'hover:bg-slate-50'} ${isChecked ? 'border-slate-400 bg-slate-50/30' : 'border-transparent'} ${isReviewMode ? 'pointer-events-none' : ''}`}>
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
                            
                            {isReviewMode && activeResultResponse && (
                                <div className="mt-8 pt-6 border-t border-slate-200">
                                    {activeResultResponse.isCorrect ? (
                                        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl font-bold flex items-center gap-2"><CheckCircle2 size={20}/> Correctly Answered</div>
                                    ) : (
                                        <div className="bg-rose-50 text-rose-700 p-4 rounded-xl font-bold flex items-center gap-2"><CheckCircle2 size={20}/> Incorrect Answer. The right option is green above.</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {!isReviewMode && (
                            <div className="border-t border-slate-200 bg-slate-50 h-16 shrink-0 px-6 flex items-center justify-between absolute bottom-0 left-0 right-0">
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
                        {/* Add padding buffer for fixed action bar */}
                        {!isReviewMode && <div className="h-16" />}
                    </div>
                </div>

                <div className="w-80 border-l border-slate-200 bg-slate-50 flex flex-col shrink-0 text-xs shadow-[-4px_0_15px_rgba(0,0,0,0.02)] z-10">
                    <div className="p-4 bg-[#E9ECEF] border-b border-slate-200 font-bold text-slate-700 flex items-center justify-center shrink-0">
                        Practice Session Module
                    </div>
                    <div className="p-4 bg-white grid grid-cols-2 gap-y-4 gap-x-2 border-b border-slate-200 shrink-0 text-xs font-semibold text-slate-700">
                        <div className="flex items-center gap-2.5"><div className={`w-8 h-8 flex items-center justify-center shadow-sm text-sm ${getStatusStyle('answered')}`}>{statusCounts.answered}</div> <span className="flex-1">Answered</span></div>
                        <div className="flex items-center gap-2.5"><div className={`w-8 h-8 flex items-center justify-center shadow-sm text-sm ${getStatusStyle('not_answered')}`}>{statusCounts.not_answered}</div> <span className="flex-1">Not Answered</span></div>
                        <div className="flex items-center gap-2.5"><div className={`w-8 h-8 flex items-center justify-center shadow-sm text-sm border ${getStatusStyle('not_visited')}`}>{statusCounts.not_visited}</div> <span className="flex-1">Not Visited</span></div>
                        <div className="flex items-center gap-2.5"><div className={`w-8 h-8 flex items-center justify-center shadow-sm text-sm ${getStatusStyle('marked_review')}`}>{statusCounts.marked_review}</div> <span className="flex-1">Marked Review</span></div>
                    </div>

                    <div className="bg-[#eff1f4] flex-1 overflow-y-auto px-1">
                        <div className="bg-slate-800 text-white font-bold py-1.5 px-4 sticky top-0 z-10 mb-3 shadow">
                            Choose a Question
                        </div>
                        <div className="flex flex-wrap gap-2.5 px-4 pb-8">
                            {activeSection?.questions?.map((q: any, idx: number) => {
                                const status = statuses[activeSection.id]?.[q.id] || 'not_visited';
                                return (
                                    <button
                                        key={q.id}
                                        onClick={() => navigateToQuestion(activeSectionIndex, idx)}
                                        className={`relative w-10 h-10 flex items-center justify-center font-bold text-sm shadow-sm transition-all border ${getStatusStyle(status, q.id)} ${idx === activeQuestionIndex ? 'ring-2 ring-offset-2 ring-slate-200 z-10 scale-110' : 'hover:scale-105'}`}
                                    >
                                        {idx + 1}
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
