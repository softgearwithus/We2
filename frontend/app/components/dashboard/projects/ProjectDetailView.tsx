'use client';

import { motion } from 'framer-motion';
import { ProjectType } from '@/app/lib/ProjectData';
import { submitProjectLab } from '@/app/lib/project-labs';
import { ChevronLeft, Code2, Clock, Github, ExternalLink, CheckCircle2, BookOpen, AlertCircle, Database, Layout, Server, Wrench, Layers, ListChecks, FileText, Figma, Video, Briefcase } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSectionUsage } from '@/app/hooks/useSectionUsage';
import UsageUpgradeGate from '@/app/components/shared/UsageUpgradeGate';

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
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const { remainingLabel, isLimited, isFreePlan } = useSectionUsage('project_labs');

    useEffect(() => {
        const stored = localStorage.getItem('emble_completed_projects');
        if (stored) {
            try {
                const projects = JSON.parse(stored);
                if (projects.includes(project.id)) {
                    setSubmitted(true);
                }
            } catch (e) {
                console.error(e);
            }
        }
        setIsInitialized(true);
    }, [project.id]);

    const handleSubmit = async () => {
        if (!repoUrl && !submitted) return;
        const { getActiveToken } = await import('@/app/lib/auth-storage');
        const token = getActiveToken();
        if (!token) {
            setSubmitError('Please sign in to submit your work.');
            return;
        }
        setSubmitError(null);
        setIsSubmitting(true);
        try {
            await submitProjectLab(token, project.id, { repositoryUrl: repoUrl });
            setSubmitted(true);

            const stored = localStorage.getItem('emble_completed_projects');
            let projects = [];
            if (stored) {
                try {
                    projects = JSON.parse(stored);
                } catch (e) {
                    projects = [];
                }
            }
            if (!projects.includes(project.id)) {
                projects.push(project.id);
                localStorage.setItem('emble_completed_projects', JSON.stringify(projects));
            }
        } catch (error: any) {
            setSubmitError(error?.message || 'Submission failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-full h-full flex flex-col relative"
        >
            {isLimited && (
                <UsageUpgradeGate message="Upgrade to continue your Project Labs work." />
            )}
            {/* Header breadcrumb style */}
            <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-4 text-sm font-medium w-fit border border-transparent hover:border-slate-200 px-3 py-1.5 rounded-lg active:bg-slate-50">
                <ChevronLeft size={16} /> Back to Roadmap
            </button>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content (Left) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-slate-100/60 rounded-[2rem] p-8 shadow-sm">

                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${project.complexity === 'Beginner' ? 'bg-emerald-50 text-emerald-600' : project.complexity === 'Intermediate' ? 'bg-orange-50 text-orange-600' : 'bg-rose-50 text-rose-600'
                                        }`}>
                                        {project.complexity}
                                    </span>
                                    <span className="flex items-center text-xs text-slate-500 gap-1.5 font-medium">
                                        <Clock size={14} /> {project.estimatedTime}
                                    </span>
                                </div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">{project.title}</h1>
                                {isFreePlan && (
                                    <div className={`mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${isLimited ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
                                        Free plan time left: {remainingLabel}
                                    </div>
                                )}
                            </div>
                            <div className="p-4 bg-slate-50/50 rounded-2xl text-slate-400 border border-slate-200/50 shadow-sm shrink-0">
                                <Code2 size={28} />
                            </div>
                        </div>

                        {/* Resume Booster Banner */}
                        <div className="mb-8 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100/50 rounded-2xl p-4 flex items-center gap-4 shadow-sm relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 text-emerald-100/50">
                                <Briefcase size={80} />
                            </div>
                            <div className="w-10 h-10 shrink-0 rounded-full bg-white shadow-sm flex items-center justify-center text-emerald-600 border border-emerald-50 z-10">
                                <Briefcase size={18} />
                            </div>
                            <div className="z-10">
                                <h3 className="font-bold text-emerald-950 text-sm mb-0.5">🚀 Resume Booster</h3>
                                <p className="text-xs text-emerald-900/80 font-medium leading-relaxed">
                                    Completing this adds real-world weight to your portfolio. It gives you strong, verifiable talking points for technical interviews.
                                </p>
                            </div>
                        </div>

                        <p className="text-slate-600 leading-relaxed mb-10 text-sm md:text-base font-medium">{project.description}</p>

                        {/* Technical Specs Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                            {project.details.frontend && (
                                <div className="p-4 bg-white border border-slate-100 shadow-sm rounded-2xl flex items-start gap-4 hover:border-slate-200 transition-colors">
                                    <div className="p-2 bg-slate-50 rounded-xl shrink-0">
                                        <Layout size={20} className="text-slate-700" />
                                    </div>
                                    <div>
                                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Frontend</div>
                                        <div className="text-sm font-bold text-slate-900">{project.details.frontend}</div>
                                    </div>
                                </div>
                            )}
                            {project.details.backend && (
                                <div className="p-4 bg-white border border-slate-100 shadow-sm rounded-2xl flex items-start gap-4 hover:border-slate-200 transition-colors">
                                    <div className="p-2 bg-slate-50 rounded-xl shrink-0">
                                        <Server size={20} className="text-slate-500" />
                                    </div>
                                    <div>
                                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Backend</div>
                                        <div className="text-sm font-bold text-slate-900">{project.details.backend}</div>
                                    </div>
                                </div>
                            )}
                            {project.details.database && (
                                <div className="p-4 bg-white border border-slate-100 shadow-sm rounded-2xl flex items-start gap-4 hover:border-slate-200 transition-colors">
                                    <div className="p-2 bg-slate-50 rounded-xl shrink-0">
                                        <Database size={20} className="text-slate-500" />
                                    </div>
                                    <div>
                                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Database</div>
                                        <div className="text-sm font-bold text-slate-900">{project.details.database}</div>
                                    </div>
                                </div>
                            )}
                            {project.details.architecture && (
                                <div className="p-4 bg-white border border-slate-100 shadow-sm rounded-2xl flex items-start gap-4 hover:border-slate-200 transition-colors">
                                    <div className="p-2 bg-slate-50 rounded-xl shrink-0">
                                        <Layers size={20} className="text-slate-600" />
                                    </div>
                                    <div>
                                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Architecture</div>
                                        <div className="text-sm font-bold text-slate-900">{project.details.architecture}</div>
                                    </div>
                                </div>
                            )}
                        </div>


                        <div className="space-y-8">
                            <section>
                                <h3 className="text-sm font-bold text-slate-800 tracking-wide mb-3 flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                                        <AlertCircle size={16} className="text-amber-500" />
                                    </div>
                                    Problem Statement
                                </h3>
                                <div className="p-5 bg-slate-50/50 border border-slate-100/80 rounded-2xl text-slate-700 text-sm leading-relaxed shadow-sm">
                                    {project.readme.problem}
                                </div>
                            </section>

                            <section>
                                <h3 className="text-sm font-bold text-slate-800 tracking-wide mb-3 flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                                        <ListChecks size={16} className="text-slate-700" />
                                    </div>
                                    Implementation Roadmap
                                </h3>
                                <div className="space-y-3 pl-2">
                                    {project.tasks.map((task, idx) => (
                                        <div key={task.id} className="flex items-center gap-4 p-4 bg-white border border-slate-100/80 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-slate-50 transition-all">
                                            <div className="w-7 h-7 shrink-0 rounded-full bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-700 border border-slate-200/50">
                                                {idx + 1}
                                            </div>
                                            <span className="text-sm font-medium text-slate-700 leading-tight">{task.title}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section>
                                <h3 className="text-sm font-bold text-slate-800 tracking-wide mb-3 flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                                        <CheckCircle2 size={16} className="text-emerald-500" />
                                    </div>
                                    Objectives & Outcomes
                                </h3>
                                <div className="p-6 bg-slate-50/50 border border-slate-100/80 rounded-2xl space-y-4 shadow-sm">
                                    <p className="text-slate-700 text-sm font-medium leading-relaxed">{project.readme.solution}</p>
                                    <ul className="space-y-3 pt-2">
                                        {project.readme.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                                                <div className="min-w-[6px] h-[6px] mt-2 rounded-full bg-emerald-400" />
                                                <span className="leading-relaxed">{feature}</span>
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
                    <div className="bg-white border border-slate-100/60 rounded-[2rem] p-7 shadow-sm">
                        <h4 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
                            <Wrench size={16} className="text-slate-400" />
                            Required Tools
                        </h4>
                        <div className="flex flex-wrap gap-2 mb-8">
                            {project.details.tools.map(tool => (
                                <span key={tool} className="px-3 py-1.5 rounded-lg bg-blue-50/50 border border-blue-100/50 text-blue-700 text-xs font-bold shadow-sm">
                                    {tool}
                                </span>
                            ))}
                        </div>

                        <h4 className="font-bold text-slate-900 text-sm mb-4">Prerequisites</h4>
                        <ul className="space-y-3">
                            {project.details.prerequisites.map((req, idx) => (
                                <li key={idx} className="text-xs font-bold text-slate-600 flex items-center gap-3 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/80">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                    {req}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Skills Card */}
                    <div className="bg-white border border-slate-100/60 rounded-[2rem] p-7 shadow-sm">
                        <h4 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
                            <Layers size={16} className="text-emerald-400" />
                            You Will Learn
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {project.skills.map(skill => (
                                <span key={skill} className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 text-[11px] font-bold shadow-sm uppercase tracking-wider">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Submission Card */}
                    <div className="bg-white border border-slate-100/80 rounded-[2rem] p-7 shadow-md relative overflow-hidden group">
                        {!submitted ? (
                            <>
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-slate-700 via-slate-500 to-pink-500"></div>
                                <h4 className="font-bold text-slate-900 text-sm mb-5">Submit Your Work</h4>
                                <div className="space-y-5">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-2 block">Source Code Repository</label>
                                        <div className="relative">
                                            <Github size={16} className="absolute left-3.5 top-3 text-slate-400" />
                                            <input
                                                type="text"
                                                value={repoUrl}
                                                onChange={(e) => setRepoUrl(e.target.value)}
                                                placeholder="https://github.com/..."
                                                disabled={isLimited}
                                                className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-11 text-sm text-slate-700 transition-all font-medium placeholder:text-slate-400 placeholder:font-normal ${isLimited ? 'opacity-60 cursor-not-allowed' : 'focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400'}`}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-2 block">Live Demo <span className="text-slate-400 font-normal">(Optional)</span></label>
                                        <div className="relative">
                                            <ExternalLink size={16} className="absolute left-3.5 top-3 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder="https://my-project.vercel.app"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-11 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-all font-medium placeholder:text-slate-400 placeholder:font-normal"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting || (!repoUrl && !submitted) || isLimited}
                                        className="w-full py-3 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                Verifying...
                                            </>
                                        ) : (
                                            'Submit Solution'
                                        )}
                                    </button>
                                    {submitError && (
                                        <div className="text-xs font-medium text-rose-600 bg-rose-50 border border-rose-100 p-2.5 rounded-lg">
                                            {submitError}
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-6 px-4">
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 to-teal-400"></div>
                                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5 text-emerald-500 shadow-inner">
                                    <CheckCircle2 size={40} />
                                </div>
                                <h5 className="font-bold text-slate-900 text-lg mb-2">Great Job!</h5>
                                <p className="text-sm text-slate-500 mb-6 leading-relaxed font-medium">Your project has been tracked. This verifies your skill for prospective employers.</p>
                                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-50 to-amber-50 text-amber-700 border border-yellow-200/60 rounded-full text-xs font-black shadow-sm tracking-wide uppercase">
                                    🎉 +50 XP Earned
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 rounded-[2rem] p-7 text-white shadow-xl shadow-slate-900/10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-slate-500/20 rounded-lg">
                                <BookOpen size={20} className="text-slate-300" />
                            </div>
                            <h4 className="font-bold text-base">Suggested Resources</h4>
                        </div>
                        <ul className="space-y-4">
                            {project.details.resources.map((res, idx) => (
                                <li key={idx} className="group flex items-start gap-3.5 text-sm text-slate-300 hover:text-white cursor-pointer transition-colors">
                                    <div className="mt-0.5 text-slate-400 group-hover:text-slate-300 transition-colors bg-slate-500/10 p-1.5 rounded-md">
                                        <ResourceIcon type={res.type} />
                                    </div>
                                    <div>
                                        <div className="font-medium group-hover:underline decoration-2 underline-offset-4 decoration-slate-400/50 mb-0.5">{res.title}</div>
                                        {res.url !== '#' && <div className="text-[11px] text-slate-500 truncate max-w-[200px] font-mono">{res.url}</div>}
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
