'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Heart,
    Zap,
    Rocket,
    Users,
    Shield,
    Cpu,
    ArrowRight,
    CheckCircle2,
    Briefcase,
    Star,
    Coffee,
    Globe,
    Home
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/app/components/layout/Navbar';
import Footer from '@/app/components/layout/Footer';

const values = [
    { title: "Builder Mindset", desc: "We don't just teach, we build. Every member of our team is an engineer at heart.", icon: Cpu, color: "orange" },
    { title: "Radical Ownership", desc: "We own our mistakes and our wins. Flat hierarchy means high responsibility.", icon: Shield, color: "emerald" },
    { title: "Student-First", desc: "Every line of code we write must directly impact a student's career outcome.", icon: Heart, color: "rose" },
    { title: "Iterate Fast", desc: "The tech world moves at light speed. We move faster. Ship today, refine tomorrow.", icon: Zap, color: "blue" }
];

// Careers are now fetched dynamically from the API.

const perks = [
    { title: "Remote-First", icon: Home },
    { title: "Unlimited Learning", icon: Star },
    { title: "Health & Wellness", icon: CheckCircle2 },
    { title: "Latest Hardware", icon: Rocket },
    { title: "Yearly Offsites", icon: Globe },
    { title: "Deep Work Culture", icon: Coffee }
];

