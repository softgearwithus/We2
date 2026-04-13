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
        <section className="py-16 md:py-24 relative overflow-hidden">
            <div className="max-w-5xl mx-auto px-6">
                <div className="text-center mb-14">
                    <h2 className="text-4xl font-bold text-foreground tracking-tight mb-4">
                        Why We Are <span className="text-primary font-black">Better</span>
                    </h2>
                    <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
                        We aren't just another AI wrapper. We built an autonomous evaluator from the ground up with memory and emotional intelligence.
                    </p>
                </div>

                <div className="rounded-3xl border border-border shadow-md bg-card overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse min-w-full max-w-full max-w-[600px]">
                        <thead>
                            <tr className="bg-secondary/50">
                                <th className="p-6 text-sm font-bold text-foreground/60 uppercase tracking-widest border-b border-border">Feature</th>
                                <th className="p-6 text-sm font-bold text-foreground/60 uppercase tracking-widest border-b border-border">Standard AI</th>
                                <th className="p-6 text-sm font-bold text-primary uppercase tracking-widest border-b border-border bg-secondary">EMBLE Platform</th>
                            </tr>
                        </thead>
                        <tbody>
                            {comparisonData.map((row, i) => (
                                <tr key={i} className="group hover:bg-secondary/20 transition-colors">
                                    <td className="p-6 font-bold text-foreground border-b border-border text-sm md:text-base">{row.feature}</td>
                                    <td className="p-6 text-foreground/60 border-b border-border italic text-sm md:text-base">{row.typical}</td>
                                    <td className="p-6 font-bold text-foreground border-b border-border bg-secondary/10 text-sm md:text-base">
                                        <div className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                                                <Check size={12} strokeWidth={3} />
                                            </div>
                                            {row.we2}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-8 md:mt-12 p-6 bg-secondary rounded-2xl border border-border flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="text-foreground font-medium text-center sm:text-left text-sm sm:text-base leading-relaxed">
                        Teams using EMBLE complete hiring pipelines <strong className="text-primary font-bold">4x faster</strong>, filtering out noise with 99.9% shortlisting efficiency.
                    </div>
                    <Button asChild size="lg" className="whitespace-nowrap px-8 py-6 bg-foreground text-background rounded-xl font-bold text-[15px] hover:bg-background hover:text-foreground hover:border-primary border border-transparent transition-all shadow-xl active:scale-95">
                        <Link href="/register">
                            Start Now
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
