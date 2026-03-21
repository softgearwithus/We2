'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { Panel, Group, Separator } from 'react-resizable-panels';
import { motion, AnimatePresence } from 'framer-motion';

// Dynamically import initVimMode to avoid SSR issues
import { initVimMode } from 'monaco-vim';

import { fetchProblemBySlug, Problem } from '@/app/lib/problems';
import { executeCode, ExecutionResult } from '@/app/lib/executor';
import ProblemDescription from '@/app/components/dsa/ProblemDescription';
import Console from '@/app/components/dsa/Console';
import {
    Settings, Maximize2, RotateCcw, ArrowLeft,
    Code2, FileText, Terminal, Play, Save, CheckCircle2, History,
    Moon, Sun, ZoomIn, ZoomOut, AlertCircle, Check, Map as MapIcon, Hash, Keyboard,
    Plus, X, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import SubmissionsTab from '@/app/components/dsa/SubmissionsTab';
import AIAssistant from '@/app/components/dsa/AIAssistant';

const Editor = dynamic(
    () => import('@monaco-editor/react').then((mod) => mod.Editor),
    { ssr: false, loading: () => <div className="h-full w-full flex items-center justify-center bg-slate-50 text-slate-400">Loading Editor...</div> }
);

type Tab = 'description' | 'submissions' | 'solution';
type RightTab = 'console' | 'testcases' | 'ai_assist';
type Theme = 'light' | 'vs-dark';

type TestCase = {
    id: string;
    input: string;
    expected: string;
    status?: 'Pending' | 'Passed' | 'Failed';
    actual?: string;
};

export default function DsaProblemPage() {
    const params = useParams();
    const router = useRouter();
    const problemId = params?.id as string;

    // State
    const [problem, setProblem] = useState<Problem | null>(null);
    const [language, setLanguage] = useState('cpp');
    const [code, setCode] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [result, setResult] = useState<ExecutionResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');

    // Test Cases State
    const [testCases, setTestCases] = useState<TestCase[]>([]);

    // Editor Settings
    const [fontSize, setFontSize] = useState(14);
    const [theme, setTheme] = useState<Theme>('light');
    const [showMinimap, setShowMinimap] = useState(false);
    const [showLineNumbers, setShowLineNumbers] = useState(true);
    const [vimModeEnabled, setVimModeEnabled] = useState(false);

    // Refs for VIM Mode
    const editorRef = useRef<any>(null);
    const vimModeRef = useRef<any>(null);
    const vimStatusRef = useRef<HTMLDivElement>(null);

    // Tabs State
    const [leftTab, setLeftTab] = useState<Tab>('description');
    const [rightBottomTab, setRightBottomTab] = useState<RightTab>('testcases');

    // Load problem data on mount or ID change
    useEffect(() => {
        if (problemId) {
            const loadProblem = async () => {
                setLoading(true);
                const foundProblem = await fetchProblemBySlug(problemId);
                if (foundProblem) {
                    setProblem(foundProblem);
                    const savedCode = localStorage.getItem(`dsa_code_${problemId}_${language}`);
                    const template = foundProblem.codeTemplates?.[language] || foundProblem.starterCode[language] || '';
                    setCode(savedCode || template);

                    // Initialize Test Cases
                    setTestCases(foundProblem.testCases.map((tc, i) => ({
                        id: `default-${i}`,
                        input: tc.input,
                        expected: tc.expected,
                        status: 'Pending'
                    })));
                } else {
                    setProblem(null);
                }
                setLoading(false);
            };
            loadProblem();
        }
    }, [problemId, language]);

    // Handle VIM Mode
    useEffect(() => {
        if (!editorRef.current || !vimStatusRef.current) return;

        if (vimModeEnabled) {
            if (!vimModeRef.current) {
                // Initialize VIM mode
                const vim = initVimMode(editorRef.current, vimStatusRef.current);
                vimModeRef.current = vim;
            }
        } else {
            if (vimModeRef.current) {
                vimModeRef.current.dispose();
                vimModeRef.current = null;
            }
        }

        return () => {
            if (vimModeRef.current) {
                vimModeRef.current.dispose();
                vimModeRef.current = null;
            }
        };
    }, [vimModeEnabled]);

    const handleRun = async () => {
        setIsRunning(true);
        setResult(null);
        setRightBottomTab('console'); // Switch to console on run

        // Reset statuses
        setTestCases(prev => prev.map(tc => ({ ...tc, status: 'Pending', actual: undefined })));

        // Combine default and custom test cases for execution
        // Note: Problem.testCases expectation matches our simplified objects
        const combinedTestCases = testCases.map(tc => ({
            input: tc.input,
            expected: tc.expected
        }));

        // Execute Code against ALL cases
        const { getActiveToken } = await import('@/app/lib/auth-storage');
        const token = getActiveToken() || '';

        // Ensure problem is loaded before executing
        if (!problem) {
            setIsRunning(false);
            return;
        }

        // Pass UUID instead of ID (slug)
        const res = await executeCode(problem.uuid, code, language, token);
        // Update Test Case Statuses based on Execution Result
        // We rely on res.passedTests to know how many passed
        setTestCases(prev => prev.map((tc, index) => {
            if (index < res.passedTests) {
                return { ...tc, status: 'Passed' };
            } else if (index === res.passedTests && res.status !== 'Accepted') {
                return {
                    ...tc,
                    status: 'Failed',
                    actual: res.failedCase?.actual
                };
            }
            return tc;
        }));

        setResult(res);
        setIsRunning(false);
    };

    const handleAddTestCase = () => {
        setTestCases([
            ...testCases,
            {
                id: `custom-${Date.now()}`,
                input: '',
                expected: '',
                status: 'Pending'
            }
        ]);
    };

    const handleDeleteTestCase = (id: string) => {
        setTestCases(testCases.filter(tc => tc.id !== id));
    };

    const handleTestCaseChange = (id: string, field: 'input' | 'expected', value: string) => {
        setTestCases(testCases.map(tc =>
            tc.id === id ? { ...tc, [field]: value } : tc
        ));
    };

    const handleLanguageChange = (lang: string) => {
        setLanguage(lang);
        const savedCode = localStorage.getItem(`dsa_code_${problemId}_${lang}`);
        const template = problem?.codeTemplates?.[lang] || problem?.starterCode?.[lang] || '';
        setCode(savedCode || template);
    };

    const handleResetCode = () => {
        if (confirm('Are you sure you want to reset your code to the starter template?')) {
            setCode(problem?.starterCode?.[language] || '');
        }
    };

    const handleEditorMount = (editor: any) => {
        editorRef.current = editor;
    };

    // Auto-save effect
    useEffect(() => {
        if (!loading && code && problem?.id) {
            setSaveStatus('saving');
            const timeout = setTimeout(() => {
                localStorage.setItem(`dsa_code_${problem.id}_${language}`, code);
                setSaveStatus('saved');
            }, 1000);
            return () => clearTimeout(timeout);
        }
    }, [code, problem?.id, language, loading]);

    if (loading) return <div className="h-screen flex items-center justify-center text-slate-500 font-medium">Loading Problem Context...</div>;
    if (!problem) {
        return (
            <div className="h-screen flex flex-col items-center justify-center text-slate-500 font-medium gap-4">
                <div className="text-xl text-slate-800 font-bold">Problem not found</div>
                <Link href="/dashboard/dsa/all" className="text-slate-800 font-semibold">Browse all questions</Link>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-6rem)] w-full bg-slate-50 flex flex-col font-sans overflow-hidden">

            {/* Top Bar - Breadcrumbs & Meta */}
            <div className="h-10 shrink-0 flex items-center justify-between px-4 border-b border-slate-200 bg-white shadow-sm z-20">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Link href="/dashboard/dsa" className="flex items-center hover:text-slate-800 transition-colors">
                        <ArrowLeft size={16} /> <span className="ml-1">Problems</span>
                    </Link>
                    <span className="text-slate-300">/</span>
                    <span className="font-bold text-slate-700">{problem.title}</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${problem.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' :
                        problem.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                            'bg-rose-100 text-rose-700'
                        }`}>
                        {problem.difficulty}
                    </span>
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                        {saveStatus === 'saving' ? (
                            <span className="animate-pulse">Saving...</span>
                        ) : (
                            <span className="flex items-center gap-1"><CheckCircle2 size={12} /> Saved</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Main IDE Area */}
            <div className="flex-1 w-full overflow-hidden relative">
                <Group orientation="horizontal" className="flex h-full w-full">
                    {/* LEFT PANEL: Description | Submissions */}
                    <Panel defaultSize={40} minSize={25} className="bg-white flex flex-col h-full border-r border-slate-200">
                        {/* Left Tabs Header */}
                        <div className="h-10 border-b border-slate-200 bg-slate-50 flex items-center px-4 gap-6 shrink-0">
                            <button
                                onClick={() => setLeftTab('description')}
                                className={`flex items-center gap-2 text-sm font-medium h-full border-b-2 transition-all px-1 ${leftTab === 'description'
                                    ? 'text-slate-800 border-slate-800'
                                    : 'text-slate-500 border-transparent hover:text-slate-700'
                                    }`}
                            >
                                <FileText size={14} /> Description
                            </button>
                            <button
                                onClick={() => setLeftTab('submissions')}
                                className={`flex items-center gap-2 text-sm font-medium h-full border-b-2 transition-all px-1 ${leftTab === 'submissions'
                                    ? 'text-slate-800 border-slate-800'
                                    : 'text-slate-500 border-transparent hover:text-slate-700'
                                    }`}
                            >
                                <History size={14} /> Submissions
                            </button>
                        </div>

                        {/* Left Content */}
                        <div className="flex-1 overflow-hidden relative">
                            {leftTab === 'description' ? (
                                <div className="h-full overflow-y-auto custom-scrollbar">
                                    <ProblemDescription problem={problem} />
                                </div>
                            ) : (
                                <div className="h-full overflow-y-auto custom-scrollbar p-0 bg-slate-50">
                                    <SubmissionsTab />
                                </div>
                            )}
                        </div>
                    </Panel>

                    {/* DRAG HANDLE */}
                    <Separator className="w-1.5 bg-slate-100 hover:bg-slate-400 transition-colors cursor-col-resize flex items-center justify-center group z-10" />

                    {/* RIGHT PANEL: Code & Console */}
                    <Panel defaultSize={60} minSize={30} className="h-full flex flex-col">
                        <Group orientation="vertical" className="flex flex-col h-full w-full">
                            {/* TOP: Editor */}
                            <Panel defaultSize={60} minSize={20} className="flex flex-col bg-white h-full border-b border-slate-200">
                                {/* Premium Editor Toolbar */}
                                <div className="h-10 border-b border-slate-200 bg-slate-50 flex items-center justify-between px-3 shrink-0">
                                    {/* Editor Toolbar Content */}
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
                                            onClick={handleResetCode}
                                            className="p-1.5 rounded-md hover:bg-slate-200 text-slate-500 transition-colors"
                                            title="Reset Code"
                                        >
                                            <RotateCcw size={14} />
                                        </button>
                                        <div className="h-4 w-[1px] bg-slate-200 mx-1" />
                                        <select
                                            value={language}
                                            onChange={(e) => handleLanguageChange(e.target.value)}
                                            className="bg-white border border-slate-200 text-xs font-medium text-slate-700 rounded-md px-2 py-1 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-200 shadow-sm"
                                        >
                                            {(problem.languageMeta || [
                                                { lang: 'C++', langSlug: 'cpp' },
                                                { lang: 'Java', langSlug: 'java' },
                                                { lang: 'Python', langSlug: 'python' },
                                                { lang: 'JavaScript', langSlug: 'javascript' },
                                            ]).map((lang) => (
                                                <option key={lang.langSlug} value={lang.langSlug}>{lang.lang}</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={handleRun}
                                            disabled={isRunning}
                                            className="ml-2 flex items-center gap-1.5 px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-md text-xs font-bold transition-all shadow-sm hover:shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                                        >
                                            {isRunning ? (
                                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <Play size={12} fill="currentColor" className="group-hover:scale-110 transition-transform" />
                                            )}
                                            Run
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-hidden relative flex flex-col">
                                    <div className="flex-1 relative">
                                        <Editor
                                            height="100%"
                                            language={language}
                                            value={code}
                                            onChange={(value) => setCode(value || '')}
                                            onMount={handleEditorMount}
                                            theme={theme}
                                            options={{
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
                            </Panel>

                            {/* DRAG HANDLE */}
                            <Separator className="h-1.5 bg-slate-100 hover:bg-slate-400 transition-colors cursor-row-resize flex items-center justify-center group z-10" />

                            {/* BOTTOM: Console / Test Cases */}
                            <Panel defaultSize={40} minSize={10} className="bg-white flex flex-col h-full">
                                {/* Bottom Tabs Header */}
                                <div className="h-9 border-b border-slate-200 bg-slate-50 flex items-center px-4 gap-6 shrink-0">
                                    <button
                                        onClick={() => setRightBottomTab('testcases')}
                                        className={`flex items-center gap-2 text-xs font-bold h-full border-b-2 transition-all px-1 ${rightBottomTab === 'testcases'
                                            ? 'text-slate-800 border-slate-800'
                                            : 'text-slate-500 border-transparent hover:text-slate-700'
                                            }`}
                                    >
                                        <CheckCircle2 size={14} /> Test Cases
                                    </button>
                                    <button
                                        onClick={() => setRightBottomTab('console')}
                                        className={`flex items-center gap-2 text-xs font-bold h-full border-b-2 transition-all px-1 ${rightBottomTab === 'console'
                                            ? 'text-slate-800 border-slate-800'
                                            : 'text-slate-500 border-transparent hover:text-slate-700'
                                            }`}
                                    >
                                        <Terminal size={14} /> Console
                                    </button>
                                    <button
                                        onClick={() => setRightBottomTab('ai_assist')}
                                        className={`flex items-center gap-2 text-xs font-bold h-full border-b-2 transition-all px-1 ${rightBottomTab === 'ai_assist'
                                            ? 'text-slate-800 border-slate-800'
                                            : 'text-slate-500 border-transparent hover:text-slate-700'
                                            }`}
                                    >
                                        <Sparkles size={14} /> AI Assist
                                    </button>
                                </div>

                                {/* Bottom Content */}
                                <div className="flex-1 overflow-hidden bg-white relative flex flex-col">
                                    {rightBottomTab === 'console' ? (
                                        <Console
                                            onRun={handleRun}
                                            onSubmit={handleRun}
                                            isRunning={isRunning}
                                            result={result}
                                        />
                                    ) : rightBottomTab === 'ai_assist' ? (
                                        <AIAssistant />
                                    ) : (
                                        <div className="h-full flex flex-col">
                                            {/* Test Cases List */}
                                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                                {testCases.map((testCase, index) => (
                                                    <div key={testCase.id} className="group relative bg-slate-50 border border-slate-200 rounded-lg overflow-hidden transition-all hover:border-slate-200 hover:shadow-sm">
                                                        <div className="flex items-center justify-between px-3 py-2 bg-slate-100/50 border-b border-slate-200">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-bold text-slate-600">Case {index + 1}</span>
                                                                {testCase.status === 'Passed' && (
                                                                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                                                                        <CheckCircle2 size={10} /> Passed
                                                                    </span>
                                                                )}
                                                                {testCase.status === 'Failed' && (
                                                                    <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                                                                        <AlertCircle size={10} /> Failed
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {!testCase.id.startsWith('default-') && (
                                                                    <button
                                                                        onClick={() => handleDeleteTestCase(testCase.id)}
                                                                        className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                                                                        title="Remove Test Case"
                                                                    >
                                                                        <X size={12} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="p-3 space-y-3">
                                                            <div>
                                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Input</label>
                                                                <div className="relative">
                                                                    <textarea
                                                                        value={testCase.input}
                                                                        onChange={(e) => handleTestCaseChange(testCase.id, 'input', e.target.value)}
                                                                        className="w-full bg-white border border-slate-200 rounded text-sm font-mono text-slate-700 p-2 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-200 transition-shadow resize-none"
                                                                        rows={1}
                                                                        spellCheck={false}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Expected Output</label>
                                                                <div className="relative">
                                                                    <input
                                                                        type="text"
                                                                        value={testCase.expected}
                                                                        onChange={(e) => handleTestCaseChange(testCase.id, 'expected', e.target.value)}
                                                                        className="w-full bg-white border border-slate-200 rounded text-sm font-mono text-slate-700 p-2 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-200 transition-shadow"
                                                                        spellCheck={false}
                                                                    />
                                                                </div>
                                                            </div>
                                                            {testCase.actual && (
                                                                <div className="bg-slate-100 border border-slate-200 rounded p-2">
                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Actual Output</label>
                                                                    <div className="font-mono text-sm text-slate-800 break-all">{testCase.actual}</div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Footer Actions */}
                                            <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
                                                <button
                                                    onClick={handleAddTestCase}
                                                    className="flex items-center gap-1.5 text-xs font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded hover:bg-slate-100 transition-colors border border-slate-200"
                                                >
                                                    <Plus size={14} /> Add Case
                                                </button>
                                                <button
                                                    onClick={handleRun}
                                                    disabled={isRunning}
                                                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition-all shadow-sm hover:shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {isRunning ? (
                                                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    ) : (
                                                        <Play size={14} fill="currentColor" />
                                                    )}
                                                    Run All Cases
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Status Bar (Fixed at bottom of this panel) */}
                                <div className="h-7 border-t border-slate-200 bg-slate-50 flex items-center justify-between px-3 text-[10px] text-slate-500 shrink-0">
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center gap-1.5">
                                            {isRunning ? (
                                                <>
                                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                    <span className="text-amber-600 font-medium">Running...</span>
                                                </>
                                            ) : result?.status === 'Accepted' ? (
                                                <>
                                                    <Check size={10} className="text-emerald-500" />
                                                    <span className="text-emerald-600 font-medium">Ready</span>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                                    <span>Ready</span>
                                                </>
                                            )}
                                        </span>
                                        <div className="h-3 w-[1px] bg-slate-300" />
                                        <span>Console: {rightBottomTab === 'console' ? 'Active' : 'Hidden'}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span>Ln 1, Col 1</span>
                                        <span>UTF-8</span>
                                        <span>{language}</span>
                                        {vimModeEnabled && <span className="text-slate-800 font-bold">VIM</span>}
                                    </div>
                                </div>
                            </Panel>
                        </Group>
                    </Panel>
                </Group>
            </div>

        </div>
    );
}
