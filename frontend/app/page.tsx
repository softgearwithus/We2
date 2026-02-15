import Link from 'next/link';
import DualModeSection from './components/home/DualModeSection';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import TrustedBy from './components/home/TrustedBy';
import Testimonials from './components/home/Testimonials';
import ProcessTimeline from './components/home/ProcessTimeline';
import StatsSection from './components/home/StatsSection';
import FAQ from './components/home/FAQ';
import ComparisonSection from './components/home/ComparisonSection';
import RoadmapPreview from './components/home/RoadmapPreview';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-brand-black font-sans antialiased selection:bg-brand-orange-hover selection:text-white relative">
      <Navbar />

      {/* Hero Section - Violet/Gradient Theme */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Animated Glow */}
        <div className="absolute top-0 right-0 -z-10 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[1000px] h-[1000px] rounded-full bg-brand-orange/10 blur-[150px] animate-pulse-soft"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] rounded-full bg-purple-500/10 blur-[150px] animate-pulse-soft" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

          {/* Left Content */}
          <div className="relative z-10 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-orange-100 text-brand-orange text-[12px] font-extrabold uppercase tracking-widest mb-10 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-brand-orange animate-ping" />
              Empowering 5,000+ Aspiring Engineers
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-[80px] font-[900] tracking-tight text-brand-black mb-10 leading-[1] text-balance">
              The Complete <br />
              <span className="text-gradient">
                Placement Ecosystem.
              </span>
            </h1>

            <p className="text-xl text-gray-500 leading-relaxed max-w-lg mb-12 font-medium text-balance opacity-90">
              Don't just code. <strong className="text-brand-black">Prep0</strong> gets you placement-ready (DSA, CS Core, Mocks), and <strong className="text-brand-black">We2Hub</strong> gives you the industrial experience (Real-world JIRA Simulation).
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-5 mb-16">
              <Link href="/register" className="w-full sm:w-auto h-16 px-12 rounded-2xl bg-brand-black hover:bg-gray-900 text-white font-bold text-lg transition-all shadow-2xl hover:shadow-brand-orange/20 hover:-translate-y-1 flex items-center justify-center gap-3 active:scale-95">
                Start Prep0 Free
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </Link>
              <Link href="/simulations" className="w-full sm:w-auto h-16 px-12 rounded-2xl glass border border-gray-200 text-brand-black font-bold text-lg hover:border-brand-orange transition-all flex items-center justify-center gap-3 group active:scale-95">
                <span className="material-symbols-outlined text-brand-orange group-hover:rotate-12 transition-transform">play_circle</span>
                Explore We2Hub
              </Link>
            </div>

            <div className="flex items-center gap-5 text-sm font-bold text-gray-500">
              <div className="flex -space-x-3">
                <img className="w-12 h-12 rounded-full border-4 border-white shadow-xl" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&q=80" alt="User" />
                <img className="w-12 h-12 rounded-full border-4 border-white shadow-xl" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&q=80" alt="User" />
                <img className="w-12 h-12 rounded-full border-4 border-white shadow-xl" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&q=80" alt="User" />
                <div className="w-12 h-12 rounded-full border-4 border-white bg-gray-50 flex items-center justify-center text-xs text-gray-400 font-black border-dashed">+2000</div>
              </div>
              <p className="tracking-tight">Join 2,000+ students mastering skills today</p>
            </div>
          </div>

          {/* Right Visual - Interactive Code Card */}
          <div className="relative animate-fade-in-up md:block hidden" style={{ animationDelay: '0.2s' }}>
            <div className="relative rounded-[32px] bg-gray-900 shadow-[0_40px_100px_rgba(0,0,0,0.4)] p-6 rotate-2 border border-white/10 hover:rotate-0 hover:scale-105 transition-all duration-700 group perspective">
              <div className="absolute -inset-2 bg-gradient-to-r from-brand-orange/20 to-purple-600/20 rounded-[40px] blur-2xl opacity-0 group-hover:opacity-100 transition duration-1000 pointer-events-none"></div>

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
              <div className="absolute -bottom-10 -right-10 glass p-5 rounded-3xl shadow-2xl border border-white/40 animate-bounce-slow flex items-center gap-4 transition-transform hover:scale-110">
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

      <TrustedBy />

      <ProcessTimeline />

      <DualModeSection />

      <ComparisonSection />

      <RoadmapPreview />

      <StatsSection />

      <Testimonials />

      <FAQ />

      <section className="py-48 bg-white border-t border-gray-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-orange to-purple-600 opacity-20"></div>
        <div className="max-w-6xl mx-auto px-6 text-center space-y-12">
          <h2 className="text-6xl md:text-[100px] font-[900] text-brand-black tracking-tighter text-balance leading-[0.85] animate-pulse-soft">
            Start Your <br /> <span className="text-gradient">Story Today.</span>
          </h2>
          <p className="text-gray-400 text-2xl max-w-3xl mx-auto font-medium opacity-80 leading-relaxed">
            Join 2,000+ students already mastering their future with We2.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6 pt-10">
            <Link href="/register" className="h-[72px] px-16 rounded-2xl bg-brand-black hover:bg-gray-900 text-white font-[900] text-xl transition-all shadow-2xl hover:shadow-brand-orange/20 hover:-translate-y-2 flex items-center justify-center active:scale-95">
              Get Started Now
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
