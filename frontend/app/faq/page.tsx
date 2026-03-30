import React from 'react';
import Navbar from '@/app/components/layout/Navbar';
import Footer from '@/app/components/layout/Footer';
import FAQSection from '@/app/components/home/FAQSection';

export default function FAQPage() {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-primary/20 selection:text-foreground relative overflow-x-hidden flex flex-col">
            {/* Absolute Dotted Background Layer */}
            <div
                className="absolute inset-0 pointer-events-none z-0"
                style={{
                    backgroundImage: 'radial-gradient(hsl(var(--primary) / 0.15) 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }}
            />
            <Navbar />

            <main className="relative z-10 flex-grow pt-24 pb-16">
                <FAQSection />
            </main>

            <Footer />
        </div>
    );
}
