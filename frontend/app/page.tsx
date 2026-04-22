import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Hero from './components/home/Hero';
import dynamic from 'next/dynamic';
import { Metadata } from 'next';
import CursorGrainyCloud from './components/shared/CursorGrainyCloud';

// ── Below-fold sections: lazy SSR-safe imports ────────────────────────────────
const ProblemSection    = dynamic(() => import('./components/home/ProblemSection'));
const HowItWorks        = dynamic(() => import('./components/home/HowItWorks'));
const FeatureShowcase   = dynamic(() => import('./components/home/FeatureShowcase'));
const ComparisonSection = dynamic(() => import('./components/home/ComparisonSection'));
const TargetUsers       = dynamic(() => import('./components/home/TargetUsers'));
const Testimonials      = dynamic(() => import('./components/home/Testimonials'));
const AboutUs           = dynamic(() => import('./components/home/AboutUs'));
const AudioPlayerMessage = dynamic(() => import('./components/home/AudioPlayerMessage'));

export const metadata: Metadata = {
  title: 'Emble – The #1 AI Interview Platform | Hire Smarter, Faster',
  description:
    'Emble is the intelligence layer for AI interviews. Agentic voice interviews that reason, adapt, and evaluate in real time. Trusted by 1,000+ companies.',
  alternates: {
    canonical: 'https://emble.in',
  },
};

// Static grid style — defined once, not re-created per render
const gridStyle = {
  backgroundImage:
    'linear-gradient(to right,#202b2012 1px,transparent 1px),linear-gradient(to bottom,#202b2012 1px,transparent 1px)',
  backgroundSize: '40px 40px',
} as const;

export default function Home() {
  return (
    <div className="min-h-screen bg-transparent text-foreground font-sans antialiased selection:bg-primary/20 selection:text-foreground relative overflow-x-hidden">
      {/* Client-only background — cursor aura + grain noise */}
      <CursorGrainyCloud />

      {/* Static architectural grid */}
      <div className="absolute inset-0 pointer-events-none z-0" style={gridStyle} />

      <Navbar />

      <div className="relative z-10 flex flex-col w-full pb-16">
        <Hero />
        <ProblemSection />
        <HowItWorks />
        <FeatureShowcase />
        <ComparisonSection />
        <TargetUsers />
        <Testimonials />
        <AudioPlayerMessage />
      </div>

      <AboutUs />
      <Footer />
    </div>
  );
}
