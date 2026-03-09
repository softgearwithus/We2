import Link from 'next/link';
import DualModeSection from './components/home/DualModeSection';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import Testimonials from './components/home/Testimonials';
import ProcessTimeline from './components/home/ProcessTimeline';
import StatsSection from './components/home/StatsSection';
import FAQSection from './components/home/FAQSection';
import ComparisonSection from './components/home/ComparisonSection';
import RoadmapPreview from './components/home/RoadmapPreview';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-brand-black font-sans antialiased selection:bg-brand-orange-hover selection:text-white relative">
      <Navbar />

      {/* Hero Section - Violet/Gradient Theme */}
      <section className="relative pt-32 pb-16 lg:pt-48 lg:pb-20 overflow-hidden">
        {/* Static Background Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none bg-gradient-to-br from-brand-orange/5 via-transparent to-purple-600/5"></div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">


          {/* Left Content */}
          <div className="relative z-10 flex flex-col items-start text-left">

            {/* Badge - High Contrast Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 mb-8 transition-all hover:bg-orange-100 cursor-default group shadow-sm">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-orange"></span>
              </span>
              <span className="text-sm font-bold text-orange-800 tracking-tight">Join 200+ Active Students</span>
            </div>

            {/* Headline - Balanced & Vibrant */}
            <h1 className="text-5xl md:text-7xl lg:text-[80px] font-[900] tracking-tight text-brand-black mb-8 leading-[1.1] text-balance">
              The Complete <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange via-orange-600 to-purple-600 pb-2">
                Placement & Internship Accelerator.
              </span>
            </h1>

            {/* Subtext - Optimized for Readability */}
            <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed max-w-xl mb-10 text-balance">
              Closing the gap between theoretical learning and industry reality. We train you to master Data Structures & Algorithms, crush tech interviews with AI Mock Interviews, and write code that FAANG companies actually hire for.
            </p>

            {/* CTAs - Polished & Tactile */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-16 w-full sm:w-auto">
              <Link href="/register" aria-label="Register for the top trending coding bootcamp" className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-brand-black hover:bg-gray-900 text-white font-bold text-lg transition-all shadow-xl hover:shadow-brand-orange/20 hover:-translate-y-1 flex items-center justify-center gap-2 active:scale-95">
                Join Bootcamp
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">arrow_forward</span>
              </Link>
              <Link href="/curriculum" aria-label="View our full stack software engineering curriculum" className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-white border border-gray-200 text-brand-black font-bold text-lg hover:border-brand-orange hover:bg-gray-50 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 active:scale-95 group">
                <span className="material-symbols-outlined text-brand-orange group-hover:scale-110 transition-transform filled-icon" aria-hidden="true">play_circle</span>
                View Curriculum
              </Link>
            </div>

            {/* Social Proof - Subtle & Trustworthy */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-4">
                <img className="w-10 h-10 rounded-full border-[3px] border-white shadow-sm" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&q=80" alt="Emble Student Reviewer 1" />
                <img className="w-10 h-10 rounded-full border-[3px] border-white shadow-sm" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&q=80" alt="Emble Student Reviewer 2" />
                <img className="w-10 h-10 rounded-full border-[3px] border-white shadow-sm" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&q=80" alt="Emble Student Reviewer 3" />
                <div className="w-10 h-10 rounded-full border-[3px] border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 shadow-sm">+200</div>
              </div>
              <div className="h-8 w-px bg-gray-200 mx-2"></div>
              <div className="flex flex-col">
                <div className="flex gap-0.5 text-yellow-500 text-[10px]">
                  <span className="material-symbols-outlined text-[14px] filled-icon">star</span>
                  <span className="material-symbols-outlined text-[14px] filled-icon">star</span>
                  <span className="material-symbols-outlined text-[14px] filled-icon">star</span>
                  <span className="material-symbols-outlined text-[14px] filled-icon">star</span>
                  <span className="material-symbols-outlined text-[14px] filled-icon">star_half</span>
                </div>
                <p className="text-xs font-bold text-gray-500 mt-0.5">4.3/5 <span className="text-gray-900">Student Satisfaction</span></p>
              </div>
            </div>
          </div>

          {/* Right Visual - Interactive Code Card */}
          <div className="relative md:block hidden">
            <div className="relative rounded-[32px] bg-gray-900 shadow-2xl p-6 border border-white/10 group perspective">
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-orange/20 to-purple-600/20 rounded-[40px] opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none mix-blend-overlay"></div>

              {/* Window Controls */}
              <div className="flex items-center gap-2 mb-8 px-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>

              {/* Code Content */}
              <div className="font-mono text-sm leading-8 p-4 bg-gray-950/50 rounded-2xl border border-white/5">
                <div className="text-gray-400">
                  <span className="text-purple-400">class</span> <span className="text-yellow-300">Solution</span> <span className="text-gray-100">{`{`}</span>
                </div>
                <div className="pl-6 text-gray-300">
                  <span className="text-purple-400">public</span> <span className="text-blue-300">int</span> <span className="text-yellow-300 font-bold underline decoration-brand-orange/30 decoration-2 underline-offset-4">maxProfit</span>(<span className="text-blue-300">int[]</span> prices) <span className="text-gray-100 font-bold">{`{`}</span>
                </div>
                <div className="pl-12 text-gray-500 italic">
                  <span>// Dynamic Programming approach</span>
                </div>
                <div className="pl-12 text-gray-300">
                  <span className="text-blue-300">int</span> minPrice = <span className="text-purple-400">Integer</span>.<span className="italic">MAX_VALUE</span>;
                </div>
                <div className="pl-12 text-gray-300">
                  <span className="text-blue-300">int</span> maxProfit = <span className="text-blue-300">0</span>;
                </div>
                <div className="pl-12 text-gray-300 mt-2">
                  <span className="text-purple-400 font-semibold">for</span> (<span className="text-blue-300">int</span> price : prices) <span className="text-gray-100">{`{`}</span>
                </div>
                <div className="pl-18 text-gray-300">
                  <span className="text-purple-400">if</span> (price &lt; minPrice) minPrice = price;
                </div>
                <div className="pl-18 text-gray-300">
                  <span className="text-purple-400">else if</span> (price - minPrice &gt; maxProfit) maxProfit = price - minPrice;
                </div>
                <div className="pl-12 text-gray-100">{`}`}</div>
                <div className="pl-4 text-gray-100">{`}`}</div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-10 -right-10 glass p-5 rounded-3xl shadow-xl border border-white/40 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-200">
                  <span className="material-symbols-outlined font-black text-3xl">check</span>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Live Status</div>
                  <div className="text-lg font-black text-brand-black tracking-tight">Optimal Solution Found</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      <ProcessTimeline />

      <DualModeSection />

      <ComparisonSection />

      <RoadmapPreview />

      <StatsSection />

      <Testimonials />

      <FAQSection />

      <section className="py-32 bg-white border-t border-gray-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-orange to-purple-600 opacity-20"></div>
        <div className="max-w-6xl mx-auto px-6 text-center space-y-12">
          <h2 className="text-6xl md:text-[100px] font-[900] text-brand-black tracking-tighter text-balance leading-[0.85]">
            Start Your <br /> <span className="text-gradient">Story Today.</span>
          </h2>
          <p className="text-gray-400 text-2xl max-w-3xl mx-auto font-medium opacity-80 leading-relaxed">
            Join 200+ students already mastering their future with EMBLE's Top Trending Software Engineering Bootcamp.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6 pt-10">
            <Link href="/register" aria-label="Get started with EMBLE placement training" className="h-[72px] px-16 rounded-2xl bg-brand-black hover:bg-gray-900 text-white font-[900] text-xl transition-all shadow-2xl hover:shadow-brand-orange/20 hover:-translate-y-2 flex items-center justify-center active:scale-95">
              Get Started Now
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
