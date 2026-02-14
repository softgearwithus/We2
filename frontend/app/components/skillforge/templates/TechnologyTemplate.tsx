'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, Globe, Server, Database, Cloud, ArrowRight, Zap, RotateCw, Code, Layers, Box } from 'lucide-react';

interface TechStackItem {
    id: string;
    title: string;
    description: string;
    icon: any;
}

interface TechnologyTemplateProps {
    technology: string;
    description: string;
    stackItems: TechStackItem[];
}

export default function TechnologyTemplate({
    technology,
    description,
    stackItems
}: TechnologyTemplateProps) {
    const [flippedCard, setFlippedCard] = useState<string | null>(null);
    const [activeStep, setActiveStep] = useState<number | null>(null);

    const flashCards = [
        { id: '1', question: 'What is the Virtual DOM?', answer: 'A lightweight copy of the actual DOM in memory, allowing React to update only changed elements.' },
        { id: '2', question: 'Explain Props vs State', answer: 'Props are read-only inputs passed to components, while State is mutable data managed within the component.' },
        { id: '3', question: 'What is a Hook?', answer: 'Functions that let you hook into React state and lifecycle features from function components.' },
    ];

    const workflowSteps = [
        { id: 1, title: 'Development', desc: 'Write clean, modular code', icon: Code, color: 'bg-blue-500' },
        { id: 2, title: 'Version Control', desc: 'Commit & Push changes', icon: GitBranch, color: 'bg-orange-500' },
        { id: 3, title: 'CI/CD Pipeline', desc: 'Auto-build & Test', icon: Layers, color: 'bg-purple-500' },
        { id: 4, title: 'Containerization', desc: 'Dockerize application', icon: Box, color: 'bg-cyan-500' },
        { id: 5, title: 'Deployment', desc: 'Go live on cloud', icon: Cloud, color: 'bg-emerald-500' }
    ];

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 lg:p-12 space-y-16 max-w-7xl mx-auto">

            {/* 1. Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4"
            >
                <span className="px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold uppercase tracking-wider">
                    Technology Track
                </span>
                <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tight">
                    {technology}
                </h1>
                <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                    {description}
                </p>
            </motion.div>

            {/* 2. Interactive Roadmap (Horizontal) */}
            <section>
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                        <GitBranch size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">DevOps Workflow</h2>
                </div>

                <div className="relative">
                    {/* Connecting Line */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 -z-10 rounded-full hidden lg:block"></div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        {workflowSteps.map((step, index) => (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.15 }}
                                onMouseEnter={() => setActiveStep(step.id)}
                                onMouseLeave={() => setActiveStep(null)}
                                className={`
                                    relative bg-white p-6 rounded-2xl border transition-all duration-300 cursor-pointer
                                    ${activeStep === step.id
                                        ? 'border-indigo-500 shadow-xl shadow-indigo-100 -translate-y-2'
                                        : 'border-slate-200 shadow-sm hover:border-indigo-200'
                                    }
                                `}
                            >
                                <div className={`
                                    w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg
                                    ${step.color}
                                `}>
                                    <step.icon size={24} />
                                </div>
                                <h3 className="font-bold text-slate-900">{step.title}</h3>
                                <p className="text-sm text-slate-500 mt-1">{step.desc}</p>

                                {/* Arrow for mobile */}
                                <div className="lg:hidden absolute bottom-[-20px] left-1/2 -translate-x-1/2 text-slate-300">
                                    {index < workflowSteps.length - 1 && <ArrowRight className="rotate-90" />}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                {/* 3. Tech Stack Deep Dive */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            <Layers size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Core Stack</h2>
                    </div>

                    <div className="space-y-4">
                        {stackItems.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + (index * 0.1) }}
                                className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all flex items-start gap-4"
                            >
                                <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-indigo-50 transition-colors">
                                    <item.icon className="text-slate-600 group-hover:text-indigo-600 transition-colors" size={28} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-700 transition-colors">{item.title}</h3>
                                    <p className="text-slate-500 leading-relaxed mt-1">{item.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* 4. 3D Flash Cards */}
                <section>
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                                <Zap size={24} fill="currentColor" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">Quick Recall</h2>
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tap to flip</span>
                    </div>

                    <div className="bg-slate-100/50 p-6 rounded-3xl border border-slate-200 space-y-4">
                        {flashCards.map((card) => (
                            <div
                                key={card.id}
                                onClick={() => setFlippedCard(flippedCard === card.id ? null : card.id)}
                                className="group perspective cursor-pointer h-44"
                            >
                                <div className={`relative w-full h-full duration-500 preserve-3d transition-transform ${flippedCard === card.id ? 'rotate-y-180' : ''}`}>
                                    {/* Front */}
                                    <div className="absolute inset-0 backface-hidden bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md group-hover:border-indigo-300 transition-all">
                                        <p className="font-bold text-slate-800 text-lg">{card.question}</p>
                                        <div className="mt-4 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <RotateCw size={20} />
                                        </div>
                                    </div>

                                    {/* Back */}
                                    <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-6 flex items-center justify-center text-center shadow-lg text-white">
                                        <p className="font-medium text-lg leading-relaxed">{card.answer}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
