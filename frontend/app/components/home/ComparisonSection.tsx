'use client';

import { Check } from 'lucide-react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";

const comparisonData = [
    { feature: "Interview Practice", typical: "Mocking with Peers", we2: "Dynamic AI Voice Interviews" },
    { feature: "Test Preparation", typical: "Generic DSA Questions", we2: "100+ Company-Wise Test Series" },
    { feature: "Feedback Loop", typical: "Wait Days for Reviews", we2: "Instant Granular AI Analytics" },
    { feature: "Resume Building", typical: "Basic Document Templates", we2: "ATS-Optimized Auto-Builder" },
    { feature: "Guidance", typical: "Expensive 1:1 Coaching", we2: "24/7 AI Support & Expert Access" },
];

export default function ComparisonSection() {
    return (
        <section className="py-16 md:py-24 relative overflow-hidden">
            <div className="max-w-5xl mx-auto px-6">
                <div className="text-center mb-14">
                    <h2 className="text-4xl font-bold text-foreground tracking-tight mb-4">
                        The <span className="text-primary font-black">EMBLE Edge</span>
                    </h2>
                    <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
                        Why traditional courses leave you "job-unready" and how we solve it.
                    </p>
                </div>

                <div className="rounded-3xl border border-border shadow-md bg-card overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse min-w-full max-w-full max-w-[600px]">
                        <thead>
                            <tr className="bg-secondary/50">
                                <th className="p-6 text-sm font-bold text-foreground/60 uppercase tracking-widest border-b border-border">Feature</th>
                                <th className="p-6 text-sm font-bold text-foreground/60 uppercase tracking-widest border-b border-border">Typical Course</th>
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
                        Students using EMBLE are <strong className="text-primary font-bold">3.5x more likely</strong> to pass technical screening due to our comprehensive Full Stack Preparation ecosystem.
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
