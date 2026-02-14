'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, CheckCircle2, XCircle, ChevronRight, Trophy, BrainCircuit, Calculator, MousePointer2 } from 'lucide-react';

interface Question {
    id: number;
    text: string;
    options: string[];
    correct: number;
    category: 'Quant' | 'Logical' | 'Verbal';
}

const sampleQuestions: Question[] = [
    {
        id: 1,
        text: "If a train 110m long passes a man running at 6kmph... how long does it take?",
        options: ["5 sec", "6 sec", "7 sec", "10 sec"],
        correct: 1,
        category: 'Quant'
    },
    {
        id: 2,
        text: "Look at this series: 2, 1, (1/2), (1/4), ... What number should come next?",
        options: ["(1/3)", "(1/8)", "(2/8)", "(1/16)"],
        correct: 1,
        category: 'Logical'
    },
    {
        id: 3,
        text: "Select the pair that expresses a relationship similar to SCALPEL : SURGEON",
        options: ["Laser : Agronomist", "Magnet : Ecologist", "Syringe : Geologist", "Telescope : Astronomer"],
        correct: 3,
        category: 'Verbal'
    }
];

export default function AptitudeTemplate() {
    const [started, setStarted] = useState(false);
    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [finished, setFinished] = useState(false);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);

    useEffect(() => {
        if (started && !finished && timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0) {
            setFinished(true);
        }
    }, [started, finished, timeLeft]);

    const handleAnswer = (index: number) => {
        if (selectedOption !== null) return;
        setSelectedOption(index);

        if (index === sampleQuestions[currentQ].correct) {
            setScore(prev => prev + 10);
        }

        setTimeout(() => {
            if (currentQ < sampleQuestions.length - 1) {
                setCurrentQ(prev => prev + 1);
                setSelectedOption(null);
            } else {
                setFinished(true);
            }
        }, 800);
    };

    if (!started) {
        return (
            <div className="h-screen bg-slate-900 flex items-center justify-center p-6 text-white font-sans">
                <div className="max-w-md w-full text-center space-y-8">
                    <div className="w-24 h-24 bg-indigo-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(99,102,241,0.5)] animate-pulse">
                        <BrainCircuit size={48} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tight mb-2">Speed Aptitude</h1>
                        <p className="text-slate-400 text-lg">Test your mental agility. 60 Seconds.</p>
                    </div>
                    <button
                        onClick={() => setStarted(true)}
                        className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-xl hover:scale-105 transition-transform shadow-xl"
                    >
                        Start Challenge
                    </button>
                    <div className="flex justify-center gap-6 text-sm font-medium text-slate-500">
                        <span className="flex items-center gap-2"><Calculator size={16} /> Quant</span>
                        <span className="flex items-center gap-2"><BrainCircuit size={16} /> Logical</span>
                        <span className="flex items-center gap-2"><MousePointer2 size={16} /> Verbal</span>
                    </div>
                </div>
            </div>
        );
    }

    if (finished) {
        return (
            <div className="h-screen bg-slate-900 flex items-center justify-center p-6 text-white font-sans">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md w-full bg-slate-800 p-8 rounded-[2rem] border border-slate-700 text-center shadow-2xl"
                >
                    <Trophy size={64} className="text-yellow-400 mx-auto mb-6" />
                    <h2 className="text-3xl font-black mb-2">Test Complete!</h2>
                    <p className="text-slate-400 mb-8">Your raw speed score</p>

                    <div className="text-6xl font-black text-emerald-400 mb-8">{score} <span className="text-xl text-slate-500">/ {sampleQuestions.length * 10}</span></div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => {
                                setFinished(false);
                                setStarted(false);
                                setCurrentQ(0);
                                setScore(0);
                                setTimeLeft(60);
                                setSelectedOption(null);
                            }}
                            className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold transition-colors"
                        >
                            Try Again
                        </button>
                        <button className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-colors shadow-lg shadow-indigo-500/20">
                            View Analysis
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    const question = sampleQuestions[currentQ];

    return (
        <div className="h-screen bg-slate-50 flex flex-col font-sans">
            {/* Header */}
            <div className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-20 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-700">
                        {currentQ + 1}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">{question.category}</h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Question {currentQ + 1} of {sampleQuestions.length}</p>
                    </div>
                </div>
                <div className={`px-4 py-2 rounded-xl font-mono font-bold text-xl flex items-center gap-2 ${timeLeft < 10 ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-700'}`}>
                    <Timer size={20} />
                    00:{timeLeft.toString().padStart(2, '0')}
                </div>
            </div>

            {/* Question Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-4xl mx-auto w-full">
                <motion.div
                    key={question.id}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="w-full"
                >
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-10 leading-tight text-center">
                        {question.text}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {question.options.map((opt, idx) => (
                            <button
                                key={idx}
                                disabled={selectedOption !== null}
                                onClick={() => handleAnswer(idx)}
                                className={`p-6 rounded-2xl text-left font-bold text-lg transition-all border-2 relative overflow-hidden group
                                    ${selectedOption === null
                                        ? 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-lg text-slate-700'
                                        : selectedOption === idx
                                            ? idx === question.correct
                                                ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                                                : 'bg-red-50 border-red-500 text-red-700'
                                            : idx === question.correct
                                                ? 'bg-emerald-50 border-emerald-500 text-emerald-700' // Show correct answer
                                                : 'bg-slate-50 border-slate-200 text-slate-400 opacity-50'
                                    }
                                `}
                            >
                                <span className="relative z-10 flex items-center justify-between">
                                    {opt}
                                    {selectedOption !== null && idx === question.correct && <CheckCircle2 size={24} />}
                                    {selectedOption === idx && idx !== question.correct && <XCircle size={24} />}
                                </span>
                            </button>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Footer */}
            <div className="h-2 bg-slate-200">
                <motion.div
                    className="h-full bg-indigo-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQ) / sampleQuestions.length) * 100}%` }}
                />
            </div>
        </div>
    );
}
