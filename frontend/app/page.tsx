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
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 -z-10 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-brand-orange/5 blur-3xl opacity-50"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-500/5 blur-3xl opacity-50"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left Content */}
          <div className="relative z-10 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-brand-orange text-[11px] font-bold uppercase tracking-widest mb-8 border border-orange-100 hover:bg-orange-100 transition-colors cursor-default">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
              Empowering 5,000+ Aspiring Engineers
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-brand-black mb-8 leading-[1.1]">
              Launch Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-purple-600">
                Developer Career.
              </span>
            </h1>

            <p className="text-xl text-gray-500 leading-relaxed max-w-lg mb-10 font-medium text-balance">
              Master data structures, build real-world projects, and get hired by top tech companies. The platform that finally bridges the gap between campus and industry.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
              <Link href="/register" className="w-full sm:w-auto h-14 px-10 rounded-xl bg-brand-black hover:bg-gray-900 text-white font-bold text-base transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2">
                Start Learning Free
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
              <Link href="/simulations" className="w-full sm:w-auto h-14 px-10 rounded-xl bg-white border border-gray-200 text-brand-black font-bold text-base hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 group">
                <span className="material-symbols-outlined text-brand-orange group-hover:scale-110 transition-transform">play_circle</span>
                Watch Demo
              </Link>
            </div>

            <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
              <div className="flex -space-x-3">
                <img className="w-10 h-10 rounded-full border-2 border-white shadow-sm" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&q=80" alt="User" />
                <img className="w-10 h-10 rounded-full border-2 border-white shadow-sm" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&q=80" alt="User" />
                <img className="w-10 h-10 rounded-full border-2 border-white shadow-sm" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&q=80" alt="User" />
                <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center text-xs text-gray-400 font-bold border-dashed">+2k</div>
              </div>
              <p>Join 2,000+ students learning today</p>
            </div>
          </div>

          {/* Right Visual - Interactive Code Card */}
          <div className="relative animate-fade-in-up md:block hidden" style={{ animationDelay: '0.2s' }}>
            <div className="relative rounded-2xl bg-gray-900 shadow-2xl p-4 rotate-1 border border-gray-800 hover:rotate-0 transition-transform duration-500 group">
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-orange to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 pointer-events-none"></div>

              {/* Window Controls */}
              <div className="flex items-center gap-2 mb-6 px-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
              </div>

              {/* Code Content */}
              <div className="font-mono text-sm leading-relaxed p-2">
                <div className="text-gray-400">
                  <span className="text-purple-400">class</span> <span className="text-yellow-300">Solution</span> <span className="text-gray-100">{`{`}</span>
                </div>
                <div className="pl-4 text-gray-300">
                  <span className="text-purple-400">public</span> <span className="text-blue-400">int</span> <span className="text-yellow-300">maxProfit</span>(<span className="text-blue-400">int[]</span> prices) <span className="text-gray-100">{`{`}</span>
                </div>
                <div className="pl-8 text-gray-400">
                  <span className="text-gray-500">// Dynamic Programming approach</span>
                </div>
                <div className="pl-8 text-gray-300">
                  <span className="text-blue-400">int</span> minPrice = <span className="text-purple-400">Integer</span>.MAX_VALUE;
                </div>
                <div className="pl-8 text-gray-300">
                  <span className="text-blue-400">int</span> maxProfit = 0;
                </div>
                <div className="pl-8 text-gray-300 mt-2">
                  <span className="text-purple-400">for</span> (<span className="text-blue-400">int</span> price : prices) <span className="text-gray-100">{`{`}</span>
                </div>
                <div className="pl-12 text-gray-300">
                  <span className="text-purple-400">if</span> (price &lt; minPrice)
                </div>
                <div className="pl-16 text-gray-300">
                  minPrice = price;
                </div>
                <div className="pl-12 text-gray-300">
                  <span className="text-purple-400">else if</span> (price - minPrice &gt; maxProfit)
                </div>
                <div className="pl-16 text-gray-300">
                  maxProfit = price - minPrice;
                </div>
                <div className="pl-8 text-gray-100">{`}`}</div>
                <div className="pl-8 text-gray-300 mt-2">
                  <span className="text-purple-400">return</span> maxProfit;
                </div>
                <div className="pl-4 text-gray-100">{`}`}</div>
                <div className="text-gray-100">{`}`}</div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-premium border border-gray-100 animate-bounce-slow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <span className="material-symbols-outlined font-bold">check_circle</span>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Status</div>
                    <div className="text-sm font-bold text-brand-black">Tests Passed</div>
                  </div>
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

      <section className="py-24 bg-white" id="features">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <span className="text-brand-orange font-bold text-xs uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
              Why Choose We2
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-brand-black tracking-tight mt-6 mb-4">
              Everything you need to <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-purple-600">master the craft.</span>
            </h2>
            <p className="text-xl text-gray-500">
              We've deconstructed the placement process into a science.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="premium-card p-10 group hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8 border border-blue-100 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">smart_toy</span>
              </div>
              <h4 className="text-2xl font-bold text-brand-black mb-3">AI Mentorship</h4>
              <p className="text-gray-500 leading-relaxed">
                Get instant help with your code 24/7. Our AI explains complex concepts, debugs your errors, and helps you optimize solutions.
              </p>
            </div>

            <div className="premium-card p-10 group hover:-translate-y-2 transition-transform duration-300 bg-brand-black text-white border-gray-800 shadow-xl shadow-purple-900/5">
              <div className="w-14 h-14 bg-gray-800 text-brand-orange rounded-2xl flex items-center justify-center mb-8 border border-gray-700 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">calendar_today</span>
              </div>
              <h4 className="text-2xl font-bold text-white mb-3">Structured Sprints</h4>
              <p className="text-gray-400 leading-relaxed">
                Stop wasting time on random tutorials. Follow a proven 21-day roadmap designed by experts to master concepts one step at a time.
              </p>
            </div>

            <div className="premium-card p-10 group hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-8 border border-green-100 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">verified_user</span>
              </div>
              <h4 className="text-2xl font-bold text-brand-black mb-3">Verified Experience</h4>
              <p className="text-gray-500 leading-relaxed">
                Build a portfolio that stands out. Complete real-world tasks and get a verified skill certificate that top recruiters trust.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Testimonials />

      <FAQ />

      <section className="py-40 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-7xl font-extrabold text-brand-black tracking-tight text-balance leading-[1.1] mb-8">
            Ready to debug your <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-purple-600">career trajectory?</span>
          </h2>
          <p className="text-gray-500 text-xl max-w-2xl mx-auto mb-12 font-medium">
            Join 2,000+ students already mastering their future with We2.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register" className="h-16 px-12 rounded-xl bg-brand-black hover:bg-gray-900 text-white font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2">
              Get Started Now
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
