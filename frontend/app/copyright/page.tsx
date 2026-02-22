'use client';

import React from 'react';
import Navbar from '@/app/components/layout/Navbar';
import Footer from '@/app/components/layout/Footer';

export default function CopyrightPage() {
    return (
        <main className="min-h-screen bg-white selection:bg-brand-orange selection:text-white flex flex-col">
            <Navbar />

            <div className="flex-1 max-w-4xl mx-auto px-6 pt-32 pb-24 flex flex-col">
                <h1 className="text-4xl md:text-5xl font-extrabold text-brand-black mb-8 tracking-tight">
                    Copyright & Policies
                </h1>

                <div className="prose prose-lg text-gray-600 space-y-12">
                    <section>
                        <h2 className="text-2xl font-bold text-brand-black mb-4">What We Do</h2>
                        <p className="leading-relaxed">
                            EMBLE Technologies provides an immersive, full-stack simulation environment designed to bridge the gap between academic learning and industry expectations. We simulate real-world workflows, provide hands-on projects, and evaluate capabilities to prepare candidates for high-tier tech roles.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-brand-black mb-4">What We Ask of You</h2>
                        <p className="leading-relaxed mt-4">
                            We ask our users to engage with our content honestly and fairly. Do not copy, distribute, or reverse-engineer our proprietary simulation environments, curriculum, or assessment algorithms without explicit written consent. Our goal is to foster an environment of genuine learning, collaboration, and skill verification.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-brand-black mb-4">Intellectual Property</h2>
                        <p className="leading-relaxed mt-4">
                            All content, algorithms, designs, and text provided on the EMBLE platform are the intellectual property of EMBLE Technologies. Unauthorized reproduction or commercial use is strictly prohibited and protected under applicable copyright laws.
                        </p>
                        <p className="leading-relaxed mt-4 font-bold text-brand-black">
                            © 2026 EMBLE Technologies. All rights reserved.
                        </p>
                    </section>
                </div>
            </div>

            <Footer />
        </main>
    );
}
