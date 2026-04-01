'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
    Code2,
    Video,
    Users,
    Check,
    ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface FeatureCard {
    id: string;
    title: string;
    description: string;
    features: string[];
    icon: React.ElementType;
    href: string;
    imageUrl: string;
}

const productCards: FeatureCard[] = [
    {
        id: 'test-series',
        title: '100+ Company-Wise Test Series',
        description: 'Pressure-test your DSA code in simulated environments.',
        features: ['Real-time code execution', 'Actual past FAANG questions', 'Detailed time & space tracing'],
        icon: Code2,
        href: '/dashboard/test-series',
        imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop'
    },
    {
        id: 'mock-interview',
        title: 'Real Mock Interview',
        description: '5 unique formats to conquer interview anxiety directly.',
        features: ['1:1 Industry Expert Interviews', 'AI Interviews (EO)', 'Audio Voice Drills'],
        icon: Video,
        href: '/dashboard/interview',
        imageUrl: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=2069&auto=format&fit=crop'
    },
    {
        id: 'mentorship',
        title: '1:1 Expert Mentorship',
        description: 'Pay per minute to get your specific doubts solved instantly.',
        features: ['Granular per-minute billing', 'Bypass generic advice', 'Direct resume reviews'],
        icon: Users,
        href: '/dashboard/mentors',
        imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop'
    }
];

export default function AIActionHub() {
    return (
        <div className="w-full relative">

            {/* Standard Product Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {productCards.map((product, idx) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1, type: "spring", stiffness: 300, damping: 25 }}
                        className="h-full"
                    >
                        <Card className="group relative overflow-hidden h-full flex flex-col border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                            {/* Product Image Header */}
                            <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                                <img
                                    src={product.imageUrl}
                                    alt={product.title}
                                    className="object-cover absolute inset-0 z-0 w-full h-full group-hover:scale-105 transition-transform duration-700"
                                />
                                {/* Soft gradient overlay for text legibility if needed */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>

                            {/* Standard Content Block */}
                            <CardHeader className="pb-3 pt-5 relative z-10 bg-card rounded-t-none">
                                <CardTitle className="flex items-center gap-3 text-xl font-black text-card-foreground">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                                        <product.icon size={16} strokeWidth={2.5} />
                                    </div>
                                    {product.title}
                                </CardTitle>
                                <p className="text-sm font-medium text-foreground/70 mt-2">
                                    {product.description}
                                </p>
                            </CardHeader>

                            <CardContent className="flex-1 bg-card relative z-10 pb-6">
                                <h4 className="text-[11px] font-bold uppercase tracking-widest text-foreground/50 mb-3">Key Features</h4>
                                <ul className="space-y-2.5">
                                    {product.features.map((feature, fIdx) => (
                                        <li key={fIdx} className="flex items-start gap-2.5 text-[13px] font-semibold text-foreground/90">
                                            <div className="mt-0.5 w-4 h-4 rounded-full bg-secondary border border-secondary/50 flex items-center justify-center shrink-0">
                                                <Check size={10} className="text-primary" strokeWidth={3} />
                                            </div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>

                            <CardFooter className="pt-0 pb-6 px-6 bg-card relative z-10">
                                <Link href={product.href} className="w-full">
                                    <button className="relative w-full h-12 flex items-center justify-center rounded-xl font-bold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-95 group/btn bg-primary text-primary-foreground shadow-sm hover:bg-primary/90">
                                        <span className="relative z-10 flex items-center gap-2">
                                            Explore Product
                                            <ArrowRight size={16} className="transition-transform duration-300 group-hover/btn:translate-x-1" />
                                        </span>
                                    </button>
                                </Link>
                            </CardFooter>
                        </Card>
                    </motion.div>
                ))}
            </div>

        </div>
    );
}
