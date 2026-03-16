'use client';

import React, { useState, useRef, useEffect } from 'react';
import ResumeForm from '@/app/components/resume/ResumeForm';
import ResumePreview from '@/app/components/resume/ResumePreview';
import { initialResumeState, ResumeData } from '@/app/lib/resume.types';
import { useReactToPrint } from 'react-to-print';
import { Download, Layout, ArrowRight, Sparkles, FileText, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import ATSScanner from './_components/ats-scanner';
import { motion, AnimatePresence } from 'framer-motion';
import { useSectionUsage } from '@/app/hooks/useSectionUsage';
import UsageUpgradeGate from '@/app/components/shared/UsageUpgradeGate';

export default function ResumeBuilderPage() {
    const [view, setView] = useState<'landing' | 'templates' | 'builder' | 'scanner' | 'list'>('landing');
    const [data, setData] = useState<ResumeData>(initialResumeState);
    const [resumes, setResumes] = useState<any[]>([]);
    const [currentResumeId, setCurrentResumeId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);
    const printRef = useRef<HTMLDivElement>(null);
    const { remainingLabel, isLimited, isFreePlan } = useSectionUsage('resume');

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `${data.personalInfo.fullName.replace(' ', '_')}_Resume`,
    });

    const loadResumes = async () => {
        const { getActiveToken } = await import('@/app/lib/auth-storage');
        const token = getActiveToken();
        if (!token) return;
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/resume/all`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (response.ok) {
                const payload = await response.json();
                setResumes(payload.data || payload || []);
            }
        } catch (error) {
            console.error('Failed to load resumes', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadResumeById = async (id: string) => {
        const { getActiveToken } = await import('@/app/lib/auth-storage');
        const token = getActiveToken();
        if (!token) return;
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/resume/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (response.ok) {
                const payload = await response.json();
                if (payload?.data) {
                    setData(payload.data);
                    setCurrentResumeId(id);
                    setView('builder');
                }
            }
        } catch (error) {
            console.error('Failed to load resume', error);
        } finally {
            setIsLoading(false);
        }
    };

    const saveResume = async () => {
        const { getActiveToken } = await import('@/app/lib/auth-storage');
        const token = getActiveToken();
        if (!token) return;
        setIsSaving(true);
        setSaveMessage(null);
        try {
            const endpoint = currentResumeId ? `/resume/${currentResumeId}` : `/resume`;
            const method = currentResumeId ? 'PUT' : 'POST';
            
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ 
                    title: `${data.personalInfo.fullName}'s Resume - ${data.templateId}`, 
                    data 
                }),
            });
            
            if (!response.ok) {
                throw new Error('Save failed');
            }
            
            const result = await response.json();
            if (!currentResumeId && result.data?.id) {
                setCurrentResumeId(result.data.id);
            }
            
            setSaveMessage('Saved');
            loadResumes(); // Refresh the list silently
        } catch (error) {
            setSaveMessage('Save failed');
        } finally {
            setIsSaving(false);
            setTimeout(() => setSaveMessage(null), 2000);
        }
    };

    useEffect(() => {
        if (view === 'list' || view === 'landing') {
            loadResumes();
        }
    }, [view]);

    const startNewBuilder = (templateId: 'google-standard' | 'startup-clean' | 'creative-pro') => {
        setData({ ...initialResumeState, templateId });
        setCurrentResumeId(null);
        setView('builder');
    };

    return (
        <div className="h-[calc(100vh-7rem)] flex flex-col bg-slate-50 overflow-hidden font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-700 rounded-2xl border border-slate-200 relative">
            {isLimited && (
                <UsageUpgradeGate message="Upgrade to continue your resume tools." />
            )}
            {/* Header */}
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-20 shrink-0 sticky top-0">
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('landing')}>
                    <div className="p-2 bg-indigo-50 rounded-xl group-hover:bg-indigo-100 transition-colors">
                        <Layout className="text-indigo-600" size={20} />
                    </div>
                    <div>
                        <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">Resume<span className="text-indigo-600">Center</span></h1>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {(view === 'builder' || view === 'templates' || view === 'list' || view === 'scanner') && (
                        <button
                            onClick={() => setView('landing')}
                            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
                        >
                            Back
                        </button>
                    )}

                    {(view === 'landing' || view === 'templates' || view === 'list') && resumes.length > 0 && (
                        <button
                            onClick={() => setView('list')}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl shadow-sm transition-all active:scale-95"
                        >
                            <FileText size={16} /> My Resumes ({resumes.length})
                        </button>
                    )}

                    {view === 'builder' && (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={saveResume}
                                disabled={isSaving || isLimited}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-60"
                            >
                                {isSaving ? 'Saving...' : 'Save'}
                            </button>
                            <button
                                onClick={() => handlePrint && handlePrint()}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 rounded-xl shadow-lg shadow-slate-200 transition-all active:scale-95"
                            >
                                <Download size={18} /> Export PDF
                            </button>
                            {saveMessage && (
                                <span className="text-xs font-bold text-slate-500">{saveMessage}</span>
                            )}
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <AnimatePresence mode="wait">
                {view === 'landing' && (
                    <motion.div
                        key="landing"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-y-auto"
                    >
                        {/* Hero Section */}
                        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider border border-indigo-100">
                                <Sparkles size={12} /> Career Acceleration
                            </span>
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                                Build Your Future,<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">One Resume at a Time.</span>
                            </h2>
                            <p className="text-lg text-slate-600 max-w-lg mx-auto leading-relaxed">
                                Create a ATS-optimized resume in minutes or analyze your existing one to get hired faster.
                            </p>
                            {isFreePlan && (
                                <div className={`mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold ${isLimited ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
                                    Free plan time left in Resume: {remainingLabel}
                                </div>
                            )}
                        </div>

                        {/* Cards Grid */}
                        <div className="grid md:grid-cols-2 gap-6 max-w-4xl w-full">
                            {/* Builder Card */}
                            <motion.div
                                whileHover={{ y: -4 }}
                                onClick={() => !isLimited && setView('templates')}
                                className={`group bg-white border border-slate-200 p-8 rounded-3xl transition-all shadow-sm relative overflow-hidden ${isLimited ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100'}`}
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110" />

                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors duration-300">
                                        <FileText className="text-indigo-600 group-hover:text-white transition-colors" size={28} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Resume Builder</h3>
                                    <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                                        Choose from our premium templates to create a standout resume.
                                    </p>

                                    <div className="mt-auto flex items-center justify-between">
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                    {i}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm group-hover:gap-3 transition-all">
                                            Choose Template <ArrowRight size={16} />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Scanner Card */}
                            <motion.div
                                whileHover={{ y: -4 }}
                                onClick={() => !isLimited && setView('scanner')}
                                className={`group bg-white border border-slate-200 p-8 rounded-3xl transition-all shadow-sm relative overflow-hidden ${isLimited ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-100'}`}
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110" />

                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 transition-colors duration-300">
                                        <CheckCircle2 className="text-emerald-600 group-hover:text-white transition-colors" size={28} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">ATS Scanner</h3>
                                    <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                                        Get an instant score and AI-driven feedback to optimize your resume for algorithms.
                                    </p>

                                    <div className="mt-auto flex items-center justify-between">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg">
                                            <Sparkles size={12} /> AI Powered
                                        </span>
                                        <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm group-hover:gap-3 transition-all">
                                            Analyze Now <ArrowRight size={16} />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}

                {view === 'templates' && (
                    <motion.div
                        key="templates"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar"
                    >
                        <div className="max-w-5xl mx-auto w-full">
                            <h2 className="text-3xl font-black text-slate-900 mb-2">Choose a Template</h2>
                            <p className="text-slate-500 mb-10">Select a premium template to start building your professional story.</p>
                            
                            <div className="grid md:grid-cols-3 gap-8">
                                {/* Google Standard */}
                                <div 
                                    onClick={() => startNewBuilder('google-standard')}
                                    className="group cursor-pointer"
                                >
                                    <div className="aspect-[1/1.4] bg-white border border-slate-200 rounded-xl mb-4 p-4 shadow-sm group-hover:shadow-xl group-hover:border-indigo-400 transition-all flex flex-col relative overflow-hidden">
                                        <div className="text-center mb-3">
                                            <div className="font-serif text-[12px] font-bold text-slate-800">ALEXANDER REED</div>
                                            <div className="text-[5px] text-slate-500 mt-1">San Francisco, CA • (555) 123-4567 • alex@example.com</div>
                                        </div>
                                        
                                        <div className="border-b-[0.5px] border-slate-300 mb-1">
                                            <div className="text-[6px] font-bold text-slate-700 tracking-wide uppercase mb-0.5">Experience</div>
                                        </div>
                                        <div className="mb-2">
                                            <div className="flex justify-between items-baseline">
                                                <div className="text-[7.5px] font-bold text-slate-900">Senior Software Engineer</div>
                                                <div className="text-[5.5px] text-slate-600 font-bold">2020 - Present</div>
                                            </div>
                                            <div className="text-[6px] text-slate-700 italic mb-1">Tech Solutions Inc.</div>
                                            <ul className="list-disc pl-2 space-y-0.5 mt-0.5">
                                                <li className="text-[5px] text-slate-800 leading-tight">Led development of core platform processing 1M+ requests daily.</li>
                                                <li className="text-[5px] text-slate-800 leading-tight">Mentored team of 5 junior developers, improving delivery speed by 20%.</li>
                                            </ul>
                                        </div>
                                        <div className="mb-2">
                                            <div className="flex justify-between items-baseline">
                                                <div className="text-[7.5px] font-bold text-slate-900">Frontend Developer</div>
                                                <div className="text-[5.5px] text-slate-600 font-bold">2018 - 2020</div>
                                            </div>
                                            <div className="text-[6px] text-slate-700 italic mb-1">WebStudio LLC</div>
                                            <ul className="list-disc pl-2 space-y-0.5 mt-0.5">
                                                <li className="text-[5px] text-slate-800 leading-tight">Developed interactive dashboards using React and Redux.</li>
                                            </ul>
                                        </div>

                                        <div className="border-b-[0.5px] border-slate-300 mb-1 mt-1.5">
                                            <div className="text-[6px] font-bold text-slate-700 tracking-wide uppercase mb-0.5">Education</div>
                                        </div>
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <div className="text-[7.5px] font-bold text-slate-900">B.S. Computer Science</div>
                                            <div className="text-[5.5px] text-slate-600 font-bold">2016 - 2020</div>
                                        </div>
                                        <div className="flex justify-between mb-2">
                                            <div className="text-[6px] text-slate-700 italic">University of Technology</div>
                                            <div className="text-[5.5px] text-slate-600 font-bold">GPA: 3.8/4.0</div>
                                        </div>
                                        
                                        <div className="border-b-[0.5px] border-slate-300 mb-1 mt-1.5">
                                            <div className="text-[6px] font-bold text-slate-700 tracking-wide uppercase mb-0.5">Skills</div>
                                        </div>
                                        <div className="text-[5.5px] text-slate-800 leading-tight">
                                            <span className="font-bold text-slate-900">Languages:</span> JavaScript, TypeScript, Python, Java, C++<br/>
                                            <span className="font-bold text-slate-900">Technologies:</span> React, Node.js, Next.js, PostgreSQL, Docker, AWS<br/>
                                            <span className="font-bold text-slate-900">Tools:</span> Git, Webpack, Figma, Jira
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">Google Standard</h3>
                                    <p className="text-sm text-slate-500">Clean, professional, and strictly formatted for maximum ATS readability.</p>
                                </div>

                                {/* Startup Clean */}
                                <div 
                                    onClick={() => startNewBuilder('startup-clean')}
                                    className="group cursor-pointer"
                                >
                                    <div className="aspect-[1/1.4] bg-white border border-slate-200 rounded-xl mb-4 shadow-sm group-hover:shadow-xl group-hover:border-indigo-400 transition-all flex relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
                                        <div className="p-4 pl-5 w-full flex flex-col">
                                            <div className="mb-4">
                                                <div className="text-[14px] font-black text-slate-900 tracking-tight leading-none">ALEX REED</div>
                                                <div className="text-[6px] font-bold text-indigo-600 mt-1 uppercase tracking-wider">Full Stack Developer</div>
                                                <div className="text-[5px] text-slate-500 mt-1 flex gap-1 font-medium">
                                                    <span>alex@example.com</span>•<span>github.com/alex</span>
                                                </div>
                                            </div>
                                            
                                            <div className="mb-3">
                                                <div className="text-[6px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                                    <div className="w-1 h-1 bg-indigo-500 rounded-full"></div> Experience
                                                </div>
                                                <div className="mb-2 border-l border-slate-200 pl-2 ml-0.5">
                                                    <div className="text-[7px] font-bold text-slate-800">Senior Frontend Engineer</div>
                                                    <div className="text-[5px] text-slate-500 mb-1 font-medium"><span className="text-indigo-600">TechCorp</span> • 2021 - Present</div>
                                                    <div className="text-[5.5px] text-slate-600 leading-tight">
                                                        • Architected modern React application using Next.js.<br/>
                                                        • Improved Core Web Vitals score by 40 points.<br/>
                                                        • Led migration from legacy SPA to SSR rendering.
                                                    </div>
                                                </div>
                                                <div className="border-l border-slate-200 pl-2 ml-0.5 pb-2">
                                                    <div className="text-[7px] font-bold text-slate-800">Web Developer</div>
                                                    <div className="text-[5px] text-slate-500 mb-1 font-medium"><span className="text-indigo-600">WebStudio</span> • 2019 - 2021</div>
                                                    <div className="text-[5.5px] text-slate-600 leading-tight">
                                                        • Built scalable e-commerce frontend platforms.
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="text-[6px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                                    <div className="w-1 h-1 bg-indigo-500 rounded-full"></div> Skills
                                                </div>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    <span className="px-1.5 py-0.5 bg-slate-100/80 border border-slate-200 text-slate-700 text-[4.5px] font-bold rounded-full uppercase tracking-wider">React</span>
                                                    <span className="px-1.5 py-0.5 bg-slate-100/80 border border-slate-200 text-slate-700 text-[4.5px] font-bold rounded-full uppercase tracking-wider">TypeScript</span>
                                                    <span className="px-1.5 py-0.5 bg-slate-100/80 border border-slate-200 text-slate-700 text-[4.5px] font-bold rounded-full uppercase tracking-wider">Node.js</span>
                                                    <span className="px-1.5 py-0.5 bg-slate-100/80 border border-slate-200 text-slate-700 text-[4.5px] font-bold rounded-full uppercase tracking-wider">Tailwind</span>
                                                    <span className="px-1.5 py-0.5 bg-slate-100/80 border border-slate-200 text-slate-700 text-[4.5px] font-bold rounded-full uppercase tracking-wider">GraphQL</span>
                                                    <span className="px-1.5 py-0.5 bg-slate-100/80 border border-slate-200 text-slate-700 text-[4.5px] font-bold rounded-full uppercase tracking-wider">AWS</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">Startup Clean</h3>
                                    <p className="text-sm text-slate-500">Modern SaaS vibe with distinct accent sections and subtle badge designs.</p>
                                </div>

                                {/* Creative Pro */}
                                <div 
                                    onClick={() => startNewBuilder('creative-pro')}
                                    className="group cursor-pointer"
                                >
                                    <div className="aspect-[1/1.4] bg-white border border-slate-200 rounded-xl mb-4 shadow-sm group-hover:shadow-xl group-hover:border-indigo-400 transition-all flex overflow-hidden">
                                        <div className="w-[38%] h-full bg-slate-900 p-3 flex flex-col text-slate-300">
                                            <div className="w-8 h-8 rounded-full bg-indigo-500 mb-3 mx-auto flex items-center justify-center text-white font-bold text-[12px]">AR</div>
                                            
                                            <div className="mb-4">
                                                <div className="text-[5.5px] font-bold text-white uppercase tracking-wider mb-1.5 border-b border-slate-700 pb-1">Contact</div>
                                                <div className="text-[4.5px] space-y-1">
                                                    <div>alex@example.com</div>
                                                    <div>(555) 123-4567</div>
                                                    <div>San Francisco, CA</div>
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <div className="text-[5.5px] font-bold text-white uppercase tracking-widest mb-1.5 border-b border-white/20 pb-1">Skills</div>
                                                <div className="text-[4.5px] space-y-1 font-medium text-white/90">
                                                    <div className="tracking-wide">UI/UX Design</div>
                                                    <div className="tracking-wide">React & Tailwind</div>
                                                    <div className="tracking-wide">Framer Motion</div>
                                                    <div className="tracking-wide">Adobe Suite</div>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-4">
                                                <div className="text-[5.5px] font-bold text-white uppercase tracking-widest mb-1.5 border-b border-white/20 pb-1">Education</div>
                                                <div className="text-[4.5px] space-y-1 text-white/90">
                                                    <div className="text-white/50 font-bold">2016-2020</div>
                                                    <div className="font-bold text-[5px]">B.A. Design</div>
                                                    <div>State University</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-[62%] h-full bg-slate-50 p-3 flex flex-col">
                                            <div className="mb-3">
                                                <div className="text-[12px] font-black text-slate-900 leading-none tracking-tighter">ALEX REED</div>
                                                <div className="text-[5.5px] font-extrabold text-indigo-600 mt-1 uppercase tracking-widest">Creative Developer</div>
                                            </div>
                                            
                                            <div className="mb-4">
                                                <div className="text-[5.5px] font-bold text-slate-900 uppercase tracking-widest mb-1.5">Profile</div>
                                                <div className="text-[4.5px] text-slate-600 leading-relaxed font-medium">
                                                    Passionate developer with an eye for design. Specializing in creating beautiful, interactive web experiences that merge form and function seamlessly.
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <div className="text-[5.5px] font-bold text-slate-900 uppercase tracking-widest mb-2 flex items-center gap-1">
                                                    Experience <span className="h-[1px] flex-1 bg-slate-200 ml-1"></span>
                                                </div>
                                                <div className="mb-2 relative">
                                                    <div className="absolute left-[-5px] top-1 w-[2px] h-[15px] bg-indigo-500/30"></div>
                                                    <div className="text-[6px] font-bold text-slate-800 leading-tight">Lead Designer</div>
                                                    <div className="text-[4.5px] text-indigo-600 font-bold mb-0.5 flex justify-between">
                                                        <span>StudioX</span>
                                                        <span className="text-slate-400 bg-slate-200/50 px-1 rounded">2021 - Present</span>
                                                    </div>
                                                    <div className="text-[5px] text-slate-600 leading-tight">
                                                        • Led redesign of core products, improving retention by 25%.<br/>
                                                        • Established design system used by 5 product teams.
                                                    </div>
                                                </div>
                                                <div className="relative">
                                                    <div className="absolute left-[-5px] top-1 w-[2px] h-[10px] bg-indigo-500/30"></div>
                                                    <div className="text-[6px] font-bold text-slate-800 leading-tight">UI Developer</div>
                                                    <div className="text-[4.5px] text-indigo-600 font-bold mb-0.5 flex justify-between">
                                                        <span>Creativ</span>
                                                        <span className="text-slate-400 bg-slate-200/50 px-1 rounded">2018 - 2021</span>
                                                    </div>
                                                    <div className="text-[5px] text-slate-600 leading-tight">
                                                        • Prototyped and built marketing sites for major clients.
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">Creative Pro</h3>
                                    <p className="text-sm text-slate-500">Dual-column highly stylized layout for a bold, elegant statement.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {view === 'list' && (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar"
                    >
                        <div className="max-w-5xl mx-auto w-full">
                            <div className="flex justify-between items-end mb-10">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 mb-2">My Saved Resumes</h2>
                                    <p className="text-slate-500">Manage and edit your previously created resumes.</p>
                                </div>
                                <button
                                    onClick={() => setView('templates')}
                                    className="flex items-center gap-2 px-6 py-3 font-bold bg-indigo-600 text-white hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
                                >
                                    <Plus size={18} /> Create New
                                </button>
                            </div>

                            {isLoading && resumes.length === 0 ? (
                                <div className="text-center py-20 text-slate-500 font-bold animate-pulse">Loading your resumes...</div>
                            ) : resumes.length === 0 ? (
                                <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl">
                                    <FileText size={48} className="mx-auto text-slate-300 mb-4" />
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">No resumes yet</h3>
                                    <p className="text-slate-500 mb-6">You haven't created any resumes yet. Get started by picking a template.</p>
                                    <button
                                        onClick={() => setView('templates')}
                                        className="inline-flex items-center gap-2 px-6 py-3 font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl transition-all"
                                    >
                                        Browse Templates
                                    </button>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {resumes.map(resume => (
                                        <div key={resume.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                                    <FileText size={24} />
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md uppercase tracking-wider">
                                                    {resume.data?.templateId?.replace('-', ' ') || 'Resume'}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 mb-1">{resume.title || 'Untitled Resume'}</h3>
                                            <p className="text-xs text-slate-500 mb-6">Last updated: {new Date(resume.updatedAt).toLocaleDateString()}</p>
                                            
                                            <div className="mt-auto flex gap-3">
                                                <button
                                                    onClick={() => loadResumeById(resume.id)}
                                                    className="flex-1 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        const { getActiveToken } = await import('@/app/lib/auth-storage');
                                                        fetch(`${process.env.NEXT_PUBLIC_API_URL}/resume/${resume.id}`, {
                                                            method: 'DELETE',
                                                            headers: { 'Authorization': `Bearer ${getActiveToken()}` }
                                                        }).then(() => loadResumes());
                                                    }}
                                                    className="p-2 border border-slate-200 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}


                {view === 'builder' && (
                    <motion.div
                        key="builder"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex-1 flex overflow-hidden z-10"
                    >
                        {/* Left Panel: Editor */}
                        <div className="w-1/2 md:w-[45%] h-full border-r border-slate-200 bg-white overflow-y-auto custom-scrollbar">
                            <ResumeForm data={data} onChange={setData} />
                        </div>

                        {/* Right Panel: Preview */}
                        <div className="w-1/2 md:w-[55%] h-full bg-slate-100/50 overflow-hidden flex items-center justify-center relative">
                            <div className="absolute inset-0 overflow-auto p-8 custom-scrollbar flex justify-center">
                                <div className="scale-[0.85] origin-top shadow-2xl rounded-sm">
                                    <ResumePreview ref={printRef} data={data} />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {view === 'scanner' && (
                    <motion.div
                        key="scanner"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50 z-10"
                    >
                        <ATSScanner />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
