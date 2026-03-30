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
    <div className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-primary/20 selection:text-foreground relative overflow-x-hidden pt-24">
      {/* Absolute Dotted Background Layer */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'radial-gradient(hsl(var(--primary) / 0.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />
      <Navbar />

      <div className="relative z-10 flex flex-col gap-12 sm:gap-16 pb-20">
        <div className="container mx-auto px-6 text-center max-w-3xl mt-12">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">Emble Features</h1>
            <p className="text-lg text-foreground/70">Everything you need to practice, prepare, and crack your next tech interview.</p>
        </div>
        <FeatureShowcase />
        <CoreToolsShowcase />
      </div>
      
      <Footer />
    </div>
  );
}
