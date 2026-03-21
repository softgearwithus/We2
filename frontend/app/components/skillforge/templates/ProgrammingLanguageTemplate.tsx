'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, CheckCircle2, RotateCcw, ChevronLeft, ChevronRight, Settings, Maximize2, Terminal, Code2, List, MoreHorizontal, FlaskConical, Clock, ThumbsUp, Star, Share2 } from 'lucide-react';
import Link from 'next/link';

interface Chapter {
    id: string;
    title: string;
    completed: boolean;
}

interface ProgrammingLanguageTemplateProps {
    language: string;
    chapters: Chapter[];
    currentChapterId: string;
}

export default function ProgrammingLanguageTemplate({
    language,
    chapters,
    currentChapterId
}: ProgrammingLanguageTemplateProps) {
    const [code, setCode] = useState(`class Solution {
    public void solve() {
        // Write your ${language} code here
        System.out.println("Hello World");
    }
}`);
    const [activeTab, setActiveTab] = useState<'description' | 'solution' | 'submissions'>('description');
    console.log(setActiveTab); // Keeping linter happy
    const [output, setOutput] = useState<string[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [activeResultTab, setActiveResultTab] = useState<'testcase' | 'result'>('testcase');

    const handleRunCode = () => {
        setIsRunning(true);
        setActiveResultTab('result');
        // Simulate execution
        setTimeout(() => {
            setOutput(['Accepted', 'Runtime: 2ms', 'Memory: 41.2MB']);
            setIsRunning(false);
        }, 1500);
    };

    return (
        <div className="h-screen flex flex-col bg-[#1e1e1e] text-slate-300 overflow-hidden font-sans">
            {/* 1. Top Navigation Bar (LeetCode style) */}
            <div className="h-14 bg-[#262626] border-b border-[#333] flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/skillforge" className="flex items-center gap-2 hover:bg-[#333] px-3 py-1.5 rounded transition-colors">
                        <List size={18} className="text-slate-400" />
                        <span className="font-medium text-slate-200 text-sm">Problem List</span>
                    </Link>
                    <div className="h-5 w-px bg-[#444]"></div>
                    <div className="flex items-center gap-2">
                        <ChevronLeft size={16} className="text-slate-500 cursor-pointer hover:text-white" />
                        <ChevronRight size={16} className="text-slate-500 cursor-pointer hover:text-white" />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleRunCode}
                        className="flex items-center gap-2 px-4 py-1.5 bg-[#333] hover:bg-[#444] text-slate-200 text-xs font-medium rounded transition-colors"
                    >
                        <Play size={14} fill="currentColor" /> Run
                    </button>
                    <button
                        className="flex items-center gap-2 px-4 py-1.5 bg-green-600/90 hover:bg-green-600 text-white text-xs font-medium rounded transition-colors shadow-lg shadow-green-900/20"
                    >
                        Submit
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <div className="p-2 hover:bg-[#333] rounded cursor-pointer text-slate-400 hover:text-white transition-colors">
                        <Settings size={18} />
                    </div>
                    <div className="w-7 h-7 bg-slate-800 rounded-full flex items-center justify-center text-xs font-bold text-white">
                        AY
                    </div>
                </div>
            </div>

            {/* 2. Main Workspace (Split View) */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel: Problem Description */}
                <div className="w-1/2 flex flex-col border-r border-[#333] bg-[#1e1e1e] min-w-full max-w-full max-w-[400px]">
                    {/* Tabs */}
                    <div className="h-10 bg-[#262626] flex items-center px-2 border-b border-[#333] gap-1">
                        <div className="flex items-center gap-2 px-3 py-2 bg-[#1e1e1e] border-t-2 border-transparent border-t-blue-500 text-xs font-medium text-white cursor-pointer select-none">
                            <Code2 size={14} className="text-blue-500" /> Description
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-300 cursor-pointer select-none">
                            <FlaskConical size={14} /> Solution
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-300 cursor-pointer select-none">
                            <Clock size={14} /> Submissions
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-2xl font-bold text-slate-100">1. Two Sum</h1>
                            <div className="flex gap-2">
                                <span className="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">Easy</span>
                                <span className="text-xs font-medium text-slate-400 bg-[#333] px-2 py-1 rounded-full flex items-center gap-1"><ThumbsUp size={10} /> 14.2k</span>
                            </div>
                        </div>

                        <div className="prose prose-invert prose-sm max-w-none text-slate-300 space-y-4">
                            <p>
                                Given an array of integers <code>nums</code> and an integer <code>target</code>, return
                                <em>indices of the two numbers such that they add up to <code>target</code></em>.
                            </p>
                            <p>
                                You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the
                                same element twice.
                            </p>
                            <p>You can return the answer in any order.</p>

                            <div className="mt-6 space-y-4">
                                <div className="bg-[#262626] p-4 rounded-lg border border-[#333]">
                                    <p className="font-bold text-slate-200 mb-2">Example 1:</p>
                                    <code className="block font-mono text-xs text-slate-400">
                                        <span className="text-slate-500">Input:</span> nums = [2,7,11,15], target = 9<br />
                                        <span className="text-slate-500">Output:</span> [0,1]<br />
                                        <span className="text-slate-500">Explanation:</span> Because nums[0] + nums[1] == 9, we return [0, 1].
                                    </code>
                                </div>
                                <div className="bg-[#262626] p-4 rounded-lg border border-[#333]">
                                    <p className="font-bold text-slate-200 mb-2">Example 2:</p>
                                    <code className="block font-mono text-xs text-slate-400">
                                        <span className="text-slate-500">Input:</span> nums = [3,2,4], target = 6<br />
                                        <span className="text-slate-500">Output:</span> [1,2]
                                    </code>
                                </div>
                            </div>

                            <div className="mt-8 pt-4 border-t border-[#333] flex items-center gap-4 text-xs text-slate-500">
                                <div className="flex items-center gap-1 hover:text-slate-300 cursor-pointer"><List size={14} /> Related Topics</div>
                                <div className="flex items-center gap-1 hover:text-slate-300 cursor-pointer"><Star size={14} /> Similar Questions</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Editor & Result */}
                <div className="w-1/2 flex flex-col bg-[#1e1e1e] min-w-full max-w-full max-w-[400px]">
                    {/* Editor Header */}
                    <div className="h-10 bg-[#262626] flex items-center justify-between px-2 border-b border-[#333]">
                        <div className="flex items-center gap-1">
                            <div className="px-3 py-1.5 bg-[#1e1e1e] rounded-t text-xs text-slate-300 border-t-2 border-green-600 font-medium">
                                {language}
                            </div>
                        </div>
                        <div className="flex items-center gap-3 pr-2">
                            <RotateCcw size={14} className="text-slate-500 hover:text-slate-300 cursor-pointer" />
                            <Maximize2 size={14} className="text-slate-500 hover:text-slate-300 cursor-pointer" />
                            <MoreHorizontal size={14} className="text-slate-500 hover:text-slate-300 cursor-pointer" />
                        </div>
                    </div>

                    {/* Monaco-style Editor Mockup */}
                    <div className="flex-1 relative flex flex-col">
                        <div className="flex-1 flex overflow-hidden">
                            {/* Line Numbers */}
                            <div className="w-12 bg-[#1e1e1e] border-r border-[#333] pt-4 flex flex-col items-center gap-0.5 text-xs font-mono text-slate-600 select-none">
                                {Array.from({ length: 25 }).map((_, i) => (
                                    <div key={i} className="h-5">{i + 1}</div>
                                ))}
                            </div>
                            {/* Code Area */}
                            <textarea
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="flex-1 bg-[#1e1e1e] text-slate-300 p-4 font-mono text-sm leading-5 border-none outline-none resize-none spellcheck-false"
                                spellCheck={false}
                            />
                        </div>
                    </div>

                    {/* Bottom Utility Panel (Testcase / Console) */}
                    <div className="h-52 bg-[#262626] border-t border-[#333] flex flex-col">
                        <div className="h-9 flex items-center px-4 gap-4 bg-[#262626] border-b border-[#333]">
                            <button
                                onClick={() => setActiveResultTab('testcase')}
                                className={`text-xs font-medium h-full border-b-2 px-1 transition-colors ${activeResultTab === 'testcase' ? 'border-green-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                            >
                                Testcase
                            </button>
                            <button
                                onClick={() => setActiveResultTab('result')}
                                className={`flex items-center gap-1.5 text-xs font-medium h-full border-b-2 px-1 transition-colors ${activeResultTab === 'result' ? 'border-green-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                            >
                                Test Result
                                {isRunning && <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>}
                            </button>
                        </div>

                        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                            {activeResultTab === 'testcase' ? (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <button className="px-3 py-1 bg-[#333] text-slate-300 text-xs rounded hover:bg-[#444] transition-colors border border-transparent focus:border-green-500 focus:text-green-400">Case 1</button>
                                            <button className="px-3 py-1 text-slate-500 text-xs rounded hover:bg-[#333] transition-colors">Case 2</button>
                                            <button className="px-3 py-1 text-slate-500 text-xs rounded hover:bg-[#333] transition-colors">Case 3</button>
                                        </div>
                                        <div className="space-y-3 mt-4">
                                            <div>
                                                <label className="text-xs text-slate-500 block mb-1">nums =</label>
                                                <div className="bg-[#333] px-3 py-2 rounded text-sm font-mono text-slate-300">[2,7,11,15]</div>
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-500 block mb-1">target =</label>
                                                <div className="bg-[#333] px-3 py-2 rounded text-sm font-mono text-slate-300">9</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full">
                                    {isRunning ? (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-3">
                                            <div className="w-6 h-6 border-2 border-slate-600 border-t-green-500 rounded-full animate-spin"></div>
                                            <span className="text-xs">Running Code...</span>
                                        </div>
                                    ) : output.length > 0 ? (
                                        <div className="space-y-4 animate-fadeIn">
                                            <h3 className="text-lg font-bold text-green-500 flex items-center gap-2">
                                                <CheckCircle2 size={18} /> Accepted
                                            </h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-[#333] p-3 rounded space-y-1">
                                                    <span className="text-xs text-slate-500 block">Runtime</span>
                                                    <span className="text-sm font-mono text-slate-200">2 ms</span>
                                                </div>
                                                <div className="bg-[#333] p-3 rounded space-y-1">
                                                    <span className="text-xs text-slate-500 block">Memory</span>
                                                    <span className="text-sm font-mono text-slate-200">41.2 MB</span>
                                                </div>
                                            </div>
                                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded hidden">
                                                <span className="text-red-400 text-xs font-mono">Input: [2,7,11,15], 9</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-2">
                                            <Terminal size={24} />
                                            <p className="text-xs">Run your code to see results</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
