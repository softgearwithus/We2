'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, CheckCircle2, PlayCircle, Eye, MousePointerClick, MessageSquare, Terminal, ChevronRight, CornerDownLeft } from 'lucide-react';

interface ToolStep {
    id: string;
    title: string;
    description: string;
    command?: string; // Command to type
    image?: string;
}

interface ToolTemplateProps {
    toolName: string;
    description: string;
    steps: ToolStep[];
}

export default function ToolTemplate({
    toolName,
    description,
    steps
}: ToolTemplateProps) {
    const [activeStepIndex, setActiveStepIndex] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [terminalOutput, setTerminalOutput] = useState<string[]>(['> Ready for input...']);
    const [isStepComplete, setIsStepComplete] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const currentStep = steps[activeStepIndex];

    const handleCommandSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentStep.command) return;

        const command = userInput.trim();
        setTerminalOutput(prev => [...prev, `$ ${command}`]);

        if (command === currentStep.command) {
            setTerminalOutput(prev => [...prev, `> Success! Executing ${command}...`, '> Done.']);
            setIsStepComplete(true);
            setUserInput('');
        } else {
            setTerminalOutput(prev => [...prev, `> Error: Expected '${currentStep.command}'`]);
            setUserInput('');
        }
    };

    const handleNextStep = () => {
        if (activeStepIndex < steps.length - 1) {
            setActiveStepIndex(prev => prev + 1);
            setIsStepComplete(false);
            setTerminalOutput(['> Ready for next step...']);
        }
    };

    useEffect(() => {
        if (inputRef.current) inputRef.current.focus();
    }, [activeStepIndex]);


    return (
        <div className="min-h-screen bg-slate-50/50 p-6 lg:p-12 space-y-12 max-w-7xl mx-auto">

            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold uppercase tracking-wider mb-2 inline-block">
                        Tool Mastery
                    </span>
                    <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">{toolName}</h1>
                    <p className="text-lg text-slate-500 mt-2 max-w-xl">{description}</p>
                </motion.div>

                {/* Progress Indicator */}
                <div className="flex items-center gap-2">
                    {steps.map((step, idx) => (
                        <div
                            key={step.id}
                            className={`
                                h-2 rounded-full transition-all duration-300
                                ${idx === activeStepIndex ? 'w-8 bg-amber-500' : idx < activeStepIndex ? 'w-2 bg-emerald-500' : 'w-2 bg-slate-200'}
                            `}
                        />
                    ))}
                    <span className="ml-2 text-xs font-bold text-slate-400">
                        {activeStepIndex + 1} / {steps.length}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 h-[600px]">

                {/* Left: Step Instructions */}
                <div className="flex flex-col justify-center space-y-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
                            <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/10 text-amber-500">
                                <span className="text-2xl font-black">{activeStepIndex + 1}</span>
                            </div>

                            <h2 className="text-3xl font-bold text-slate-900">{currentStep.title}</h2>
                            <p className="text-lg text-slate-600 leading-relaxed">{currentStep.description}</p>

                            {currentStep.command ? (
                                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                                    <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">Task</p>
                                    <p className="text-slate-700">
                                        Type <code className="px-2 py-1 bg-white border border-amber-200 rounded-md font-mono text-amber-600 font-bold">{currentStep.command}</code> in the terminal.
                                    </p>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsStepComplete(true)}
                                    className="px-6 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 shadow-lg shadow-amber-200 transition-all active:scale-95"
                                >
                                    Mark as Read
                                </button>
                            )}

                            {isStepComplete && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <button
                                        onClick={handleNextStep}
                                        className="flex items-center gap-2 text-lg font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                                    >
                                        Next Step <ChevronRight size={20} />
                                    </button>
                                </motion.div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Right: Interactive Terminal */}
                <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden relative">
                    {/* Terminal Header */}
                    <div className="h-10 bg-slate-950/50 border-b border-white/5 flex items-center px-4 gap-2">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                        </div>
                        <div className="ml-auto text-xs text-slate-500 font-mono flex items-center gap-1">
                            <Terminal size={12} /> bash
                        </div>
                    </div>

                    {/* Terminal Output */}
                    <div className="flex-1 p-6 font-mono text-sm space-y-2 overflow-y-auto custom-scrollbar" onClick={() => inputRef.current?.focus()}>
                        {terminalOutput.map((line, i) => (
                            <div key={i} className={`${line.startsWith('>') ? 'text-slate-400' : line.startsWith('$') ? 'text-blue-400' : 'text-emerald-400'}`}>
                                {line}
                            </div>
                        ))}

                        {/* Input Line */}
                        {!isStepComplete && currentStep.command && (
                            <form onSubmit={handleCommandSubmit} className="flex items-center gap-2 mt-2">
                                <span className="text-amber-500 font-bold">$</span>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    className="bg-transparent border-none outline-none text-white w-full caret-amber-500"
                                    autoFocus
                                    spellCheck={false}
                                />
                            </form>
                        )}

                        {isStepComplete && (
                            <div className="text-emerald-500 font-bold mt-4 flex items-center gap-2">
                                <CheckCircle2 size={16} /> Step Completed.
                            </div>
                        )}
                    </div>

                    {/* Hint Overlay (optional) */}
                    <div className="absolute bottom-4 right-4 opacity-20 pointer-events-none">
                        <Terminal size={120} />
                    </div>
                </div>
            </div>
        </div>
    );
}
