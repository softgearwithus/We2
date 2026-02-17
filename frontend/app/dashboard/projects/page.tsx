'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { DomainType, TechStack, ProjectType } from '@/app/lib/ProjectData';
import { ChevronLeft, BarChart2, Layout, Layers } from 'lucide-react';

import DomainSelector from '@/app/components/dashboard/projects/DomainSelector';
import StackSelector from '@/app/components/dashboard/projects/StackSelector';
import SkillRoadmap from '@/app/components/dashboard/projects/SkillRoadmap';
import ProjectDetailView from '@/app/components/dashboard/projects/ProjectDetailView';
import StudentAnalytics from '@/app/components/dashboard/projects/StudentAnalytics';
import CareerPathfinder from '@/app/components/dashboard/projects/CareerPathfinder';

export default function DevGenesisPage() {
    const [viewMode, setViewMode] = useState<'projects' | 'analytics'>('projects');
    const [stage, setStage] = useState<'domain' | 'stack' | 'tier' | 'project' | 'pathfinder'>('domain');
    const [selectedDomain, setSelectedDomain] = useState<DomainType | null>(null);
    const [selectedStack, setSelectedStack] = useState<TechStack | null>(null);
    const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null);

    // --- Navigation Handlers ---
    const handleDomainSelect = (domain: DomainType) => {
        setSelectedDomain(domain);
        setStage('stack');
    };

    const handleStackSelect = (stack: TechStack) => {
        setSelectedStack(stack);
        setStage('tier');
    };

    const handleProjectSelect = (project: ProjectType) => {
        setSelectedProject(project);
    };

    // Back navigation
    const goBack = () => {
        if (selectedProject) {
            setSelectedProject(null);
            return;
        }
        if (stage === 'tier') {
            setStage('stack');
            setSelectedStack(null);
            return;
        }
        if (stage === 'stack') {
            setStage('domain');
            setSelectedDomain(null);
            return;
        }
        if (stage === 'pathfinder') {
            setStage('domain');
            return;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-900">
            <div className="max-w-7xl mx-auto h-full flex flex-col space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        {(stage !== 'domain' || viewMode === 'analytics') && (
                            <button
                                onClick={goBack}
                                className="p-2 -ml-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
                            >
                                <ChevronLeft size={20} />
                            </button>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                <Layers className="text-indigo-600" size={24} />
                                Project Labs
                            </h1>
                            <p className="text-slate-500 text-sm">Build real-world applications and boost your portfolio.</p>
                        </div>
                    </div>

                    {/* View Switcher - Tab Style */}
                    <div className="bg-slate-200/50 p-1 rounded-lg flex self-start md:self-auto">
                        <button
                            onClick={() => setViewMode('projects')}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${viewMode === 'projects' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-900/5' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Layout size={16} /> Projects
                        </button>
                        <button
                            onClick={() => setViewMode('analytics')}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${viewMode === 'analytics' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-900/5' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <BarChart2 size={16} /> Progress
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-h-[500px]">
                    <AnimatePresence mode="wait">
                        {viewMode === 'analytics' ? (
                            <StudentAnalytics key="analytics" />
                        ) : (
                            <>
                                {stage === 'domain' && (
                                    <>
                                        {/* Pathfinder Banner */}
                                        <div className="mb-8 p-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
                                            <div>
                                                <h2 className="text-xl font-bold mb-1">Total Beginner? Don't know where to start?</h2>
                                                <p className="text-indigo-100">Use our Career Pathfinder to discover the perfect coding path for you.</p>
                                            </div>
                                            <button
                                                onClick={() => setStage('pathfinder')}
                                                className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-bold shadow-sm hover:bg-slate-50 transition-colors whitespace-nowrap"
                                            >
                                                Launch Pathfinder
                                            </button>
                                        </div>
                                        <DomainSelector key="domain" onSelect={handleDomainSelect} />
                                    </>
                                )}

                                {stage === 'pathfinder' && (
                                    <CareerPathfinder onComplete={(domain) => {
                                        setSelectedDomain(domain);
                                        setStage('stack');
                                    }} />
                                )}

                                {stage === 'stack' && selectedDomain && (
                                    <StackSelector key="stack" domain={selectedDomain} onSelect={handleStackSelect} />
                                )}

                                {stage === 'tier' && selectedStack && !selectedProject && (
                                    <SkillRoadmap key="tier" stack={selectedStack} onSelectProject={handleProjectSelect} />
                                )}

                                {selectedProject && (
                                    <ProjectDetailView key="project" project={selectedProject} onBack={() => setSelectedProject(null)} />
                                )}
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
