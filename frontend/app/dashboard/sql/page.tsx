'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Panel, Group, Separator } from 'react-resizable-panels';
import { ArrowRight, Clock, RefreshCcw, Info, Sparkles, ArrowLeft, ListFilter, GraduationCap, Copy, Maximize2, Minimize2, ChevronRight, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useSectionUsage } from '@/app/hooks/useSectionUsage';
import UsageUpgradeGate from '@/app/components/shared/UsageUpgradeGate';

import ProblemDescription from '@/app/components/dsa/ProblemDescription';
import SqlSubmissionsTab from '@/app/components/sql/SqlSubmissionsTab';
import {
    fetchSqlTrainingInsight,
    fetchSqlTrainingSubmissions,
    fetchSqlTrainingTask,
    generateSqlTrainingInsight,
    submitSqlTrainingTask,
    SqlTrainingSubmission,
    SqlTrainingSubmitResult,
    SqlTrainingTask,
} from '@/app/lib/sql-training';

type SqlPlatform = 'leetcode' | 'hackerrank';

const SQL_PLATFORMS: { id: SqlPlatform; label: string; description: string }[] = [
    {
        id: 'leetcode',
        label: 'LeetCode',
        description: 'Industry-standard SQL interview problems covering window functions, joins, aggregations, and more.',
    },
    {
        id: 'hackerrank',
        label: 'HackerRank',
        description: 'Widely used in company screening rounds. Covers a broad range of SQL challenges across difficulty tiers.',
    },
];

const platformLabel = (platform?: string | null) => {
    if (platform === 'hackerrank') return 'HackerRank';
    return 'LeetCode';
};

function PlatformPicker({ onSelect }: { onSelect: (p: SqlPlatform) => void }) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 py-12">
            <div className="w-full max-w-2xl">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-extrabold text-slate-900">Choose a Platform</h1>
                    <p className="text-sm text-slate-500 mt-2">
                        Your training session will use the <span className="font-semibold text-indigo-600">adaptive SRS algorithm</span> to surface
                        questions you need to review most — regardless of platform.
                    </p>
                </div>

                <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-5 py-4 mb-8 text-xs text-indigo-800 leading-relaxed">
                    <div className="font-bold mb-1">How it works</div>
                    Write your SQL solution in the editor and submit for AI review. Your mastery score updates automatically,
                    and the algorithm schedules the next review based on how well you performed.
                    There is no Run button by design — this mirrors the real interview environment.
                    A link to the original problem is always shown so you can maintain your streak on the source platform.
                </div>

                <div className="grid gap-4">
                    {SQL_PLATFORMS.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => onSelect(p.id)}
                            className="w-full text-left bg-white border border-slate-200 rounded-xl px-5 py-4 hover:border-indigo-400 hover:shadow-sm transition-all group flex items-center justify-between gap-4"
                        >
                            <div>
                                <div className="font-bold text-slate-900 text-sm">{p.label}</div>
                                <div className="text-xs text-slate-500 mt-1 leading-relaxed">{p.description}</div>
                            </div>
                            <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-500 shrink-0 transition-colors" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

const Editor = dynamic(
    () => import('@monaco-editor/react').then((mod) => mod.Editor),
    { ssr: false, loading: () => <div className="h-full w-full flex items-center justify-center bg-slate-50 text-slate-400">Loading Editor...</div> }
);

type Theme = 'light' | 'vs-dark';
type MaximizedSection = 'description' | 'editor' | 'submissions' | 'learn' | null;

