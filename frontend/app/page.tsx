import Link from 'next/link';
import Image from 'next/image';
import DualModeSection from './components/home/DualModeSection';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import FeatureShowcase from './components/home/FeatureShowcase';
import Testimonials from './components/home/Testimonials';
import ProcessTimeline from './components/home/ProcessTimeline';
import StatsSection from './components/home/StatsSection';
import FAQSection from './components/home/FAQSection';
import ComparisonSection from './components/home/ComparisonSection';
import { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://emble.in',
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-brand-black font-sans antialiased selection:bg-brand-orange-hover selection:text-white relative overflow-x-hidden">
      <Navbar />

      {/* Hero Section - Violet/Gradient Theme */}
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-20 overflow-hidden">
        {/* Static Background Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none bg-gradient-to-br from-brand-orange/5 via-transparent to-slate-600/5"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center">
          {/* Main Content */}
          <div className="w-full max-w-4xl text-center flex flex-col items-center space-y-6 animate-fade-in-up mb-16">

            {/* Headline - Mechanism + Outcome */}
            <h1 className="text-4xl md:text-6xl lg:text-[72px] font-[900] tracking-tight text-brand-black mb-4 mt-2 leading-[1.1] text-balance">
              Train on real coding rounds <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange via-orange-600 to-slate-600 pb-2">
                & mock interviews.
              </span>
            </h1>

            {/* Subtext - Short, easy, empathetic */}
            <p className="text-[18px] md:text-[20px] text-slate-600 font-medium leading-[1.6] max-w-[600px] mx-auto text-balance mt-6 mb-8">
              You can't pass a technical interview you've never seen. We perfectly simulate real coding rounds, AI interviews, and the exact pressure of top companies – so you walk in prepared and walk out hired.
            </p>

            {/* CTAs - Deep Tech Action Oriented */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mt-6">
              <Link href="/register" aria-label="Practice Now (Free)" className="w-full sm:w-auto h-12 px-8 rounded-[8px] bg-brand-orange hover:bg-orange-600 text-white font-bold text-[16px] transition-all shadow-[0_0_20px_rgba(255,90,0,0.3)] hover:shadow-[0_0_30px_rgba(255,90,0,0.5)] flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap ring-1 ring-brand-orange/50">
                Practice Now (Free)
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
              <Link href="/curriculum" aria-label="View Curriculum" className="w-full sm:w-auto h-12 px-8 rounded-[8px] bg-white border border-gray-200 hover:border-gray-400 hover:bg-gray-50 text-brand-black font-semibold text-[16px] transition-all flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap shadow-sm">
                <span className="material-symbols-outlined text-[18px] text-gray-400">terminal</span>
                View Curriculum
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-6 sm:mt-10">
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 px-4">
                <div className="flex -space-x-3">
                  <Image src="https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=64&q=80" alt="Student" width={38} height={38} className="w-[38px] h-[38px] rounded-full border-[2px] border-white shadow-sm z-30 relative object-cover bg-gray-100" />
                  <Image src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=64&q=80" alt="Student" width={38} height={38} className="w-[38px] h-[38px] rounded-full border-[2px] border-white shadow-sm z-20 relative object-cover bg-gray-100" />
                  <Image src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=64&q=80" alt="Student" width={38} height={38} className="w-[38px] h-[38px] rounded-full border-[2px] border-white shadow-sm z-10 relative object-cover bg-gray-100" />
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
              <div className="absolute -inset-2 bg-gradient-to-r from-brand-orange/20 to-slate-600/20 rounded-[40px] opacity-10 blur-xl group-hover:opacity-30 transition duration-500 pointer-events-none"></div>

              <Image
                src="/images/dsa-training-simulator.png"
                alt="Emble DSA Training Simulator"
                width={1024}
                height={768}
                priority
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

      <StatsSection />

      <Testimonials />

      <FAQSection />

      <section className="py-16 md:py-32 bg-white border-t border-gray-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-orange to-slate-600 opacity-20"></div>
        <div className="max-w-6xl mx-auto px-6 text-center space-y-12">
          <h2 className="text-6xl md:text-[85px] font-[900] text-brand-black tracking-tighter text-balance leading-[0.95] mb-2">
            Get Hired <br /> <span className="text-gradient">Faster.</span>
          </h2>
          <p className="text-gray-500 text-2xl max-w-2xl mx-auto font-medium leading-relaxed mt-0">
            Join the 400+ developers actively simulating real MNC loops and bypassing standard recruitment filters.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 pt-6">
            <Link href="/register" aria-label="Practice Now (Free)" className="h-[64px] px-12 rounded-xl bg-brand-orange hover:bg-orange-600 text-white font-[900] text-lg transition-all shadow-[0_0_20px_rgba(255,90,0,0.3)] hover:shadow-[0_0_30px_rgba(255,90,0,0.5)] flex items-center justify-center gap-2 active:scale-95 ring-1 ring-brand-orange/50">
              Practice Now (Free)
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </Link>
            <Link href="/computer-science-placement-preparation" className="h-[64px] px-10 rounded-xl bg-white border border-gray-200 hover:border-gray-400 text-brand-black hover:bg-gray-50 font-[800] text-lg transition-all shadow-sm flex items-center justify-center active:scale-95">
              Read the Placement Guide
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
