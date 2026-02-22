'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export type ProjectLabDomainOption = {
    id: string;
    title: string;
    description: string;
    icon: any;
    count?: number;
    disabled?: boolean;
};

interface DomainSelectorProps {
    domains: ProjectLabDomainOption[];
    onSelect: (domain: ProjectLabDomainOption) => void;
}

export default function DomainSelector({ domains, onSelect }: DomainSelectorProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full"
        >
            <h2 className="text-lg font-bold mb-4 text-slate-800">Select Development Domain</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {domains.map((domain) => (
                    <div
                        key={domain.id}
                        onClick={() => !domain.disabled && onSelect(domain)}
                        className={`group relative p-6 bg-white border border-slate-200 rounded-xl transition-all duration-200 hover:shadow-md ${domain.disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-indigo-500 cursor-pointer'}`}
                    >
                        <div className="flex flex-col h-full">
                            <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center mb-4 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                                <domain.icon size={24} />
                            </div>
                            <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{domain.title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed mb-4 flex-1">{domain.description}</p>

                            {typeof domain.count === 'number' && (
                                <div className="text-xs font-semibold text-slate-400 mb-3">
                                    {domain.count} Project{domain.count === 1 ? '' : 's'}
                                </div>
                            )}

                            {!domain.disabled && (
                                <div className="flex items-center text-xs font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-200">
                                    EXPLORE <ArrowRight size={14} className="ml-1" />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