export default function CareersPage() {
    const [mounted, setMounted] = useState(false);
    const [selectedDept, setSelectedDept] = useState('All');

    const [jobs, setJobs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setMounted(true);
        const fetchCareers = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/careers?activeOnly=true`);
                if (res.ok) {
                    const data = await res.json();
                    // Map API careers to match UI expectations
                    const mappedJobs = data.map((career: any) => ({
                        id: career.id,
                        title: career.title,
                        dept: career.type, // Mapping 'type' (e.g., Full-time) to UI's dept tag for now 
                        type: career.type,
                        location: career.location,
                        salary: career.experience || "Competitive", // Using experience as a placeholder for salary badge
                        desc: career.description,
                        createdAt: career.createdAt
                    }));
                    setJobs(mappedJobs);
                }
            } catch (error) {
                console.error("Failed to load careers", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCareers();
    }, []);

    if (!mounted) return null;

    const filteredJobs = selectedDept === 'All'
        ? jobs
        : jobs.filter(j => j.dept === selectedDept);

    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden bg-brand-black text-white">
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                    backgroundImage: `radial-gradient(circle at 1.5px 1.5px, white 1.5px, transparent 0)`,
                    backgroundSize: '40px 40px'
                }} />
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col items-center text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-orange text-[11px] font-bold uppercase tracking-widest mb-6 border border-white/10"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
                            Careers at EMBLE
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight"
                        >
                            Help us build the <br />
                            <span className="text-brand-orange italic">Future of Engineering.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-gray-400 max-w-2xl font-medium mb-12"
                        >
                            We're a team of builders, dreamers, and teachers. Our mission is to bridge the gap between college and the high-speed world of tech.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <a href="#openings" className="h-14 px-10 rounded-2xl bg-brand-orange text-white font-bold flex items-center gap-3 hover:bg-brand-orange-hover transition-all shadow-xl shadow-brand-orange/20 hover:scale-105">
                                View Open Roles <ArrowRight size={20} />
                            </a>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-extrabold text-brand-black mb-4">How we operate.</h2>
                        <p className="text-gray-500 font-medium">Four principles that guide every decision we make.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((v, idx) => (
                            <motion.div
                                key={v.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-8 rounded-3xl bg-gray-50 border border-gray-100 group hover:border-brand-orange/20 hover:bg-white hover:shadow-2xl hover:shadow-brand-orange/5 transition-all duration-300"
                            >
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${v.color === 'orange' ? 'bg-orange-100 text-brand-orange' :
                                    v.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                                        v.color === 'rose' ? 'bg-rose-100 text-rose-600' :
                                            'bg-blue-100 text-blue-600'
                                    }`}>
                                    <v.icon size={24} />
                                </div>
                                <h4 className="text-xl font-bold text-brand-black mb-3">{v.title}</h4>
                                <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Jobs Section */}
            <section id="openings" className="py-24 bg-gray-50/50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                        <div>
                            <h2 className="text-4xl font-extrabold text-brand-black mb-4">Open Positions</h2>
                            <p className="text-gray-500 font-medium">Join us in the next phase of our journey.</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {['All', 'Engineering', 'Product', 'Education', 'Marketing'].map(dept => (
                                <button
                                    key={dept}
                                    onClick={() => setSelectedDept(dept === 'Product' ? 'Design' : dept)}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                                        (selectedDept === dept || (dept === 'Product' && selectedDept === 'Design'))
                                            ? "bg-brand-black text-white shadow-lg"
                                            : "bg-white text-gray-400 hover:bg-gray-100 hover:text-brand-black border border-gray-100"
                                    )}
                                >
                                    {dept}
                                </button>
                            ))}
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="w-8 h-8 rounded-full border-2 border-brand-orange border-t-transparent animate-spin" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            <AnimatePresence mode="popLayout">
                                {filteredJobs.map((job) => (
                                    <motion.div
                                        key={job.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="group bg-white p-8 rounded-3xl border border-gray-100 hover:border-brand-orange/30 hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-8"
                                    >
                                        <div className="max-w-xl">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="px-2 py-0.5 rounded-md bg-orange-50 text-brand-orange text-[10px] font-black uppercase tracking-widest">{job.dept}</span>
                                                <span className="text-gray-300 text-xs">•</span>
                                                <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">{job.type}</span>
                                            </div>
                                            <h3 className="text-2xl font-bold text-brand-black mb-4 group-hover:text-brand-orange transition-colors">{job.title}</h3>
                                            <p className="text-gray-500 text-sm line-clamp-2">{job.desc}</p>
                                        </div>
                                        <div className="flex flex-col md:items-end gap-1">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{job.location}</span>
                                            <span className="text-sm font-medium text-brand-black">{job.salary}</span>
                                            <button className="mt-4 px-6 py-2.5 rounded-xl bg-gray-100 text-brand-black font-bold text-sm hover:bg-brand-black hover:text-white transition-all flex items-center gap-2">
                                                Apply Now <ArrowRight size={16} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {filteredJobs.length === 0 && (
                                <div className="text-center py-20 px-6 border border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
                                    <Briefcase size={32} className="mx-auto text-gray-300 mb-4" />
                                    <h3 className="text-lg font-bold text-brand-black mb-2">No open positions found</h3>
                                    <p className="text-gray-500 text-sm">We don't have any openings that match your criteria right now. Check back later!</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* Perks & Benefits */}
            <section className="py-24 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div>
                            <h2 className="text-4xl font-extrabold text-brand-black mb-8">Built for work. <br /><span className="text-brand-orange">Designed for life.</span></h2>
                            <p className="text-gray-500 text-lg mb-12 leading-relaxed">
                                We believe in deep work, high ownership, and a culture that respects your time. Here&apos;s what you get besides a paycheck.
                            </p>
                            <div className="grid grid-cols-2 gap-6">
                                {perks.map((p, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                        <div className="w-10 h-10 rounded-xl bg-white text-brand-orange flex items-center justify-center shadow-sm">
                                            <p.icon size={20} />
                                        </div>
                                        <span className="font-bold text-brand-black text-sm">{p.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute -inset-4 bg-orange-50 rounded-[40px] -rotate-2" />
                            <div className="relative aspect-video rounded-[32px] overflow-hidden shadow-2xl bg-brand-black border border-white/10">
                                <img src="https://images.unsplash.com/photo-152207182399e-b89e7df830c5?q=80&w=800&auto=format&fit=crop" alt="Team Work" className="w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-700" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-20 h-20 rounded-full bg-brand-orange text-white flex items-center justify-center animate-pulse">
                                        <Users size={32} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Hiring Process */}
            <section className="py-24 bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-extrabold mb-4">Our Hiring Process.</h2>
                        <p className="text-gray-400 font-medium italic">Transparency from the first hello.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {[
                            { step: "01", title: "Review", desc: "We review your applications (and your GitHub)." },
                            { step: "02", title: "The Chat", desc: "A 30-min intro call with the founding team." },
                            { step: "03", title: "Deep Dive", desc: "A technical/role-specific challenge or session." },
                            { step: "04", title: "The Offer", desc: "Competitive equity, salary, and path to impact." }
                        ].map((s, idx) => (
                            <div key={idx} className="relative group">
                                <div className="text-6xl font-black text-white/5 absolute -top-10 left-0 group-hover:text-brand-orange/10 transition-colors uppercase italic">{s.step}</div>
                                <h4 className="text-xl font-bold mb-4 relative z-10">{s.title}</h4>
                                <p className="text-gray-400 text-sm leading-relaxed relative z-10">{s.desc}</p>
                                {idx < 3 && <div className="hidden md:block absolute top-10 -right-4 w-8 h-px bg-gray-800" />}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
