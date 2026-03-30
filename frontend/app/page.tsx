import Link from 'next/link';
import Hero from './components/home/Hero';
import AudioPlayerMessage from './components/home/AudioPlayerMessage';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import FeatureShowcase from './components/home/FeatureShowcase';
import Testimonials from './components/home/Testimonials';
import ComparisonSection from './components/home/ComparisonSection';
import AboutUs from './components/home/AboutUs';
import CoreToolsShowcase from './components/home/CoreToolsShowcase';
import ProblemSection from './components/home/ProblemSection';
import HowItWorks from './components/home/HowItWorks';
import TargetUsers from './components/home/TargetUsers';
import { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://emble.in',
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-primary/20 selection:text-foreground relative overflow-x-hidden">
      {/* Absolute Dotted Background Layer */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'radial-gradient(hsl(var(--primary) / 0.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />
      <Navbar />

      <div className="relative z-10 flex flex-col">
        <Hero />
        <ProblemSection />
        <HowItWorks />
        <TargetUsers />
        <ComparisonSection />
        <Testimonials />
      </div>

      <AboutUs />
      
      <Footer />
    </div>
  );
}