export default function SqlTrainingPage() {
    const [platform, setPlatform] = useState<SqlPlatform | null>(null);
    const [task, setTask] = useState<SqlTrainingTask | null>(null);
    const [taskMessage, setTaskMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [language, setLanguage] = useState('sql');
    const [code, setCode] = useState('');
    const [submitResult, setSubmitResult] = useState<SqlTrainingSubmitResult | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [theme, setTheme] = useState<Theme>('light');
    const [insight, setInsight] = useState<string | null>(null);
    const [insightNotice, setInsightNotice] = useState<string | null>(null);
    const [insightLoading, setInsightLoading] = useState(false);
    const [trainingSubmissions, setTrainingSubmissions] = useState<SqlTrainingSubmission[]>([]);
    const [submissionsLoading, setSubmissionsLoading] = useState(false);
    const [maximizedSection, setMaximizedSection] = useState<MaximizedSection>(null);

    const { remainingLabel, isLimited, isFreePlan } = useSectionUsage('sql');

    const problem = task?.problem;
    const canSubmit = task?.canSubmit ?? false;

    const resolveTemplate = (source: any, lang: string) => {
        if (!source) return '-- Write your SQL query here';
        const templates = source.codeTemplates || {};
        const starters = source.starterCode || {};
        const direct = templates[lang] || starters[lang];
        if (direct) return direct;
        const fallbackKey = Object.keys(templates)[0] || Object.keys(starters)[0];
        if (fallbackKey) {
            return templates[fallbackKey] || starters[fallbackKey] || '-- Write your SQL query here';
        }
        return '-- Write your SQL query here';
    };

    const normalizedProblem = useMemo(() => {
        if (!problem) return null;
        const difficultyRaw = String(problem.difficulty || '').toLowerCase();
        const difficulty = difficultyRaw
            ? `${difficultyRaw.charAt(0).toUpperCase()}${difficultyRaw.slice(1)}`
            : 'Easy';
        const fallbackLangs = Object.keys(problem.codeTemplates || problem.starterCode || {});
        const languageMeta = problem.languageMeta?.length
            ? problem.languageMeta
            : fallbackLangs.map((langSlug: string) => ({
                lang: langSlug.toUpperCase(),
                langSlug,
            }));

        const normalizedLanguageMeta = languageMeta.map((meta: any) => ({
            ...meta,
            langSlug: String(meta.langSlug || '').toLowerCase().includes('sql') ? 'sql' : meta.langSlug,
            lang: meta.lang || 'SQL',
        }));
        const uniqueLanguageMeta = normalizedLanguageMeta.reduce((acc: any[], item: any) => {
            if (!acc.some((entry) => entry.langSlug === item.langSlug)) {
                acc.push(item);
            }
            return acc;
        }, []);

        return {
            ...problem,
            difficulty,
            languageMeta: uniqueLanguageMeta.length ? uniqueLanguageMeta : [{ lang: 'SQL', langSlug: 'sql' }],
            examples: problem.examples || [],
            constraints: problem.constraints || [],
        };
    }, [problem]);

    // Read platform from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('sql_platform') as SqlPlatform | null;
        if (stored && ['leetcode', 'hackerrank'].includes(stored)) {
            setPlatform(stored);
        }
    }, []);

    const handleSelectPlatform = (p: SqlPlatform) => {
        localStorage.setItem('sql_platform', p);
        setPlatform(p);
    };

    const handleChangePlatform = () => {
        localStorage.removeItem('sql_platform');
        setTask(null);
        setTaskMessage(null);
        setPlatform(null);
    };

    const loadTask = async (selectedPlatform?: SqlPlatform) => {
        const p = selectedPlatform ?? platform;
        if (!p) return;
        setSubmitResult(null);
        try {
            setLoading(true);
            const { getActiveToken } = await import('@/app/lib/auth-storage');
            const token = getActiveToken() || '';
            const data = await fetchSqlTrainingTask(token, p);
            if ('message' in data) {
                setTaskMessage(data.message);
                setTask(null);
                return;
            }
            setTask(data);
            setTaskMessage(null);
            setInsight(null);
            setInsightNotice(null);
            const languageMeta = data.problem?.languageMeta || [];
            const fallbackLangs = Object.keys(data.problem?.codeTemplates || data.problem?.starterCode || {});
            const firstLang = String(languageMeta?.[0]?.langSlug || fallbackLangs?.[0] || 'sql');
            const normalizedLang = firstLang.toLowerCase().includes('sql') ? 'sql' : firstLang;
            setLanguage(normalizedLang);
            const template = resolveTemplate(data.problem, normalizedLang);
            setCode(template);
        } catch (error) {
            setTaskMessage('Failed to load SQL training task.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (platform) loadTask(platform);
    }, [platform]);

    useEffect(() => {
        if (!problem) return;
        loadTrainingSubmissions(problem.id);
    }, [problem?.id]);

    useEffect(() => {
        setSubmitResult(null);
        if (!problem) return;
        const saved = localStorage.getItem(`sql_training_${problem.id}_${language}`);
        const template = resolveTemplate(problem, language);
        setCode(saved || template);
    }, [problem?.id, language]);

    useEffect(() => {
        if (!problem) return;
        if (!code) return;
        const handle = setTimeout(() => {
            localStorage.setItem(`sql_training_${problem.id}_${language}`, code);
        }, 600);
        return () => clearTimeout(handle);
    }, [code, problem?.id, language]);

    useEffect(() => {
        if (!problem) return;
        handleLoadInsight();
    }, [problem?.id]);

    const handleSubmit = async () => {
        if (!task?.sessionId || !problem || !canSubmit || isSubmitting) return;
        try {
            setIsSubmitting(true);
            const { getActiveToken } = await import('@/app/lib/auth-storage');
            const token = getActiveToken() || '';
            const result = await submitSqlTrainingTask(token, {
                sessionId: task.sessionId,
                code,
                language,
            });
            if ('message' in result) {
                setTaskMessage(result.message);
                return;
            }
            setSubmitResult(result);
            setTask({ ...task, canSubmit: false, mastery: result.mastery, nextReviewAt: result.nextReviewAt });
            await loadTrainingSubmissions(problem.id);
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
            const { getActiveToken } = await import('@/app/lib/auth-storage');
            const token = getActiveToken() || '';
            const data = await fetchSqlTrainingInsight(token, problem.id);
            if (data?.content) {
                setInsight(data.content);
                setInsightNotice(null);
            } else if (data?.message) {
                setInsight(null);
                setInsightNotice(data.message);
            } else {
                setInsight(null);
                setInsightNotice('No insight available.');
            }
        } catch (error) {
            setInsight(null);
            setInsightNotice('Failed to load insight.');
        } finally {
            setInsightLoading(false);
        }
    };

    const handleGenerateInsight = async () => {
        if (!problem) return;
        try {
            setInsightLoading(true);
            const { getActiveToken } = await import('@/app/lib/auth-storage');
            const token = getActiveToken() || '';
            const data = await generateSqlTrainingInsight(token, problem.id);
            if (data?.content) {
                setInsight(data.content);
                setInsightNotice(null);
            } else {
                setInsight(null);
                setInsightNotice('Insight generated but no content returned.');
            }
        } catch (error) {
            setInsight(null);
            setInsightNotice('Failed to generate insight.');
        } finally {
            setInsightLoading(false);
        }
    };

    const loadTrainingSubmissions = async (problemId?: string) => {
        try {
            setSubmissionsLoading(true);
            const { getActiveToken } = await import('@/app/lib/auth-storage');
            const token = getActiveToken() || '';
            const data = await fetchSqlTrainingSubmissions(token, problemId);
            setTrainingSubmissions(data || []);
        } catch (error) {
            setTrainingSubmissions([]);
        } finally {
            setSubmissionsLoading(false);
        }
    };

    const toggleMaximize = (section: MaximizedSection) => {
        setMaximizedSection((current) => (current === section ? null : section));
    };

    const metadata = useMemo(() => {
        if (!task) return null;
        return {
            mastery: task.mastery ?? 0,
            nextReviewAt: task.nextReviewAt,
        };
    }, [task]);

    if (!platform) {
        return <PlatformPicker onSelect={handleSelectPlatform} />;
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading SQL training task...</div>;
    }

    if (!task || !problem) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center p-6 gap-4">
                <div className="text-2xl font-bold text-slate-800">No task due</div>
                <div className="text-sm text-slate-500">{taskMessage || 'You are all caught up for now.'}</div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleChangePlatform}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                        <X size={16} /> Change Platform
                    </button>
                    <button
                        onClick={() => loadTask()}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                        <RefreshCcw size={16} /> Refresh
                    </button>
                    <Link
                        href="/dashboard/sql/all"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
                    >
                        <ListFilter size={16} /> Browse All Questions
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-6rem)] w-full bg-slate-50 flex flex-col font-sans overflow-hidden">
            <div className="h-12 shrink-0 flex items-center justify-between px-4 border-b border-slate-200 bg-white shadow-sm z-20">
                <div className="flex items-center gap-3 text-sm text-slate-500">
                    <Link href="/dashboard" className="flex items-center hover:text-indigo-600 transition-colors">
                        <ArrowLeft size={16} /> <span className="ml-1">Dashboard</span>
                    </Link>
                    <span className="text-slate-300">/</span>
                    <span className="font-bold text-slate-700">SQL Training</span>
                    {task?.mode === 'manual' && (
                        <span className="ml-2 text-[10px] font-bold uppercase bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Manual</span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleChangePlatform}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
                    >
                        <X size={11} /> {platformLabel(platform)}
                    </button>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                        <Sparkles size={12} /> Mastery {metadata?.mastery ?? 0}
                    </div>
                    {isFreePlan && (
                        <div className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full ${isLimited ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            <Clock size={12} /> {remainingLabel} left
                        </div>
                    )}
                    {metadata?.nextReviewAt && (
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                            <Clock size={12} /> Next review {new Date(metadata.nextReviewAt).toLocaleDateString()}
                        </div>
                    )}
                    <Link
                        href="/dashboard/sql/all"
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-indigo-600 border border-indigo-200 rounded-full hover:bg-indigo-50"
                    >
                        <ListFilter size={12} /> All Questions
                    </Link>
                </div>
            </div>

            <div className="flex-1 w-full overflow-hidden relative">
                {isLimited && (
                    <UsageUpgradeGate
                        message="Upgrade to continue your SQL practice."
                    />
                )}
                <Group orientation="horizontal" className="flex h-full w-full">
                    {(maximizedSection === null || maximizedSection === 'description') && (
                        <Panel
                            defaultSize={maximizedSection === 'description' ? 100 : 45}
                            minSize={maximizedSection === 'description' ? 100 : 25}
                            className="bg-white flex flex-col h-full border-r border-slate-200"
                        >
                            <div className="h-10 border-b border-slate-200 bg-slate-50 flex items-center px-4 gap-6 shrink-0">
                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <Info size={14} /> Description
                                </div>
                                <button
                                    onClick={() => toggleMaximize('description')}
                                    className="ml-auto inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
                                >
                                    {maximizedSection === 'description' ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                                    {maximizedSection === 'description' ? 'Restore' : 'Maximize'}
                                </button>
                            </div>

                            <div className="flex-1 overflow-hidden relative">
                                <div className="h-full overflow-y-auto custom-scrollbar">
                                    {normalizedProblem ? (
                                        <ProblemDescription problem={normalizedProblem} />
                                    ) : null}
                                </div>
                            </div>
                        </Panel>
                    )}

                    {maximizedSection === null && (
                        <Separator className="w-1.5 bg-slate-100 hover:bg-indigo-400 transition-colors cursor-col-resize flex items-center justify-center group z-10" />
                    )}

                    {(maximizedSection === null || maximizedSection === 'editor' || maximizedSection === 'submissions' || maximizedSection === 'learn') && (
                        <Panel
                            defaultSize={maximizedSection ? 100 : 55}
                            minSize={maximizedSection ? 100 : 30}
                            className="h-full flex flex-col"
                        >
                            <Group orientation="vertical" className="flex flex-col h-full w-full">
                                {(maximizedSection === null || maximizedSection === 'editor') && (
                                    <Panel
                                        defaultSize={maximizedSection === 'editor' ? 100 : 55}
                                        minSize={maximizedSection === 'editor' ? 100 : 20}
                                        className="flex flex-col bg-white h-full border-b border-slate-200"
                                    >
                                        <div className="h-10 border-b border-slate-200 bg-slate-50 flex items-center justify-between px-3 shrink-0">
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                                SQL Editor
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => toggleMaximize('editor')}
                                                    className="inline-flex items-center gap-2 text-[11px] font-semibold text-slate-500 hover:text-slate-700"
                                                >
                                                    {maximizedSection === 'editor' ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
                                                    {maximizedSection === 'editor' ? 'Restore' : 'Maximize'}
                                                </button>
                                                {(problem?.externalUrl || problem?.leetcodeUrl) && (
                                                     <a
                                                         href={problem.externalUrl || problem.leetcodeUrl}
                                                         target="_blank"
                                                         rel="noreferrer"
                                                         className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                                                     >
                                                         Solve on {platformLabel(problem.platform || platform)} <span className="material-symbols-outlined text-sm">open_in_new</span>
                                                     </a>
                                                 )}
                                                <select
                                                    value={language}
                                                    onChange={(e) => setLanguage(e.target.value)}
                                                    className="bg-white border border-slate-200 text-xs font-medium text-slate-700 rounded-md px-2 py-1 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 shadow-sm"
                                                >
                                                    {(normalizedProblem?.languageMeta || [
                                                        { lang: 'SQL', langSlug: 'sql' },
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
                                                language="sql"
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
                                )}

                                {maximizedSection === null && (
                                    <Separator className="h-1.5 bg-slate-100 hover:bg-indigo-400 transition-colors cursor-row-resize flex items-center justify-center group z-10" />
                                )}

                                {(maximizedSection === null || maximizedSection === 'submissions' || maximizedSection === 'learn') && (
                                    <Panel
                                        defaultSize={maximizedSection === 'submissions' || maximizedSection === 'learn' ? 100 : 45}
                                        minSize={maximizedSection === 'submissions' || maximizedSection === 'learn' ? 100 : 25}
                                        className="bg-white flex flex-col h-full"
                                    >
                                        <Group orientation="horizontal" className="flex h-full w-full">
                                            {(maximizedSection === null || maximizedSection === 'submissions') && (
                                                <Panel
                                                    defaultSize={maximizedSection === 'submissions' ? 100 : 55}
                                                    minSize={maximizedSection === 'submissions' ? 100 : 30}
                                                    className="bg-white flex flex-col h-full border-r border-slate-200"
                                                >
                                                    <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                                                            Submissions
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={handleSubmit}
                                                                disabled={!canSubmit || isSubmitting}
                                                                className="inline-flex items-center gap-2 px-3 py-1.5 text-[11px] font-semibold text-white bg-emerald-600 rounded-md hover:bg-emerald-700 disabled:opacity-50"
                                                            >
                                                                {isSubmitting ? 'Submitting...' : canSubmit ? 'Submit for Review' : 'Locked'}
                                                            </button>
                                                            <button
                                                                onClick={() => toggleMaximize('submissions')}
                                                                className="inline-flex items-center gap-2 text-[11px] font-semibold text-slate-500 hover:text-slate-700"
                                                            >
                                                                {maximizedSection === 'submissions' ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
                                                                {maximizedSection === 'submissions' ? 'Restore' : 'Maximize'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="border-b border-slate-200 bg-white px-4 py-2 text-[11px] text-slate-500">
                                                        {canSubmit
                                                            ? 'You can submit one solution this review window.'
                                                            : metadata?.nextReviewAt
                                                                ? `Locked until ${new Date(metadata.nextReviewAt).toLocaleDateString()}`
                                                                : 'Submission locked.'}
                                                    </div>
                                                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50">
                                                        <SqlSubmissionsTab submissions={trainingSubmissions} loading={submissionsLoading} />
                                                    </div>
                                                </Panel>
                                            )}

                                            {maximizedSection === null && (
                                                <Separator className="w-1.5 bg-slate-100 hover:bg-indigo-400 transition-colors cursor-col-resize flex items-center justify-center group z-10" />
                                            )}

                                            {(maximizedSection === null || maximizedSection === 'learn') && (
                                                <Panel
                                                    defaultSize={maximizedSection === 'learn' ? 100 : 45}
                                                    minSize={maximizedSection === 'learn' ? 100 : 25}
                                                    className="bg-white flex flex-col h-full"
                                                >
                                                    <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                                                            <Sparkles size={14} /> Learn
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => toggleMaximize('learn')}
                                                                className="inline-flex items-center gap-2 text-[11px] font-semibold text-slate-500 hover:text-slate-700"
                                                            >
                                                                {maximizedSection === 'learn' ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
                                                                {maximizedSection === 'learn' ? 'Restore' : 'Maximize'}
                                                            </button>
                                                            {!!insight?.trim() && (
                                                                <button
                                                                    onClick={() => navigator.clipboard.writeText(insight || '')}
                                                                    className="inline-flex items-center gap-2 px-3 py-1.5 text-[11px] font-semibold text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50"
                                                                >
                                                                    <Copy size={12} /> Copy
                                                                </button>
                                                            )}
                                                            {!insight?.trim() && !insightLoading && (
                                                                <button
                                                                    onClick={handleGenerateInsight}
                                                                    className="inline-flex items-center gap-2 px-3 py-1.5 text-[11px] font-semibold text-indigo-600 border border-indigo-200 rounded-md hover:bg-indigo-50"
                                                                >
                                                                    <GraduationCap size={12} /> Generate Insight
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
                                                        {insightLoading ? (
                                                            <div className="text-sm text-slate-500">Loading insight...</div>
                                                        ) : insight ? (
                                                            <div className="prose prose-slate max-w-none text-sm whitespace-pre-wrap break-words">
                                                                <ReactMarkdown>{insight}</ReactMarkdown>
                                                            </div>
                                                        ) : (
                                                            <div className="text-sm text-slate-500">
                                                                {insightNotice || 'No insight available yet. Click Generate Insight to create one.'}
                                                            </div>
                                                        )}
                                                    </div>
                                                </Panel>
                                            )}
                                        </Group>
                                    </Panel>
                                )}
                            </Group>
                        </Panel>
                    )}
                </Group>
            </div>

            {submitResult && (
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
                    </div>
                </div>
            )}
        </div>
    );
}
