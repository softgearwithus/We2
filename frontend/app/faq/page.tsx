import React from 'react';
import Navbar from '@/app/components/layout/Navbar';
import Footer from '@/app/components/layout/Footer';
import FAQSection from '@/app/components/home/FAQSection';

export default function FAQPage() {
    return (
        <div className="min-h-screen bg-[#efeff1] text-[#202b20] font-sans antialiased selection:bg-[#ffa116]/30 selection:text-[#202b20] relative flex flex-col pt-24">
            <Navbar />

            <main className="relative z-10 flex-grow pt-24 pb-16">
                <FAQSection />
            </main>

            <Footer />
        </div>
    );
}
