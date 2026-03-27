'use client';

import { Check } from 'lucide-react';
import Link from 'next/link';

const comparisonData = [
    { feature: "Learning Model", typical: "Passive Video Lectures", we2: "Interactive Full-Stack Practice" },
    { feature: "Problem Solving", typical: "Generic DSA Problems", we2: "Curated DSA & SQL Training" },
    { feature: "Mentorship", typical: "Doubt Forums", we2: "AI Mock Interviews & Mentorship" },
    { feature: "Experience", typical: "Theoretical Certifications", we2: "ATS Resume Builder & Scans" },
    { feature: "Hiring Focus", typical: "Candidate Quantity", we2: "Guaranteed Prep Quality" },
];

export default function ComparisonSection() {
    return (
        <section className="py-12 md:py-16 relative overflow-hidden">
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
                        Students using EMBLE are <strong className="text-primary font-bold">3.5x more likely</strong> to pass technical screening due to our comprehensive Full Stack Placement ecosystem.
                    </div>
                    <Link href="/register" className="whitespace-nowrap px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary/90 transition-all shadow-sm">
                        The EMBLE Edge
                    </Link>
                </div>
            </div>
        </section>
    );
}
