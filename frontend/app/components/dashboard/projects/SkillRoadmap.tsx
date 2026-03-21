'use client';

import { motion } from 'framer-motion';
import { TechStack, ProjectType } from '@/app/lib/ProjectData';
import { Lock, Clock, CheckCircle2, ChevronUp, Briefcase } from 'lucide-react';
import { useState } from 'react';

interface SkillRoadmapProps {
    stack: TechStack;
    onSelectProject: (project: ProjectType) => void;
    completedProjectIds?: string[];
}

export default function SkillRoadmap({ stack, onSelectProject, completedProjectIds = [] }: SkillRoadmapProps) {
    const [expandedTiers, setExpandedTiers] = useState<{ [key: string]: boolean }>({
        beginner: false,
        intermediate: false,
        advanced: false
    });

    const toggleExpanded = (tier: string) => {
        setExpandedTiers(prev => ({ ...prev, [tier]: !prev[tier] }));
    };

    // Calculate completions per tier
    const getCompletedCount = (tierProjects: ProjectType[]) => {
        return tierProjects.filter(p => completedProjectIds.includes(p.id)).length;
    };

    const beginnerCompleted = getCompletedCount(stack.tiers.beginner);
    const intermediateCompleted = getCompletedCount(stack.tiers.intermediate);

    const isIntermediateUnlocked = beginnerCompleted >= 3;
    const isAdvancedUnlocked = intermediateCompleted >= 3;

    const renderProjectCard = (project: ProjectType, isLocked: boolean) => {
        const isCompleted = completedProjectIds.includes(project.id);

        return (
            <div
                key={project.id}
                onClick={() => !isLocked && onSelectProject(project)}
                className={`bg-white border ${isCompleted ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-100/50'} rounded-3xl p-6 transition-all duration-300 ${isLocked ? 'grayscale opacity-75 cursor-not-allowed' : 'hover:border-slate-200 hover:shadow-xl hover:shadow-slate-200 cursor-pointer'} group relative`}
            >
                {isCompleted && (
                    <div className="absolute top-4 right-4">
                        <CheckCircle2 size={20} className="text-emerald-500" />
                    </div>
                )}
                <div className="flex justify-between items-start mb-4">
                    <h4 className="font-bold text-slate-800 text-lg group-hover:text-slate-800 transition-colors line-clamp-1 pr-8 leading-tight">{project.title}</h4>
                    {!isCompleted && (
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${project.complexity === 'Beginner' ? 'bg-emerald-50 text-emerald-600' : project.complexity === 'Intermediate' ? 'bg-orange-50 text-orange-600' : 'bg-rose-50 text-rose-600'
                            }`}>
                            {project.complexity}
                        </span>
                    )}
                </div>
                <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-6 h-10">{project.description}</p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center text-xs font-semibold text-slate-400 gap-1.5">
                        <Clock size={14} />
                        {project.estimatedTime}
                    </div>
                    <div className="flex gap-1">
                        {!isLocked && (
                            <span className="text-xs font-bold text-slate-800 group-hover:bg-slate-800 group-hover:text-white px-3 py-1.5 rounded-full bg-slate-50/80 transition-all duration-300">Start Project</span>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderTier = (
        name: string,
        tierKey: 'beginner' | 'intermediate' | 'advanced',
        projects: ProjectType[],
        isUnlocked: boolean,
        unlockMessage: string,
        completedCount: number,
        requiredToUnlockNext: number = 3
    ) => {
        const isExpanded = expandedTiers[tierKey];
        const visibleProjects = isExpanded ? projects : projects.slice(0, 4);
        const hasMore = projects.length > 4;

        return (
            <div className={`relative ${!isUnlocked ? 'opacity-60' : ''}`}>
                <div className={`absolute -left-[41px] top-0 w-6 h-6 rounded-full border-4 z-10 flex items-center justify-center ${isUnlocked ? 'bg-white border-slate-800' : 'bg-slate-100 border-slate-300'}`}>
                    {!isUnlocked && <Lock size={10} className="text-slate-400" />}
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
                    <h3 className={`text-base font-bold flex items-center gap-2 ${isUnlocked ? 'text-slate-900' : 'text-slate-500'}`}>
                        {name}
                        {isUnlocked ? (
                            <span className="px-2 py-0.5 rounded-full bg-slate-50 text-slate-800 text-xs font-bold border border-slate-200">
                                {completedCount} / {projects.length} Completed
                            </span>
                        ) : (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-bold border border-slate-200">
                                Locked: {unlockMessage}
                            </span>
                        )}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {visibleProjects.map((project) => renderProjectCard(project, !isUnlocked))}

                        {/* View All / View Less Rendered as a Card */}
                        {isUnlocked && hasMore && (
                            <div
                                onClick={() => toggleExpanded(tierKey)}
                                className="bg-slate-50/50 border border-slate-200/50 rounded-3xl p-6 transition-all duration-300 hover:bg-slate-100/80 hover:shadow-lg hover:shadow-slate-200 cursor-pointer flex flex-col items-center justify-center text-center group min-h-[180px]"
                            >
                                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-800 mb-3 group-hover:scale-110 transition-transform">
                                    {isExpanded ? <ChevronUp size={24} /> : <span className="font-bold text-xl">+{projects.length - 4}</span>}
                                </div>
                                <h4 className="font-bold text-slate-900 mb-1">
                                    {isExpanded ? 'View Less' : 'More Projects'}
                                </h4>
                                <p className="text-sm text-slate-800/70 font-medium">
                                    {isExpanded ? 'Collapse list' : 'Click to view all'}
                                </p>
                            </div>
                        )}

                        {visibleProjects.length === 0 && (
                            <div className="col-span-full p-8 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
                                Projects coming soon for this tier...
                            </div>
                        )}
                    </div>
                </div>

                {isUnlocked && completedCount < requiredToUnlockNext && (
                    <div className="mt-4 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-100 p-2.5 rounded-lg inline-block">
                        Complete {requiredToUnlockNext - completedCount} more project{requiredToUnlockNext - completedCount > 1 ? 's' : ''} to unlock the next tier.
                    </div>
                )}
            </div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full h-full"
        >
            <h2 className="text-2xl font-black mb-8 text-slate-900 tracking-tight">
                Projects <span className="text-slate-300 font-normal mx-2">/</span> <span className="text-slate-800">{stack.name}</span>
            </h2>

            {/* Resume Banner */}
            <div className="mb-10 bg-gradient-to-r from-slate-50 to-slate-50 border border-slate-200/50 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-5 shadow-sm">
                <div className="w-12 h-12 shrink-0 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-800 border border-slate-50">
                    <Briefcase size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-slate-950 mb-1 leading-tight">Build Your Portfolio</h3>
                    <p className="text-sm text-slate-900/70 leading-relaxed font-medium">
                        These real-world projects are strictly designed to be added directly to your resume. Completing them provides strong, verifiable talking points for technical interviews.
                    </p>
                </div>
            </div>

            <div className="relative space-y-12 pl-8 before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-0.5 before:bg-slate-200">
                {renderTier('Beginner', 'beginner', stack.tiers.beginner, true, '', beginnerCompleted, 3)}

                {renderTier(
                    'Intermediate',
                    'intermediate',
                    stack.tiers.intermediate,
                    isIntermediateUnlocked,
                    'Complete 3 Beginner Projects',
                    intermediateCompleted,
                    3
                )}

                {renderTier(
                    'Advanced',
                    'advanced',
                    stack.tiers.advanced,
                    isAdvancedUnlocked,
                    'Complete 3 Intermediate Projects',
                    getCompletedCount(stack.tiers.advanced),
                    3
                )}
            </div>
        </motion.div>
    );
}
