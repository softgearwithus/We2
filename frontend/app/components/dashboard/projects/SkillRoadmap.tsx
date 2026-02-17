'use client';

import { motion } from 'framer-motion';
import { TechStack, ProjectType } from '@/app/lib/ProjectData';
import { Lock, Clock, CheckCircle2 } from 'lucide-react';

interface SkillRoadmapProps {
    stack: TechStack;
    onSelectProject: (project: ProjectType) => void;
}

export default function SkillRoadmap({ stack, onSelectProject }: SkillRoadmapProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full h-full"
        >
            <h2 className="text-lg font-bold mb-6 text-slate-800">
                Learning Path <span className="text-slate-400 font-normal">/</span> <span className="text-emerald-600">{stack.name}</span>
            </h2>

            <div className="relative space-y-8 pl-8 before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-0.5 before:bg-slate-200">
                {/* Beginner Tier */}
                <div className="relative">
                    <div className="absolute -left-[41px] top-0 w-6 h-6 rounded-full bg-white border-4 border-indigo-600 z-10" />
                    <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                        Beginner
                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold border border-indigo-100">Unlock: Level 1</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {stack.tiers.beginner.map((project) => (
                            <div
                                key={project.id}
                                onClick={() => onSelectProject(project)}
                                className="bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer group"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{project.title}</h4>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${project.complexity === 'Beginner' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-slate-50 text-slate-600 border-slate-100'
                                        }`}>
                                        {project.complexity}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500 line-clamp-2 mb-4 h-10">{project.description}</p>

                                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                    <div className="flex items-center text-xs text-slate-400">
                                        <Clock size={12} className="mr-1" />
                                        {project.estimatedTime}
                                    </div>
                                    <div className="flex gap-1">
                                        <span className="text-[10px] px-2 py-1 rounded-full bg-indigo-50 text-indigo-600 font-bold border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors">View Details</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {stack.tiers.beginner.length === 0 && (
                            <div className="col-span-full p-8 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                                Projects coming soon for this tier...
                            </div>
                        )}
                    </div>
                </div>

                {/* Intermediate Tier */}
                <div className="relative opacity-60">
                    <div className="absolute -left-[41px] top-0 w-6 h-6 rounded-full bg-slate-100 border-4 border-slate-300 z-10 flex items-center justify-center">
                        <Lock size={10} className="text-slate-400" />
                    </div>
                    <h3 className="text-base font-bold text-slate-500 mb-4 flex items-center gap-2">
                        Intermediate
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-bold border border-slate-200">Locked</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pointer-events-none">
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 grayscale">
                            <div className="flex justify-between items-start mb-3">
                                <h4 className="font-bold text-slate-700">Waitlist API</h4>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-500 border border-slate-200">Medium</span>
                            </div>
                            <p className="text-sm text-slate-500 mb-4 h-10">Build a robust backend service for managing a waitlist queue.</p>
                        </div>
                    </div>
                </div>

                {/* Advanced Tier */}
                <div className="relative opacity-60">
                    <div className="absolute -left-[41px] top-0 w-6 h-6 rounded-full bg-slate-100 border-4 border-slate-300 z-10 flex items-center justify-center">
                        <Lock size={10} className="text-slate-400" />
                    </div>
                    <h3 className="text-base font-bold text-slate-500 mb-4 flex items-center gap-2">
                        Advanced
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-bold border border-slate-200">Locked</span>
                    </h3>
                </div>
            </div>
        </motion.div>
    );
}
