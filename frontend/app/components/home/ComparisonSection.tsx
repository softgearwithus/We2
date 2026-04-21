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
                    <h2 className="text-[2.5rem] md:text-[4rem] font-[800] tracking-tighter text-[#202b20] mb-6">
                        Why We Are <span className="text-[#202b20] font-[500] tracking-tight bg-[#ffa116] px-3 border-2 border-[#202b20] shadow-[4px_4px_0_0_#202b20]">Better</span>
                    </h2>
                    <p className="text-[18px] md:text-[20px] text-[#202b20]/75 font-[500] max-w-2xl mx-auto leading-relaxed">
                        We aren't just another AI wrapper. We built an autonomous evaluator from the ground up with memory and emotional intelligence.
                    </p>
                </div>

                <div className="rounded-none border-2 border-[#202b20] shadow-[4px_4px_0_0_#202b20] bg-white overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse min-w-full">
                        <thead>
                            <tr className="bg-[#efeff1] border-b-2 border-[#202b20]">
                                <th className="p-6 text-[14px] font-[600] text-[#202b20] uppercase tracking-widest border-r-2 border-[#202b20] whitespace-nowrap">Feature</th>
                                <th className="p-6 text-[14px] font-[600] text-[#202b20] uppercase tracking-widest border-r-2 border-[#202b20] whitespace-nowrap">Standard AI</th>
                                <th className="p-6 text-[14px] font-[600] text-[#202b20] uppercase tracking-widest bg-[#ffa116] whitespace-nowrap border-[#202b20]">EMBLE Platform</th>
                            </tr>
                        </thead>
                        <tbody>
                            {comparisonData.map((row, i) => (
                                <tr key={i} className="group hover:bg-[#ffa116]/10 transition-colors">
                                    <td className="p-4 md:p-6 font-[600] text-[#202b20] border-b-2 border-r-2 border-[#202b20] text-[15px] md:text-[16px]">{row.feature}</td>
                                    <td className="p-4 md:p-6 text-[#202b20]/70 font-[500] border-b-2 border-r-2 border-[#202b20] italic text-[15px] md:text-[16px]">{row.typical}</td>
                                    <td className="p-4 md:p-6 font-[600] text-[#202b20] border-b-2 border-[#202b20] bg-white text-[15px] md:text-[16px]">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-none bg-[#202b20] border border-[#202b20] flex items-center justify-center text-[#ffa116] shrink-0 shadow-[2px_2px_0_0_#ffa116]">
                                                <Check size={14} strokeWidth={3} />
                                            </div>
                                            {row.we2}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-12 p-6 bg-[#efeff1] rounded-none border-2 border-[#202b20] shadow-[4px_4px_0_0_#202b20] flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-[#202b20] font-[500] text-center md:text-left text-[16px] md:text-[18px] leading-relaxed">
                        Teams using EMBLE complete hiring pipelines <strong className="text-[#202b20] font-[600] uppercase text-[18px] bg-[#ffa116] px-1 border-2 border-[#202b20]">4x faster</strong>, filtering out noise with 99.9% shortlisting efficiency.
                    </div>
                    <Button asChild size="lg" className="whitespace-nowrap px-8 py-6 bg-[#202b20] text-white rounded-none font-[600] text-[15px] hover:bg-[#ffa116] hover:text-[#202b20] uppercase border-2 border-[#202b20] shadow-[2px_2px_0_0_#202b20] hover:shadow-none hover:-translate-y-1 transition-all">
                        <Link href="/register">
                            Start Now
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
