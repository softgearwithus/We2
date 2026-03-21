'use client';

import { motion } from 'framer-motion';
import { DomainType, TechStack } from '@/app/lib/ProjectData';
import { ArrowRight } from 'lucide-react';

interface StackSelectorProps {
    domain: DomainType;
    onSelect: (stack: TechStack) => void;
}

export default function StackSelector({ domain, onSelect }: StackSelectorProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full"
        >
            <h2 className="text-lg font-bold mb-4 text-slate-800">
                Technology Stack <span className="text-slate-400 font-normal">/</span> <span className="text-slate-800">{domain.title}</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {domain.stacks.map((stack) => (
                    <div
                        key={stack.id}
                        onClick={() => onSelect(stack)}
                        className="group p-6 bg-white border border-slate-200 rounded-xl hover:border-emerald-500 cursor-pointer transition-all duration-200 hover:shadow-md"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                <stack.icon size={20} />
                            </div>
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${stack.difficulty === 'Low' ? 'bg-green-50 text-green-600 border-green-100' :
                                    stack.difficulty === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                        'bg-red-50 text-red-600 border-red-100'
                                }`}>
                                {stack.difficulty}
                            </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 mb-1">{stack.name}</h3>
                        <p className="text-slate-500 text-sm mb-4 line-clamp-2">{stack.description}</p>

                        <div className="space-y-1.5">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400 font-medium">Industry Demand</span>
                                <span className="text-emerald-600 font-bold">{stack.popularity}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: `${stack.popularity}%` }}></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
