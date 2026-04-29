import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import FeatureShowcase from '../components/home/FeatureShowcase';
import CoreToolsShowcase from '../components/home/CoreToolsShowcase';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Features - Emble',
  description: 'Explore the powerful features and tools of Emble to master your tech interviews.',
  alternates: {
    canonical: 'https://emble.in/features',
  },
};

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#efeff1] text-[#202b20] font-sans antialiased selection:bg-[#ffa116]/30 selection:text-[#202b20] relative flex flex-col pt-24">
      <Navbar />

      <div className="relative z-10 flex flex-col gap-12 sm:gap-16 pb-20">
        <div className="container mx-auto px-6 text-center max-w-3xl mt-12">
            <h1 className="text-[3rem] md:text-[5rem] leading-[1.1] font-[800] tracking-tighter mb-6 text-[#202b20]">
                Emble <span className="text-white bg-[#202b20] px-3 shadow-[2px_2px_0px_0px_#ffa116] block sm:inline-block mt-2 sm:mt-0">Features</span>
            </h1>
            <p className="text-lg text-[#202b20]/70 font-[500]">Everything you need to practice, prepare, and crack your next tech interview.</p>
        </div>
        <FeatureShowcase />
        <CoreToolsShowcase />
      </div>
      
      <Footer />
    </div>
  );
}
