'use client';

import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

const comparisonData = [
    { feature: "Learning Model", typical: "Passive Video Lectures", we2: "Interactive Full-Stack Practice" },
    { feature: "Problem Solving", typical: "Generic DSA Problems", we2: "Curated DSA & SQL Training" },
    { feature: "Mentorship", typical: "Doubt Forums", we2: "AI Mock Interviews & Mentorship" },
    { feature: "Experience", typical: "Theoretical Certifications", we2: "ATS Resume Builder & Scans" },
    { feature: "Hiring Focus", typical: "Candidate Quantity", we2: "Guaranteed Prep Quality" },
];

export default function ComparisonSection() {
    return (
        <section className="py-24 bg-white relative overflow-hidden">
            <div className="max-w-5xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-brand-black tracking-tight mb-4">
                        The <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-purple-600 font-black">EMBLE Edge</span>
                    </h2>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                        Why traditional courses leave you "job-unready" and how we solve it.
                    </p>
                </div>

                <div className="rounded-3xl border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="p-6 text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Feature</th>
                                <th className="p-6 text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Typical Course</th>
                                <th className="p-6 text-sm font-bold text-brand-orange uppercase tracking-widest border-b border-gray-100 bg-orange-50/20">EMBLE Platform</th>
                            </tr>
                        </thead>
                        <tbody>
                            {comparisonData.map((row, i) => (
                                <tr key={i} className="group hover:bg-gray-50/30 transition-colors">
                                    <td className="p-6 font-bold text-brand-black border-b border-gray-50">{row.feature}</td>
                                    <td className="p-6 text-gray-400 border-b border-gray-50 italic">{row.typical}</td>
                                    <td className="p-6 font-bold text-brand-black border-b border-gray-50 bg-orange-50/10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600">
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

                <div className="mt-12 p-6 bg-purple-50 rounded-2xl border border-purple-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="text-purple-900 font-medium">
                        Students using EMBLE are <strong>3.5x more likely</strong> to pass technical screening due to our comprehensive Full Stack Placement ecosystem.
                    </div>
                    <Link href="/register" className="whitespace-nowrap px-6 py-2.5 bg-brand-black text-white rounded-xl font-bold text-sm hover:bg-gray-900 transition-all">
                        The EMBLE Edge
                    </Link>
                </div>
            </div>
        </section>
    );
}

import Link from 'next/link';
