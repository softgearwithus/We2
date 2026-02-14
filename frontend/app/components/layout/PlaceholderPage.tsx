'use client';

import React from 'react';
import Navbar from '@/app/components/layout/Navbar';
import Footer from '@/app/components/layout/Footer';
import DotBackground from '@/app/components/ui/DotBackground';

interface PlaceholderPageProps {
    title: string;
    description: string;
    children?: React.ReactNode;
}

export default function PlaceholderPage({ title, description, children }: PlaceholderPageProps) {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 relative selection:bg-indigo-100 selection:text-indigo-900">
            <DotBackground />
            <Navbar />

            <main className="relative z-10 pt-32 pb-32 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
                        {title}
                    </h1>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-12">
                        {description}
                    </p>

                    <div className="bg-white/50 backdrop-blur-sm border border-slate-200 rounded-3xl p-12 shadow-sm">
                        {children || (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                <span className="material-symbols-outlined text-6xl mb-4 bg-slate-100 p-6 rounded-full text-slate-300">
                                    construction
                                </span>
                                <p className="font-medium">This page is currently under construction.</p>
                                <p className="text-sm mt-2">Check back soon for updates.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
