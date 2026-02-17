'use client';

import { motion } from 'framer-motion';
import { ProjectType } from '@/app/lib/ProjectData';
import { ChevronLeft, Code2, Clock, Github, ExternalLink, CheckCircle2, BookOpen, AlertCircle, Database, Layout, Server, Wrench, Layers, ListChecks, FileText, Figma, Video } from 'lucide-react';
import { useState } from 'react';

interface ProjectDetailViewProps {
    project: ProjectType;
    onBack: () => void;
}

const ResourceIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'design': return <Figma size={16} />;
        case 'video': return <Video size={16} />;
        case 'docs': return <FileText size={16} />;
        default: return <BookOpen size={16} />;
    }
};

export default function ProjectDetailView({ project, onBack }: ProjectDetailViewProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [repoUrl, setRepoUrl] = useState('');

    const handleSubmit = () => {
        if (!repoUrl) return;
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitted(true);
        }, 1500);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-full h-full flex flex-col"
        >
            {/* Header breadcrumb style */}
            <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-4 text-sm font-medium w-fit">
                <ChevronLeft size={16} /> Back to Roadmap
            </button>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content (Left) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase border ${project.complexity === 'Beginner' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-slate-50 text-slate-600 border-slate-100'
                                        }`}>
                                        {project.complexity}
                                    </span>
                                    <span className="flex items-center text-xs text-slate-500 gap-1">
                                        <Clock size={12} /> {project.estimatedTime}
                                    </span>
                                </div>
                                <h1 className="text-2xl font-bold text-slate-900">{project.title}</h1>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg text-slate-400">
                                <Code2 size={24} />
                            </div>
                        </div>

                        <p className="text-slate-600 leading-relaxed mb-8 text-sm md:text-base">{project.description}</p>

                        {/* Technical Specs Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            {project.details.frontend && (
                                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg flex items-start gap-3">
                                    <Layout size={18} className="text-indigo-500 mt-0.5" />
                                    <div>
                                        <div className="text-xs font-bold text-indigo-400 uppercase">Frontend</div>
                                        <div className="text-sm font-semibold text-indigo-900">{project.details.frontend}</div>
                                    </div>
                                </div>
                            )}
                            {project.details.backend && (
                                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-start gap-3">
                                    <Server size={18} className="text-slate-500 mt-0.5" />
                                    <div>
                                        <div className="text-xs font-bold text-slate-400 uppercase">Backend</div>
                                        <div className="text-sm font-semibold text-slate-900">{project.details.backend}</div>
                                    </div>
                                </div>
                            )}
                            {project.details.database && (
                                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-start gap-3">
                                    <Database size={18} className="text-slate-500 mt-0.5" />
                                    <div>
                                        <div className="text-xs font-bold text-slate-400 uppercase">Database</div>
                                        <div className="text-sm font-semibold text-slate-900">{project.details.database}</div>
                                    </div>
                                </div>
                            )}
                            {project.details.architecture && (
                                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-start gap-3">
                                    <Layers size={18} className="text-slate-500 mt-0.5" />
                                    <div>
                                        <div className="text-xs font-bold text-slate-400 uppercase">Architecture</div>
                                        <div className="text-sm font-semibold text-slate-900">{project.details.architecture}</div>
                                    </div>
                                </div>
                            )}
                        </div>


                        {/* Sections */}
                        <div className="space-y-8">
                            <section>
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                                    <AlertCircle size={16} className="text-amber-500" />
                                    Problem Statement
                                </h3>
                                <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg text-slate-700 text-sm leading-relaxed">
                                    {project.readme.problem}
                                </div>
                            </section>

                            <section>
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                                    <ListChecks size={16} className="text-indigo-500" />
                                    Implementation Roadmap
                                </h3>
                                <div className="space-y-3">
                                    {project.tasks.map((task, idx) => (
                                        <div key={task.id} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 border border-slate-200">
                                                {idx + 1}
                                            </div>
                                            <span className="text-sm font-medium text-slate-700">{task.title}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section>
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                                    <CheckCircle2 size={16} className="text-emerald-500" />
                                    Objectives & Outcomes
                                </h3>
                                <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg space-y-3">
                                    <p className="text-slate-700 text-sm">{project.readme.solution}</p>
                                    <ul className="space-y-2">
                                        {project.readme.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                                                <div className="min-w-[4px] h-[4px] mt-2 rounded-full bg-slate-400" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>

                {/* Sidebar (Right) */}
                <div className="space-y-6">
                    {/* Tools & Prerequisites Card */}
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                        <h4 className="font-bold text-slate-900 text-sm mb-4">Required Tools</h4>
                        <div className="flex flex-wrap gap-2 mb-6">
                            {project.details.tools.map(tool => (
                                <span key={tool} className="px-2.5 py-1 rounded-md bg-blue-50 border border-blue-100 text-blue-700 text-xs font-medium shadow-sm flex items-center gap-1">
                                    <Wrench size={10} /> {tool}
                                </span>
                            ))}
                        </div>

                        <h4 className="font-bold text-slate-900 text-sm mb-3">Prerequisites</h4>
                        <ul className="space-y-2">
                            {project.details.prerequisites.map((req, idx) => (
                                <li key={idx} className="text-xs text-slate-600 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                    {req}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Skills Card */}
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                        <h4 className="font-bold text-slate-900 text-sm mb-4">You Will Learn</h4>
                        <div className="flex flex-wrap gap-2">
                            {project.skills.map(skill => (
                                <span key={skill} className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-600 text-xs font-medium shadow-sm">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Submission Card */}
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative overflow-hidden">
                        {!submitted ? (
                            <>
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                                <h4 className="font-bold text-slate-900 text-sm mb-4">Submission</h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1.5 block">Source Code</label>
                                        <div className="relative">
                                            <Github size={16} className="absolute left-3 top-2.5 text-slate-400" />
                                            <input
                                                type="text"
                                                value={repoUrl}
                                                onChange={(e) => setRepoUrl(e.target.value)}
                                                placeholder="https://github.com/username/repo"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1.5 block">Live Demo <span className="text-slate-400 font-normal">(Optional)</span></label>
                                        <div className="relative">
                                            <ExternalLink size={16} className="absolute left-3 top-2.5 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder="https://my-project.vercel.app"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting || !repoUrl}
                                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                Verifying...
                                            </>
                                        ) : (
                                            'Submit Solution'
                                        )}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500">
                                    <CheckCircle2 size={32} />
                                </div>
                                <h5 className="font-bold text-slate-900 mb-2">Great Job!</h5>
                                <p className="text-xs text-slate-500 mb-4 px-4">Your project has been submitted successfully. Our AI mentor will review it shortly.</p>
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full text-xs font-bold">
                                    +50 XP Earned
                                </div>
                            </div>
                        )}
                    </div>




                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white shadow-md">
                        <div className="flex items-center gap-3 mb-4">
                            <BookOpen size={20} className="text-indigo-300" />
                            <h4 className="font-bold text-sm">Resources</h4>
                        </div>
                        <ul className="space-y-3">
                            {project.details.resources.map((res, idx) => (
                                <li key={idx} className="group flex items-start gap-3 text-sm text-slate-300 hover:text-white cursor-pointer transition-colors">
                                    <div className="mt-0.5 text-indigo-400 group-hover:text-indigo-300 transition-colors">
                                        <ResourceIcon type={res.type} />
                                    </div>
                                    <div>
                                        <div className="font-medium group-hover:underline decoration-1 underline-offset-4 decoration-indigo-400">{res.title}</div>
                                        {res.url !== '#' && <div className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px]">{res.url}</div>}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
