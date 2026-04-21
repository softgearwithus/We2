import Link from 'next/link';
import Hero from './components/home/Hero';
import AudioPlayerMessage from './components/home/AudioPlayerMessage';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import FeatureShowcase from './components/home/FeatureShowcase';
import dynamic from 'next/dynamic';

const Testimonials = dynamic(() => import('./components/home/Testimonials'));
const ComparisonSection = dynamic(() => import('./components/home/ComparisonSection'));
const AboutUs = dynamic(() => import('./components/home/AboutUs'));
const CoreToolsShowcase = dynamic(() => import('./components/home/CoreToolsShowcase'));
const ProblemSection = dynamic(() => import('./components/home/ProblemSection'));
const HowItWorks = dynamic(() => import('./components/home/HowItWorks'));
const TargetUsers = dynamic(() => import('./components/home/TargetUsers'));
const CursorGrainyCloud = dynamic(() => import('./components/shared/CursorGrainyCloud'));
import { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://emble.in',
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-primary/20 selection:text-foreground relative overflow-x-hidden">
      <CursorGrainyCloud />
      {/* Architectural Grid Background Layer */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, #202b2015 1px, transparent 1px),
            linear-gradient(to bottom, #202b2015 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      <Navbar />

      <div className="relative z-10 flex flex-col w-full pb-16">
        <Hero />
        <ProblemSection />
        <HowItWorks />
        <ComparisonSection />
        <TargetUsers />
        <Testimonials />
      </div>

      <AboutUs />

      <Footer />
    </div>
  );
}
