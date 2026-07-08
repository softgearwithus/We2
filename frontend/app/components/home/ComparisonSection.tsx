'use client';

import { Check } from 'lucide-react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";

const comparisonData = [
    { feature: "AI Technology", typical: "Basic Chatbots", we2: "Smart AI That Remembers Everything" },
    { feature: "Conversation", typical: "Robotic & Scripted", we2: "Feels Like a Real Human Chat" },
    { feature: "Grading Accuracy", typical: "Simple Keyword Search", we2: "99.9% Perfect Scoring" },
    { feature: "Personalization", typical: "Same Questions for All", we2: "Custom Questions Based on Job details" },
    { feature: "Fraud Detection", typical: "Easy to Cheat", we2: "Smart Anti-Cheat System" },
];

export default function ComparisonSection() {
    return (
        <section className="py-24 lg:py-32 relative overflow-hidden bg-transparent">
            <div className="max-w-[1000px] mx-auto px-6">
                <div className="text-center mb-16 md:mb-24 max-w-3xl mx-auto">
                    <h2 className="text-[2.5rem] md:text-[4rem] font-[800] tracking-tighter text-black mb-4 leading-[1.05]">
                        Why We Are <br className="hidden sm:block" />
                        <span className="font-serif italic font-normal text-gray-400">Better.</span>
                    </h2>
                    <p className="text-[18px] md:text-[20px] text-gray-500 font-[500] max-w-2xl mx-auto leading-relaxed mt-6">
                        We aren't just another AI wrapper. We built an autonomous evaluator from the ground up with memory and emotional intelligence.
                    </p>
                </div>

                <div className="rounded-3xl border border-gray-100 shadow-sm bg-white overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse min-w-full">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-gray-100">
                                <th className="p-6 text-[13px] font-[600] text-gray-500 uppercase tracking-widest border-r border-gray-100 whitespace-nowrap">Feature</th>
                                <th className="p-6 text-[13px] font-[600] text-gray-500 uppercase tracking-widest border-r border-gray-100 whitespace-nowrap">Standard AI</th>
                                <th className="p-6 text-[13px] font-[600] text-purple-600 bg-purple-50/30 uppercase tracking-widest whitespace-nowrap">EMBLE Platform</th>
                            </tr>
                        </thead>
                        <tbody>
                            {comparisonData.map((row, i) => (
                                <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="p-5 md:p-6 font-[500] text-gray-900 border-b border-r border-gray-100 text-[15px]">{row.feature}</td>
                                    <td className="p-5 md:p-6 text-gray-400 font-[400] border-b border-r border-gray-100 italic text-[15px]">{row.typical}</td>
                                    <td className="p-5 md:p-6 font-[600] text-gray-900 border-b border-gray-100 bg-white text-[15px]">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                                                <Check size={14} strokeWidth={2.5} />
                                            </div>
                                            {row.we2}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-12 p-8 md:p-10 bg-slate-50/50 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-gray-700 font-[400] text-center md:text-left text-[16px] md:text-[18px] leading-relaxed">
                        Teams using EMBLE complete hiring pipelines <strong className="text-gray-900 font-[600] bg-purple-100 px-2 py-0.5 rounded-md text-[18px]">4x faster</strong>, filtering out noise with 99.9% shortlisting efficiency.
                    </div>
                    <Button asChild size="lg" className="whitespace-nowrap px-8 py-6 bg-gray-900 text-white rounded-full font-[500] text-[15px] hover:bg-gray-800 hover:scale-[1.02] shadow-md transition-all duration-300">
                        <Link href="/register">
                            Start Now
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
