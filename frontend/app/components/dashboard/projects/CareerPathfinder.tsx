'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { PROJECT_DOMAINS, DomainType } from '@/app/lib/ProjectData';
import { ArrowRight, CheckCircle2, IndianRupee, Briefcase } from 'lucide-react';

interface CareerPathfinderProps {
    onComplete: (domain: DomainType) => void;
}

export default function CareerPathfinder({ onComplete }: CareerPathfinderProps) {
    const [step, setStep] = useState(1);
    const [selectedInterest, setSelectedInterest] = useState<DomainType | null>(null);

    // Step 1: Initial Selection (Interests)
    if (step === 1) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden"
            >
                <div className="p-8 md:p-12 text-center">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">What interests you most?</h2>
                    <p className="text-slate-500 mb-10 text-lg">Don't worry about the code yet. What kind of things do you want to build?</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
                        {PROJECT_DOMAINS.map((domain) => (
                            <button
                                key={domain.id}
                                onClick={() => {
                                    setSelectedInterest(domain);
                                    setStep(2);
                                }}
                                className="group p-6 rounded-xl border border-slate-200 hover:border-indigo-500 hover:shadow-lg transition-all bg-slate-50 hover:bg-white"
                            >
                                <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:border-indigo-600 transition-colors">
                                    <domain.icon className="text-slate-600 group-hover:text-white" size={24} />
                                </div>
                                <h3 className="font-bold text-slate-900 text-lg mb-2">{domain.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{domain.description}</p>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="bg-slate-50 p-6 text-center border-t border-slate-200">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Step 1 of 2</p>
                </div>
            </motion.div>
        );
    }

    // Step 2: Confirmation & Insights
    if (step === 2 && selectedInterest) {
        return (
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="max-w-4xl mx-auto"
            >
                <button
                    onClick={() => setStep(1)}
                    className="mb-6 text-slate-500 hover:text-slate-800 flex items-center gap-2 font-medium"
                >
                    <ArrowRight className="rotate-180" size={20} /> Back to choices
                </button>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
                    {/* Left: Pitch */}
                    <div className="p-8 md:p-12 flex flex-col justify-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-bold w-fit mb-6">
                            <selectedInterest.icon size={16} />
                            Excellent Choice
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-6">{selectedInterest.title}</h2>
                        <h3 className="text-lg font-bold text-slate-700 mb-2">Why choose this path?</h3>
                        <p className="text-slate-600 leading-relaxed mb-6 italic">"{selectedInterest.whyChoose}"</p>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                <div className="p-2 bg-white rounded-full text-emerald-600 shadow-sm"><IndianRupee size={20} /></div>
                                <div>
                                    <div className="text-xs font-bold text-emerald-800 uppercase">Average Salary</div>
                                    <div className="font-bold text-slate-900">{selectedInterest.avgSalary}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl border border-purple-100">
                                <div className="p-2 bg-white rounded-full text-purple-600 shadow-sm"><Briefcase size={20} /></div>
                                <div>
                                    <div className="text-xs font-bold text-purple-800 uppercase">Popular Roles</div>
                                    <div className="font-bold text-slate-900">{selectedInterest.title} Engineer, Tech Lead</div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => onComplete(selectedInterest)}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                        >
                            Start My Journey <ArrowRight size={20} />
                        </button>
                    </div>

                    {/* Right: Examples */}
                    <div className="bg-slate-50 p-8 md:p-12 border-l border-slate-200 flex flex-col justify-center">
                        <h3 className="text-xl font-bold text-slate-900 mb-6">Apps built with {selectedInterest.title}</h3>
                        <div className="space-y-4">
                            {selectedInterest.popularApps?.map((app, idx) => (
                                <div key={idx} className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                                    <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                                        {app[0]}
                                    </div>
                                    <span className="font-bold text-slate-700">{app}</span>
                                    <CheckCircle2 className="ml-auto text-emerald-500" size={20} />
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 p-6 bg-blue-50 border border-blue-100 rounded-xl">
                            <h4 className="font-bold text-blue-900 mb-2">Beginner Friendly?</h4>
                            <p className="text-sm text-blue-800">Yes! We have curated specific "Level 1" projects in this domain that require zero prior experience.</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    return null;
}
