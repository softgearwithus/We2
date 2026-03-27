'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { DomainType, TechStack, ProjectType, PROJECT_DOMAINS } from '@/app/lib/ProjectData';
import { ChevronLeft, Layers } from 'lucide-react';

import DomainSelector, { ProjectLabDomainOption } from '@/app/components/dashboard/projects/DomainSelector';
import SkillRoadmap from '@/app/components/dashboard/projects/SkillRoadmap';
import ProjectDetailView from '@/app/components/dashboard/projects/ProjectDetailView';
import { fetchProjectLabDomains, fetchProjectLabProgress, fetchProjectLabs } from '@/app/lib/project-labs';

export default function DevGenesisPage() {
    const [stage, setStage] = useState<'domain' | 'projects'>('domain');
    const [selectedDomain, setSelectedDomain] = useState<DomainType | null>(null);
    const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null);
    const [domainOptions, setDomainOptions] = useState<ProjectLabDomainOption[]>([]);
    const [projects, setProjects] = useState<ProjectType[]>([]);
    const [completedProjectIds, setCompletedProjectIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const domainLookup = useMemo(() => {
        const map = new Map<string, DomainType>();
        PROJECT_DOMAINS.forEach((domain) => map.set(domain.id, domain));
        return map;
    }, []);

    // --- Navigation Handlers ---
    const handleDomainSelect = (domain: DomainType) => {
        setSelectedDomain(domain);
        setSelectedProject(null);
        setStage('projects');
    };

    const handleProjectSelect = (project: ProjectType) => {
        setSelectedProject(project);
    };

    const buildDomainStack = (domain: DomainType, domainProjects: ProjectType[]): TechStack => {
        const byComplexity = (level: ProjectType['complexity']) =>
            domainProjects.filter((project) => project.complexity === level);
        const popularity = domain.stacks.length
            ? Math.round(domain.stacks.reduce((total, stack) => total + stack.popularity, 0) / domain.stacks.length)
            : 0;

        return {
            id: `${domain.id}_all`,
            name: domain.title,
            icon: domain.icon,
            description: domain.description,
            popularity,
            difficulty: 'Medium',
            tiers: {
                beginner: byComplexity('Beginner'),
                intermediate: byComplexity('Intermediate'),
                advanced: byComplexity('Advanced')
            }
        };
    };

    useEffect(() => {
        const loadDomains = async () => {
            try {
                setIsLoading(true);
                setLoadError(null);
                const summaries = await fetchProjectLabDomains();
                const options: ProjectLabDomainOption[] = summaries
                    .map((summary) => {
                        const domain = domainLookup.get(summary.domainId);
                        if (!domain) return null;
                        return {
                            id: domain.id,
                            title: domain.title,
                            description: domain.description,
                            icon: domain.icon,
                            count: summary.count,
                            disabled: summary.count === 0,
                        };
                    })
                    .filter(Boolean) as ProjectLabDomainOption[];

                setDomainOptions(options);
            } catch (error: any) {
                setLoadError(error?.message || 'Failed to load domains.');
            } finally {
                setIsLoading(false);
            }
        };

        loadDomains();
    }, [domainLookup]);

    useEffect(() => {
        if (!selectedDomain) return;
        const loadProjects = async () => {
            try {
                setIsLoading(true);
                setLoadError(null);
                const data = await fetchProjectLabs(selectedDomain.id);
                setProjects(data as ProjectType[]);
            } catch (error: any) {
                setLoadError(error?.message || 'Failed to load projects.');
            } finally {
                setIsLoading(false);
            }
        };

        loadProjects();
    }, [selectedDomain]);

    useEffect(() => {
        const loadProgress = async () => {
            const { getActiveToken } = await import('@/app/lib/auth-storage');
            const token = getActiveToken();
            if (!token) return;
            try {
                const progress = await fetchProjectLabProgress(token);
                setCompletedProjectIds(progress.completedProjectIds || []);
            } catch {
                return;
            }
        };
        loadProgress();
    }, []);

    // Back navigation
    const goBack = () => {
        if (selectedProject) {
            setSelectedProject(null);
            return;
        }
        if (stage === 'projects') {
            setStage('domain');
            setSelectedDomain(null);
            setProjects([]);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-900">
            <div className="max-w-7xl mx-auto h-full flex flex-col space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        {stage !== 'domain' && (
                            <button
                                onClick={goBack}
                                className="p-2 -ml-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
                            >
                                <ChevronLeft size={20} />
                            </button>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                <Layers className="text-slate-800" size={24} />
                                Project Labs
                            </h1>
                            <p className="text-slate-500 text-sm">Build real-world applications and boost your portfolio.</p>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-h-[500px]">
                    <AnimatePresence mode="wait">
                        {selectedProject ? (
                            <ProjectDetailView key="project" project={selectedProject} onBack={() => setSelectedProject(null)} />
                        ) : stage === 'domain' ? (
                            <>
                                {loadError && (
                                    <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                                        {loadError}
                                    </div>
                                )}
                                <DomainSelector
                                    key="domain"
                                    domains={domainOptions}
                                    onSelect={(domain) => {
                                        const selected = domainLookup.get(domain.id);
                                        if (selected) {
                                            handleDomainSelect(selected);
                                        }
                                    }}
                                />
                            </>
                        ) : (
                            selectedDomain && (
                                <SkillRoadmap
                                    key="projects"
                                    stack={buildDomainStack(selectedDomain, projects)}
                                    onSelectProject={handleProjectSelect}
                                    completedProjectIds={completedProjectIds}
                                />
                            )
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
