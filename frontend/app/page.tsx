import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Hero from './components/home/Hero';
import dynamic from 'next/dynamic';
import { Metadata } from 'next';
import CursorGrainyCloud from './components/shared/CursorGrainyCloud';

import ProblemSection from './components/home/ProblemSection';
import HowItWorks from './components/home/HowItWorks';
import FeatureShowcase from './components/home/FeatureShowcase';
import ComparisonSection from './components/home/ComparisonSection';
import TargetUsers from './components/home/TargetUsers';
import Testimonials from './components/home/Testimonials';
import AboutUs from './components/home/AboutUs';

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
    'linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)',
  backgroundSize: '40px 40px',
} as const;

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-indigo-100 selection:text-indigo-900 relative overflow-x-hidden">
      <Navbar />

      <div className="relative z-10 flex flex-col w-full pb-16">
        <Hero />
        <ProblemSection />
        <HowItWorks />
        <FeatureShowcase />
        <ComparisonSection />
        <Testimonials />
      </div>

      <Footer />
    </div>
  );
}
