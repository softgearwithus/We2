'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Panel, Group, Separator } from 'react-resizable-panels';
import { CheckCircle2, ArrowRight, Clock, RefreshCcw, Info, Sparkles, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import ProblemDescription from '@/app/components/dsa/ProblemDescription';
import Console from '@/app/components/dsa/Console';
import SubmissionsTab from '@/app/components/dsa/SubmissionsTab';
import AIAssistant from '@/app/components/dsa/AIAssistant';
import { fetchTrainingInsight, fetchTrainingTask, submitTrainingTask, TrainingSubmitResult, TrainingTask } from '@/app/lib/dsa-training';

const Editor = dynamic(
    () => import('@monaco-editor/react').then((mod) => mod.Editor),
    { ssr: false, loading: () => <div className="h-full w-full flex items-center justify-center bg-slate-50 text-slate-400">Loading Editor...</div> }
);

type Tab = 'description' | 'submissions' | 'learn';
type RightTab = 'console' | 'ai_assist';
type Theme = 'light' | 'vs-dark';

export default function DsaTrainingPage() {
    const [task, setTask] = useState<TrainingTask | null>(null);
    const [taskMessage, setTaskMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [language, setLanguage] = useState('cpp');
    const [code, setCode] = useState('');
    const [leftTab, setLeftTab] = useState<Tab>('description');
    const [rightBottomTab, setRightBottomTab] = useState<RightTab>('console');
    const [submitResult, setSubmitResult] = useState<TrainingSubmitResult | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [theme, setTheme] = useState<Theme>('light');
    const [insight, setInsight] = useState<string | null>(null);
    const [insightLoading, setInsightLoading] = useState(false);
    const [showSubmitToast, setShowSubmitToast] = useState(true);

    const problem = task?.problem;
    const canSubmit = task?.canSubmit ?? false;

    const normalizedProblem = useMemo(() => {
        if (!problem) return null;
        const difficultyRaw = String(problem.difficulty || '').toLowerCase();
        const difficulty = difficultyRaw
            ? `${difficultyRaw.charAt(0).toUpperCase()}${difficultyRaw.slice(1)}`
            : 'Easy';
        const languageLabelMap: Record<string, string> = {
            cpp: 'C++',
            java: 'Java',
            python: 'Python',
            javascript: 'JavaScript',
            typescript: 'TypeScript',
            csharp: 'C#',
            go: 'Go',
            rust: 'Rust',
            kotlin: 'Kotlin',
            swift: 'Swift',
            ruby: 'Ruby',
            php: 'PHP',
        };

        const fallbackLangs = Object.keys(problem.codeTemplates || problem.starterCode || {});
        const languageMeta = problem.languageMeta?.length
            ? problem.languageMeta
            : fallbackLangs.map((langSlug: string) => ({
                lang: languageLabelMap[langSlug] || langSlug,
                langSlug,
            }));

        return {
            ...problem,
            difficulty,
            languageMeta,
            examples: problem.examples || [],
            constraints: problem.constraints || [],
        };
    }, [problem]);

    const loadTask = async () => {
        setSubmitResult(null);
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken') || '';
            const data = await fetchTrainingTask(token);
            if ('message' in data) {
                setTaskMessage(data.message);
                setTask(null);
                return;
            }
            setTask(data);
            setTaskMessage(null);
            setInsight(null);
            setShowSubmitToast(true);
            const languageMeta = data.problem?.languageMeta || [];
            const fallbackLangs = Object.keys(data.problem?.codeTemplates || data.problem?.starterCode || {});
            const firstLang = languageMeta?.[0]?.langSlug || fallbackLangs?.[0] || 'cpp';
            setLanguage(firstLang);
            const template = data.problem?.codeTemplates?.[firstLang]
                || data.problem?.starterCode?.[firstLang]
                || '';
            setCode(template);
        } catch (error) {
            setTaskMessage('Failed to load training task.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTask();
    }, []);

    useEffect(() => {
        setSubmitResult(null);
        if (!problem) return;
        const saved = localStorage.getItem(`dsa_training_${problem.id}_${language}`);
        const template = problem.codeTemplates?.[language] || problem.starterCode?.[language] || '';
        setCode(saved || template);
    }, [problem?.id, language]);

    useEffect(() => {
        if (!problem) return;
        if (!code) return;
        const handle = setTimeout(() => {
            localStorage.setItem(`dsa_training_${problem.id}_${language}`, code);
        }, 600);
        return () => clearTimeout(handle);
    }, [code, problem?.id, language]);


    const handleSubmit = async () => {
        if (!task?.sessionId || !problem || !canSubmit || isSubmitting) return;
        try {
            setIsSubmitting(true);
            const token = localStorage.getItem('accessToken') || '';
            const result = await submitTrainingTask(token, {
                sessionId: task.sessionId,
                code,
                language,
            });
            if ('message' in result) {
                setTaskMessage(result.message);
                return;
            }
            setSubmitResult(result);
            setShowSubmitToast(true);
            setTask({ ...task, canSubmit: false, mastery: result.mastery, nextReviewAt: result.nextReviewAt });
            setRightBottomTab('console');
        } catch (error) {
            setTaskMessage('Failed to submit solution.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLoadInsight = async () => {
        if (!problem) return;
        try {
            setInsightLoading(true);
            const token = localStorage.getItem('accessToken') || '';
            const data = await fetchTrainingInsight(token, problem.id);
            if (data?.content) {
                setInsight(data.content);
            } else if (data?.message) {
                setInsight(data.message);
            } else {
                setInsight('No insight available.');
            }
        } catch (error) {
            setInsight('Failed to load insight.');
        } finally {
            setInsightLoading(false);
        }
    };

    const metadata = useMemo(() => {
        if (!task) return null;
        return {
            mastery: task.mastery ?? 0,
            nextReviewAt: task.nextReviewAt,
        };
    }, [task]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading training task...</div>;
    }

    if (!task || !problem) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center p-6 gap-4">
                <div className="text-2xl font-bold text-slate-800">No task due</div>
                <div className="text-sm text-slate-500">{taskMessage || 'You are all caught up for now.'}</div>
                <button
                    onClick={loadTask}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                    <RefreshCcw size={16} /> Refresh
                </button>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-6rem)] w-full bg-slate-50 flex flex-col font-sans overflow-hidden">
            {/* Top Bar */}
            <div className="h-12 shrink-0 flex items-center justify-between px-4 border-b border-slate-200 bg-white shadow-sm z-20">
                <div className="flex items-center gap-3 text-sm text-slate-500">
                    <Link href="/dashboard" className="flex items-center hover:text-indigo-600 transition-colors">
                        <ArrowLeft size={16} /> <span className="ml-1">Dashboard</span>
                    </Link>
                    <span className="text-slate-300">/</span>
                    <span className="font-bold text-slate-700">DSA Training</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                        <Sparkles size={12} /> Mastery {metadata?.mastery ?? 0}
                    </div>
                    {metadata?.nextReviewAt && (
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                            <Clock size={12} /> Next review {new Date(metadata.nextReviewAt).toLocaleDateString()}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 w-full overflow-hidden relative">
                <Group orientation="horizontal" className="flex h-full w-full">
                    {/* LEFT PANEL */}
                    <Panel defaultSize={40} minSize={25} className="bg-white flex flex-col h-full border-r border-slate-200">
                        <div className="h-10 border-b border-slate-200 bg-slate-50 flex items-center px-4 gap-6 shrink-0">
                            <button
                                onClick={() => setLeftTab('description')}
                                className={`flex items-center gap-2 text-sm font-medium h-full border-b-2 transition-all px-1 ${leftTab === 'description'
                                    ? 'text-indigo-600 border-indigo-600'
                                    : 'text-slate-500 border-transparent hover:text-slate-700'
                                    }`}
                            >
                                <Info size={14} /> Description
                            </button>
                            <button
                                onClick={() => setLeftTab('submissions')}
                                className={`flex items-center gap-2 text-sm font-medium h-full border-b-2 transition-all px-1 ${leftTab === 'submissions'
                                    ? 'text-indigo-600 border-indigo-600'
                                    : 'text-slate-500 border-transparent hover:text-slate-700'
                                    }`}
                            >
                                <CheckCircle2 size={14} /> Submissions
                            </button>
                            <button
                                onClick={() => {
                                    setLeftTab('learn');
                                    if (!insight && !insightLoading) {
                                        handleLoadInsight();
                                    }
                                }}
                                className={`flex items-center gap-2 text-sm font-medium h-full border-b-2 transition-all px-1 ${leftTab === 'learn'
                                    ? 'text-indigo-600 border-indigo-600'
                                    : 'text-slate-500 border-transparent hover:text-slate-700'
                                    }`}
                            >
                                <Sparkles size={14} /> Learn
                            </button>
                        </div>

                        <div className="flex-1 overflow-hidden relative">
                            {leftTab === 'description' ? (
                                <div className="h-full overflow-y-auto custom-scrollbar">
                                    {normalizedProblem ? (
                                        <ProblemDescription problem={normalizedProblem} />
                                    ) : null}
                                </div>
                            ) : leftTab === 'learn' ? (
                                <div className="h-full overflow-y-auto custom-scrollbar p-6 bg-white">
                                    {insightLoading ? (
                                        <div className="text-sm text-slate-500">Loading insight...</div>
                                    ) : (
                                        <div className="prose prose-slate max-w-none text-sm">
                                            <ReactMarkdown>{insight || 'No insight available.'}</ReactMarkdown>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-full overflow-y-auto custom-scrollbar p-0 bg-slate-50">
                                    <SubmissionsTab />
                                </div>
                            )}
                        </div>
                    </Panel>

                    <Separator className="w-1.5 bg-slate-100 hover:bg-indigo-400 transition-colors cursor-col-resize flex items-center justify-center group z-10" />

                    {/* RIGHT PANEL */}
                    <Panel defaultSize={60} minSize={30} className="h-full flex flex-col">
                        <Group orientation="vertical" className="flex flex-col h-full w-full">
                            <Panel defaultSize={65} minSize={20} className="flex flex-col bg-white h-full border-b border-slate-200">
                                <div className="h-10 border-b border-slate-200 bg-slate-50 flex items-center justify-between px-3 shrink-0">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                        Training Editor
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={language}
                                            onChange={(e) => setLanguage(e.target.value)}
                                            className="bg-white border border-slate-200 text-xs font-medium text-slate-700 rounded-md px-2 py-1 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 shadow-sm"
                                        >
                                            {(normalizedProblem?.languageMeta || [
                                                { lang: 'C++', langSlug: 'cpp' },
                                                { lang: 'Java', langSlug: 'java' },
                                                { lang: 'Python', langSlug: 'python' },
                                                { lang: 'JavaScript', langSlug: 'javascript' },
                                            ]).map((lang: any) => (
                                                <option key={lang.langSlug} value={lang.langSlug}>{lang.lang}</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={() => setTheme(theme === 'light' ? 'vs-dark' : 'light')}
                                            className="px-2 py-1 text-xs rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100"
                                        >
                                            {theme === 'light' ? 'Dark' : 'Light'}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-hidden relative flex flex-col">
                                    <Editor
                                        height="100%"
                                        language={language}
                                        value={code}
                                        onChange={(value) => setCode(value || '')}
                                        theme={theme}
                                        options={{
                                            minimap: { enabled: false },
                                            fontSize: 14,
                                            lineNumbers: 'on',
                                            scrollBeyondLastLine: false,
                                            automaticLayout: true,
                                            padding: { top: 16, bottom: 16 },
                                            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                            fontLigatures: true,
                                            cursorBlinking: 'smooth',
                                            smoothScrolling: true,
                                            renderLineHighlight: 'all',
                                        }}
                                    />
                                </div>
                            </Panel>

                            <Separator className="h-1.5 bg-slate-100 hover:bg-indigo-400 transition-colors cursor-row-resize flex items-center justify-center group z-10" />

                            <Panel defaultSize={35} minSize={10} className="bg-white flex flex-col h-full">
                                <div className="h-9 border-b border-slate-200 bg-slate-50 flex items-center px-4 gap-6 shrink-0">
                                    <button
                                        onClick={() => setRightBottomTab('console')}
                                        className={`flex items-center gap-2 text-xs font-bold h-full border-b-2 transition-all px-1 ${rightBottomTab === 'console'
                                            ? 'text-indigo-600 border-indigo-600'
                                            : 'text-slate-500 border-transparent hover:text-slate-700'
                                            }`}
                                    >
                                        Console
                                    </button>
                                    <button
                                        onClick={() => setRightBottomTab('ai_assist')}
                                        className={`flex items-center gap-2 text-xs font-bold h-full border-b-2 transition-all px-1 ${rightBottomTab === 'ai_assist'
                                            ? 'text-indigo-600 border-indigo-600'
                                            : 'text-slate-500 border-transparent hover:text-slate-700'
                                            }`}
                                    >
                                        AI Assist
                                    </button>
                                </div>

                                <div className="flex-1 overflow-hidden bg-white relative flex flex-col">
                                    {rightBottomTab === 'ai_assist' ? (
                                        <AIAssistant />
                                    ) : (
                                        <Console
                                            onRun={() => {}}
                                            onSubmit={handleSubmit}
                                            isRunning={false}
                                            isSubmitting={isSubmitting}
                                            runDisabled
                                            submitDisabled={!canSubmit}
                                            submitLabel={canSubmit ? 'Submit for Review' : 'Locked'}
                                            result={submitResult ? {
                                                status: submitResult.status === 'accepted' ? 'Accepted' : 'Wrong Answer',
                                                totalTests: 0,
                                                passedTests: 0,
                                                runtime: '-',
                                                memory: '-',
                                                error: submitResult.summary || undefined,
                                            } : null}
                                        />
                                    )}
                                </div>

                                <div className="h-8 border-t border-slate-200 bg-slate-50 flex items-center justify-between px-3 text-[10px] text-slate-500 shrink-0">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${canSubmit ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                        <span>{canSubmit ? 'Submission Available' : 'Submission Locked'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span>{language}</span>
                                        <span>UTF-8</span>
                                    </div>
                                </div>
                            </Panel>
                        </Group>
                    </Panel>
                </Group>
            </div>

            {submitResult && showSubmitToast && (
                <div className="border-t border-slate-200 bg-white px-4 py-3 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                        <div className={`px-2 py-1 rounded-full text-xs font-bold ${submitResult.status === 'accepted' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                            {submitResult.status === 'accepted' ? 'Accepted' : 'Needs Review'}
                        </div>
                        <div className="text-slate-600">Score {submitResult.score}</div>
                        <div className="text-slate-500">{submitResult.summary}</div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={loadTask}
                            className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                        >
                            Next Task <ArrowRight size={14} />
                        </button>
                        <button
                            onClick={() => setShowSubmitToast(false)}
                            className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
