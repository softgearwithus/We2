import Link from 'next/link';
import DualModeSection from './components/home/DualModeSection';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import FeatureShowcase from './components/home/FeatureShowcase';
import Testimonials from './components/home/Testimonials';
import ProcessTimeline from './components/home/ProcessTimeline';
import StatsSection from './components/home/StatsSection';
import FAQSection from './components/home/FAQSection';
import ComparisonSection from './components/home/ComparisonSection';
import RoadmapPreview from './components/home/RoadmapPreview';
import { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://emble.in',
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-brand-black font-sans antialiased selection:bg-brand-orange-hover selection:text-white relative">
      <Navbar />

      {/* Hero Section - Violet/Gradient Theme */}
      <section className="relative pt-32 pb-16 lg:pt-48 lg:pb-20 overflow-hidden">
        {/* Static Background Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none bg-gradient-to-br from-brand-orange/5 via-transparent to-purple-600/5"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center">
          {/* Main Content */}
          <div className="w-full max-w-4xl text-center flex flex-col items-center space-y-6 animate-fade-in-up mb-16">

            {/* Headline - Balanced & Vibrant */}
            <h1 className="text-5xl md:text-7xl lg:text-[85px] font-[900] tracking-tight text-brand-black mb-2 mt-2 leading-[1.05] text-balance">
              Crack Your Dream <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange via-orange-600 to-purple-600 pb-2">
                Companies.
              </span>
            </h1>

            {/* Subtext - Optimized for Readability */}
            <p className="text-lg md:text-[20px] text-gray-500 font-medium leading-[1.6] max-w-2xl mx-auto text-balance mt-4 mb-6">
              From intelligent DSA training and AI mock interviews to ATS-optimized resumes and targeted company mock tests. Your complete placement preparation ecosystem.
            </p>

            {/* CTAs - Polished & Tactile */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mt-2">
              <Link href="/register" aria-label="Get Free Interview Readiness Score" className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-brand-black hover:bg-gray-900 text-white font-bold text-[17px] transition-all shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap">
                Get Free Readiness Score <span className="text-xl leading-none">✨</span>
              </Link>
              <Link href="/curriculum" aria-label="View Curriculum" className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-white border border-gray-200 hover:bg-gray-50 text-brand-black font-bold text-[17px] transition-all shadow-sm hover:shadow-md hover:-translate-y-1 flex items-center justify-center gap-3 active:scale-95 whitespace-nowrap">
                <div className="flex items-center justify-center w-6 h-6 rounded-full border-[2px] border-brand-orange text-brand-orange">
                  <span className="material-symbols-outlined text-[14px] ml-0.5">play_arrow</span>
                </div>
                View Curriculum
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-6 sm:mt-10">
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 px-4">
                <div className="flex -space-x-3">
                  <img src="https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=64&q=80" alt="Student" className="w-[38px] h-[38px] rounded-full border-[2px] border-white shadow-sm z-30 relative object-cover bg-gray-100" />
                  <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=64&q=80" alt="Student" className="w-[38px] h-[38px] rounded-full border-[2px] border-white shadow-sm z-20 relative object-cover bg-gray-100" />
                  <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=64&q=80" alt="Student" className="w-[38px] h-[38px] rounded-full border-[2px] border-white shadow-sm z-10 relative object-cover bg-gray-100" />
                  <div className="w-[38px] h-[38px] rounded-full border-[2px] border-white shadow-sm bg-gray-50 flex items-center justify-center text-[10px] font-bold text-gray-500 relative z-0">
                    +400
                  </div>
                </div>
                <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
                <div className="text-left flex flex-col justify-center">
                  <div className="flex gap-[3px] text-[#F3C522] text-lg leading-none mb-1">
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                    <span style={{ 
                      background: 'linear-gradient(90deg, #F3C522 30%, #E5E7EB 30%)', 
                      WebkitBackgroundClip: 'text', 
                      WebkitTextFillColor: 'transparent',
                      display: 'inline-block'
                    }}>★</span>
                  </div>
                  <div className="text-[11px] font-[600] text-gray-700 tracking-wide text-center sm:text-left">
                    <span className="font-[800]">4.3/5</span> Student Satisfaction
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Large Center Visual - Interactive Dashboard Preview */}
          <div className="w-full max-w-5xl mx-auto relative perspective-[2000px] animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="relative rounded-[32px] bg-white/20 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] p-2 md:p-4 border border-black/5 group transform rotate-x-[8deg] hover:rotate-x-[0deg] transition-transform duration-1000 ease-out origin-bottom">
              <div className="absolute -inset-2 bg-gradient-to-r from-brand-orange/20 to-purple-600/20 rounded-[40px] opacity-10 blur-xl group-hover:opacity-30 transition duration-500 pointer-events-none"></div>
              
              <img 
                src="/images/dsa-training-simulator.png" 
                alt="Emble DSA Training Simulator" 
                className="w-full h-auto rounded-[24px] shadow-2xl shadow-black/20 object-cover border border-white"
              />

              {/* Floating Badge */}
              <div className="absolute -bottom-6 -right-6 md:right-auto md:-left-6 glass p-4 rounded-3xl shadow-xl border border-white/60 flex items-center gap-4 bg-white/90 backdrop-blur-2xl z-20 hover:-translate-y-2 transition-transform duration-300">
                <div className="w-12 h-12 rounded-2xl bg-brand-orange flex items-center justify-center text-white shadow-lg shadow-brand-orange/30">
                  <span className="material-symbols-outlined font-black text-2xl">bolt</span>
                </div>
                <div className="hidden sm:block">
                  <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Real-Time Sync</div>
                  <div className="text-base font-black text-brand-black tracking-tight">Optimal Solution</div>
                </div>
              </div>

              {/* Second Floating Badge */}
               <div className="absolute -top-6 -right-6 glass p-4 rounded-3xl shadow-xl border border-white/60 hidden md:flex items-center gap-4 bg-white/90 backdrop-blur-2xl z-20 hover:-translate-y-2 transition-transform duration-300">
                <div className="w-12 h-12 rounded-2xl bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-500/30">
                   <span className="material-symbols-outlined font-black text-2xl">check_circle</span>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Runtime</div>
                  <div className="text-base font-black text-brand-black tracking-tight">0ms (Beats 100%)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FeatureShowcase />

      <ProcessTimeline />

      <DualModeSection />

      <ComparisonSection />

      <RoadmapPreview />

      <StatsSection />

      <Testimonials />

      <FAQSection />

      <section className="py-16 md:py-32 bg-white border-t border-gray-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-orange to-purple-600 opacity-20"></div>
        <div className="max-w-6xl mx-auto px-6 text-center space-y-12">
          <h2 className="text-6xl md:text-[100px] font-[900] text-brand-black tracking-tighter text-balance leading-[0.85]">
            Start Your <br /> <span className="text-gradient">Story Today.</span>
          </h2>
          <p className="text-gray-400 text-2xl max-w-3xl mx-auto font-medium opacity-80 leading-relaxed">
            Join 400+ students already mastering their future with EMBLE's Top Trending Software Engineering Bootcamp.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 pt-10">
            <Link href="/register" aria-label="Get started with EMBLE placement training" className="h-[72px] px-16 rounded-2xl bg-brand-black hover:bg-gray-900 text-white font-[900] text-xl transition-all shadow-2xl hover:shadow-brand-orange/20 hover:-translate-y-2 flex items-center justify-center active:scale-95">
              Get Started Now
            </Link>
            <Link href="/computer-science-placement-preparation" className="h-[72px] px-10 rounded-2xl bg-white border-2 border-brand-black text-brand-black font-[900] text-xl transition-all shadow-lg hover:-translate-y-2 flex items-center justify-center active:scale-95">
              Ultimate CS Placement Guide
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
