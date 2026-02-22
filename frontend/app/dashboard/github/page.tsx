'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, ChevronRight, ChevronLeft, GitBranch, Github, Play, CheckCircle2, Copy, BookOpen, ArrowRight } from 'lucide-react';
import { GIT_LESSONS } from '@/app/lib/github-data';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function GitMasteryPage() {
    const [viewMode, setViewMode] = useState<'overview' | 'lesson'>('overview');
    const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
    const [terminalLines, setTerminalLines] = useState<{ type: 'cmd' | 'out', text: string }[]>([]);
    const [isExecuting, setIsExecuting] = useState(false);
    const [hasExecutedCurrent, setHasExecutedCurrent] = useState(false);
    const [copied, setCopied] = useState(false);

    const currentLesson = GIT_LESSONS[currentLessonIndex];
    const isFirst = currentLessonIndex === 0;
    const isLast = currentLessonIndex === GIT_LESSONS.length - 1;

    // Reset state when lesson changes
    useEffect(() => {
        setHasExecutedCurrent(false);
        setTerminalLines([]);
    }, [currentLessonIndex, viewMode]);

    const executeCommand = () => {
        if (isExecuting || hasExecutedCurrent) return;
        setIsExecuting(true);

        const newCmdLine: { type: 'cmd' | 'out', text: string } = { type: 'cmd', text: currentLesson.command };
        setTerminalLines(prev => [...prev, newCmdLine]);

        setTimeout(() => {
            if (currentLesson.expectedOutput) {
                const outLines = currentLesson.expectedOutput.split('\n');
                const formattedOuts = outLines.map(line => ({ type: 'out' as const, text: line }));
                setTerminalLines(prev => [...prev, ...formattedOuts]);
            }
            setIsExecuting(false);
            setHasExecutedCurrent(true);
        }, 800); // UI delay for realism
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(currentLesson.command);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const nextLesson = () => {
        if (!isLast) setCurrentLessonIndex(prev => prev + 1);
    };

    const prevLesson = () => {
        if (!isFirst) setCurrentLessonIndex(prev => prev - 1);
    };

    return (
        <div className="max-w-[1400px] mx-auto h-[calc(100vh-8rem)] flex flex-col pt-6 font-sans">
            {/* Header */}
            <header className="flex items-center justify-between mb-8 shrink-0">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-md">
                            <Github className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Git & GitHub Pro</h1>
                            <p className="text-sm font-medium text-slate-500">Master version control for modern development teams</p>
                        </div>
                    </div>
                </div>
                {viewMode === 'lesson' ? (
                    <div className="flex items-center gap-4 bg-white px-5 py-2.5 rounded-2xl border border-slate-200 shadow-sm">
                        <span className="text-sm font-bold text-slate-400">Progress</span>
                        <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-slate-900 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${((currentLessonIndex + 1) / GIT_LESSONS.length) * 100}%` }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                            />
                        </div>
                        <span className="text-sm font-black text-slate-900">{currentLessonIndex + 1} / {GIT_LESSONS.length}</span>
                        <div className="w-px h-6 bg-slate-200 mx-2" />
                        <button onClick={() => setViewMode('overview')} className="text-sm text-slate-500 hover:text-slate-800 font-bold transition-colors">
                            Exit
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setViewMode('lesson')}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all drop-shadow-lg flex items-center gap-2"
                    >
                        <Play size={16} fill="currentColor" /> Start Interactive Course
                    </button>
                )}
            </header>

            {viewMode === 'overview' && (
                <div className="flex-1 overflow-y-auto pb-20 custom-scrollbar pr-4">
                    <div className="mb-8">
                        <h2 className="text-xl font-black text-slate-900 mb-2">Command Reference Guide</h2>
                        <p className="text-slate-500">A complete cheat sheet of all essential Git commands covered in the interactive course.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {GIT_LESSONS.map((lesson, idx) => (
                            <div key={lesson.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 shrink-0 text-slate-600 font-bold">
                                        {idx + 1}
                                    </div>
                                    <button
                                        onClick={() => { setCurrentLessonIndex(idx); setViewMode('lesson'); }}
                                        className="text-xs font-bold text-indigo-500 hover:text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                                    >
                                        Practice <ArrowRight size={14} />
                                    </button>
                                </div>
                                <h3 className="text-lg font-black text-slate-900 mb-1">{lesson.title}</h3>
                                <p className="text-sm text-slate-500 mb-4">{lesson.description}</p>

                                <div className="mt-auto bg-slate-900 rounded-xl p-3 flex items-center justify-between">
                                    <code className="text-emerald-400 font-mono text-xs">
                                        <span className="text-slate-500 mr-2">$</span>{lesson.command}
                                    </code>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {viewMode === 'lesson' && (
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
                    {/* Left Panel: Theory */}
                    <div className="lg:col-span-5 flex flex-col bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar relative">
                            {/* Progress line decorative */}
                            <div className="absolute left-10 top-0 bottom-0 w-[2px] bg-slate-50 -z-10" />

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentLesson.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-8"
                                >
                                    <div>
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold uppercase tracking-wider mb-4 border border-indigo-100">
                                            Lesson {currentLessonIndex + 1}
                                        </div>
                                        <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
                                            {currentLesson.title}
                                        </h2>
                                        <p className="text-xl text-slate-500 font-medium mt-3">
                                            {currentLesson.description}
                                        </p>
                                    </div>

                                    <div className="space-y-6 pt-6 border-t border-slate-100">
                                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">The Concept</h3>
                                            <p className="text-slate-700 leading-relaxed font-medium">
                                                {currentLesson.explanation}
                                            </p>
                                        </div>

                                        <div>
                                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Command Syntax</h3>
                                            <div className="group relative bg-slate-900 rounded-xl p-4 flex items-center justify-between overflow-hidden shadow-inner">
                                                <code className="text-emerald-400 font-mono text-sm">
                                                    <span className="text-slate-500 mr-3">$</span>{currentLesson.command}
                                                </code>
                                                <button
                                                    onClick={handleCopy}
                                                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
                                                    title="Copy command"
                                                >
                                                    {copied ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Navigation Bar */}
                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
                            <button
                                onClick={prevLesson}
                                disabled={isFirst}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm disabled:opacity-50 disabled:pointer-events-none"
                            >
                                <ChevronLeft size={18} /> Previous
                            </button>

                            <button
                                onClick={nextLesson}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm",
                                    hasExecutedCurrent || isLast
                                        ? "bg-slate-900 text-white hover:bg-slate-800 hover:shadow-md"
                                        : "bg-indigo-100 text-indigo-400 cursor-not-allowed opacity-60"
                                )}
                                disabled={!hasExecutedCurrent && !isLast}
                            >
                                {isLast ? "Finish Course" : "Next Lesson"} <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Right Panel: Terminal Environment */}
                    <div className="lg:col-span-7 bg-[#0d1117] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col relative font-mono text-sm">
                        {/* Terminal Header */}
                        <div className="h-12 bg-[#161b22] border-b border-slate-800 flex items-center gap-4 px-4 shrink-0 shadow-lg z-10">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                            </div>
                            <div className="flex-1 text-center flex items-center justify-center gap-2">
                                <Terminal size={14} className="text-slate-500" />
                                <span className="text-xs font-medium text-slate-400 selection:bg-none">developer@machine: ~/emble-project</span>
                            </div>
                        </div>

                        {/* Terminal Flow */}
                        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar custom-scrollbar-dark flex flex-col text-slate-300">
                            {/* Always show history */}
                            {terminalLines.map((line, idx) => (
                                <div key={idx} className={cn("mb-1", line.type === 'out' ? "text-slate-300 pl-4 whitespace-pre-wrap leading-relaxed tracking-wide font-medium" : "text-white mt-3 font-semibold")}>
                                    {line.type === 'cmd' && <span className="text-emerald-400 mr-3">➜</span>}
                                    {line.text}
                                </div>
                            ))}

                            {/* Active Input Line */}
                            <div className="mt-3 flex items-center group">
                                <span className="text-emerald-400 mr-3">➜</span>
                                <div className="flex-1 flex items-center h-8 bg-white/10 rounded px-3 border border-slate-600/50 group-hover:border-slate-500 transition-colors shadow-inner">
                                    {!hasExecutedCurrent && !isExecuting && (
                                        <>
                                            <span className="text-slate-400 italic mr-2 text-xs select-none">Write command:</span>
                                            <span className="text-white font-bold tracking-wide">{currentLesson.command}</span>
                                        </>
                                    )}
                                    {isExecuting && <span className="w-2 h-4 bg-emerald-400 animate-pulse ml-1" />}
                                </div>
                            </div>

                            {/* Execution Action overlay - centered in remaining space logically */}
                            {!hasExecutedCurrent && !isExecuting && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-auto pt-10 pb-4 flex justify-center"
                                >
                                    <button
                                        onClick={executeCommand}
                                        className="group flex flex-col items-center gap-3 relative"
                                    >
                                        <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="h-16 w-16 bg-emerald-500 hover:bg-emerald-400 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-900/50 transition-all group-hover:scale-105 group-active:scale-95 border border-emerald-400/50 relative z-10">
                                            <Play className="w-8 h-8 ml-1 fill-white" />
                                        </div>
                                        <span className="text-xs font-bold text-emerald-400 tracking-widest uppercase bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 backdrop-blur-md">Execute Command</span>
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
