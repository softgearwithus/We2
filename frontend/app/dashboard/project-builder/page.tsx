'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Database, Globe, Layers, ArrowRight, Check, Sparkles } from 'lucide-react';

export default function ProjectBuilderWizard() {
    const [step, setStep] = useState(1);
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

    // Mock Domains
    const domains = [
        { id: 'web', name: 'Web Development', icon: Globe, color: 'text-blue-500', bg: 'bg-blue-50' },
        { id: 'mobile', name: 'Mobile App', icon: Layers, color: 'text-purple-500', bg: 'bg-purple-50' },
        { id: 'ai', name: 'AI & ML', icon: Sparkles, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { id: 'backend', name: 'Backend Systems', icon: Database, color: 'text-orange-500', bg: 'bg-orange-50' },
    ];

    const toggleInterest = (id: string) => {
        if (selectedInterests.includes(id)) {
            setSelectedInterests(selectedInterests.filter(i => i !== id));
        } else {
            setSelectedInterests([...selectedInterests, id]);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
            <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl shadow-slate-200 overflow-hidden flex flex-col md:flex-row min-h-[600px]">

                {/* Sidebar / Progress */}
                <div className="w-full md:w-1/3 bg-slate-900 p-8 text-white flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
                                <Code className="text-white" />
                            </div>
                            <h1 className="font-bold text-xl">Project Forge</h1>
                        </div>

                        <div className="space-y-6 relative">
                            {/* Connector Line */}
                            <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-700 -z-10"></div>

                            {[
                                { num: 1, title: 'Interests', desc: 'Select your domains' },
                                { num: 2, title: 'Recommendations', desc: 'AI suggested projects' },
                                { num: 3, title: 'Blueprint', desc: 'Your project roadmap' },
                                { num: 4, title: 'Build', desc: 'Start coding' }
                            ].map((s) => (
                                <div key={s.num} className="flex items-start gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border-2 transition-colors
                                        ${step >= s.num
                                            ? 'bg-indigo-500 border-indigo-500 text-white'
                                            : 'bg-slate-800 border-slate-700 text-slate-500'}
                                    `}>
                                        {step > s.num ? <Check size={18} /> : s.num}
                                    </div>
                                    <div>
                                        <h3 className={`font-bold ${step >= s.num ? 'text-white' : 'text-slate-500'}`}>{s.title}</h3>
                                        <p className="text-xs text-slate-400">{s.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-800 p-4 rounded-2xl">
                        <p className="text-xs text-slate-400 mb-2">Pro Tip</p>
                        <p className="text-sm text-slate-300">
                            Selecting multiple domains (e.g., AI + Web) will suggest unique Full Stack AI projects!
                        </p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-8 md:p-12 relative">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="h-full flex flex-col"
                            >
                                <h2 className="text-3xl font-extrabold text-slate-900 mb-2">What interests you?</h2>
                                <p className="text-slate-500 mb-8">Select one or more domains to get personalized project ideas.</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                    {domains.map((domain) => (
                                        <div
                                            key={domain.id}
                                            onClick={() => toggleInterest(domain.id)}
                                            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4
                                                ${selectedInterests.includes(domain.id)
                                                    ? 'border-indigo-500 bg-indigo-50'
                                                    : 'border-slate-100 bg-white hover:border-indigo-100 hover:shadow-md'}
                                            `}
                                        >
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${domain.bg} ${domain.color}`}>
                                                <domain.icon size={24} />
                                            </div>
                                            <div>
                                                <h3 className={`font-bold text-lg ${selectedInterests.includes(domain.id) ? 'text-indigo-900' : 'text-slate-900'}`}>
                                                    {domain.name}
                                                </h3>
                                                {selectedInterests.includes(domain.id) && (
                                                    <span className="text-xs font-bold text-indigo-600">Selected</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-auto flex justify-end">
                                    <button
                                        onClick={() => setStep(2)}
                                        disabled={selectedInterests.length === 0}
                                        className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
                                    >
                                        Next Step <ArrowRight size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="h-full flex flex-col"
                            >
                                <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Recommended for You</h2>
                                <p className="text-slate-500 mb-6">Based on your interests in <span className="font-bold text-indigo-600">{selectedInterests.map(id => domains.find(d => d.id === id)?.name).join(' + ')}</span></p>

                                <div className="grid grid-cols-1 gap-4 overflow-y-auto pr-2 custom-scrollbar mb-6">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="p-6 rounded-2xl border border-slate-100 bg-white hover:border-indigo-200 hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <Sparkles size={64} className="text-indigo-600" />
                                            </div>
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">
                                                    Beginner Friendly
                                                </span>
                                                <span className="text-xs font-bold text-slate-400">20 Hours</span>
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900 mb-2">AI Powered Resume Analyzer {i}</h3>
                                            <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                                                Build a full-stack application that parses resumes using Python and suggests improvements using OpenAI API.
                                            </p>
                                            <div className="flex gap-2">
                                                <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg">React</span>
                                                <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg">Python</span>
                                                <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg">FastAPI</span>
                                            </div>

                                            <div className="mt-4 pt-4 border-t border-slate-50 flex justify-end">
                                                <button
                                                    onClick={() => setStep(3)}
                                                    className="text-indigo-600 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all"
                                                >
                                                    View Blueprint <ArrowRight size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button onClick={() => setStep(1)} className="text-slate-400 font-bold text-sm hover:text-slate-600 self-start">
                                    Back to Interests
                                </button>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="h-full flex flex-col overflow-y-auto pr-2 custom-scrollbar"
                            >
                                <button onClick={() => setStep(2)} className="text-slate-400 font-bold text-sm hover:text-slate-600 self-start mb-4">
                                    Back to Recommendations
                                </button>

                                <div className="bg-indigo-50 p-8 rounded-3xl border border-indigo-100 mb-8">
                                    <div className="flex justify-between items-start mb-4">
                                        <h2 className="text-3xl font-extrabold text-indigo-900">AI Powered Resume Analyzer</h2>
                                        <span className="bg-white text-indigo-600 px-4 py-1.5 rounded-full font-bold text-sm shadow-sm">
                                            Intermediate
                                        </span>
                                    </div>
                                    <p className="text-indigo-700 text-lg leading-relaxed mb-6">
                                        Create a web application that allows users to upload their resumes (PDF/DOCX), parses the text using Python, and uses OpenAI's GPT model to provide feedback and partial scoring based on job descriptions.
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {['React', 'Tailwind', 'Python', 'FastAPI', 'OpenAI API', 'LangChain'].map(tech => (
                                            <span key={tech} className="bg-white/60 text-indigo-800 px-3 py-1 rounded-lg text-sm font-bold border border-indigo-100">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <Layers className="text-brand-orange" /> Project Blueprint
                                </h3>

                                <div className="space-y-4 mb-8">
                                    {[
                                        { title: 'Project Setup & Environment', desc: 'Initialize React app and FastAPI backend. Configure virtual environment.' },
                                        { title: 'Backend: PDF Parsing', desc: 'Implement file upload endpoint and extraction logic using PyPDF2.' },
                                        { title: 'AI Integration', desc: 'Connect to OpenAI API to analyze extracted text against heuristics.' },
                                        { title: 'Frontend UI', desc: 'Build upload component and results dashboard with score visualization.' },
                                        { title: 'Deployment', desc: 'Deploy frontend to Vercel and backend to Render/Railway.' }
                                    ].map((s, i) => (
                                        <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 flex gap-4 items-start">
                                            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500 shrink-0 mt-0.5">
                                                {i + 1}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900">{s.title}</h4>
                                                <p className="text-sm text-slate-500">{s.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-auto flex justify-end gap-4">
                                    <button className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                                        Save for Later
                                    </button>
                                    <button
                                        onClick={() => setStep(4)}
                                        className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 hover:shadow-indigo-200"
                                    >
                                        Start Building <Code size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="h-full flex flex-col items-center justify-center max-w-lg mx-auto w-full"
                            >
                                <div className="w-full space-y-6">
                                    <div className="text-center mb-8">
                                        <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600">
                                            <Sparkles size={32} />
                                        </div>
                                        <h2 className="text-3xl font-extrabold text-slate-900">Submit Your Project</h2>
                                        <p className="text-slate-500">Share your masterpiece with the world and get AI feedback.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">GitHub Repository URL</label>
                                            <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-300 transition-all">
                                                <Code size={18} className="text-slate-400" />
                                                <input type="text" placeholder="https://github.com/username/project" className="flex-1 bg-transparent outline-none text-sm font-medium" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Live Demo URL (Optional)</label>
                                            <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-300 transition-all">
                                                <Globe size={18} className="text-slate-400" />
                                                <input type="text" placeholder="https://my-project.vercel.app" className="flex-1 bg-transparent outline-none text-sm font-medium" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Project Reflection</label>
                                            <textarea placeholder="What was the biggest challenge you faced?" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all outline-none text-sm font-medium h-32 resize-none"></textarea>
                                        </div>
                                    </div>

                                    <button className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-[0.98]">
                                        Submit for Review
                                    </button>

                                    <button onClick={() => setStep(3)} className="w-full text-slate-400 font-bold text-sm hover:text-slate-600">
                                        Back to Blueprint
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
