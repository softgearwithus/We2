import Link from 'next/link';
import DualModeSection from './components/home/DualModeSection';
import DotBackground from './components/ui/DotBackground';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-brand-black font-sans antialiased selection:bg-brand-orange-hover selection:text-white relative">
      <Navbar />

      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left Content */}
          <div className="relative z-10 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-brand-orange text-[11px] font-bold uppercase tracking-widest mb-6 border border-orange-100">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
              We2 — Prep0 + We2Hub
            </div>

            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-brand-black mb-6 leading-[1.1]">
              Learn. Build. <br />
              <span className="text-brand-orange">Get Placed.</span>
            </h1>

            <p className="text-xl text-gray-500 leading-relaxed max-w-lg mb-8 font-medium">
              From aptitude and DSA to mock interviews, resume building, and real-world work simulations — <strong className="text-brand-black">We2</strong> is your complete career launchpad.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-4 mb-12">
              <Link href="/register" className="h-12 px-8 rounded-lg bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-base transition-all shadow-subtle hover:shadow-md flex items-center gap-2">
                Start Learning
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
              <Link href="/simulations" className="h-12 px-8 rounded-lg bg-white border border-gray-200 text-gray-600 font-bold text-base hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center gap-2">
                Explore Simulations
              </Link>
            </div>

            <div className="flex items-center gap-8 grayscale opacity-70">
              {/* Simple text logos for trust, clean */}
              <span className="font-bold text-gray-400">Google</span>
              <span className="font-bold text-gray-400">Meta</span>
              <span className="font-bold text-gray-400">Uber</span>
              <span className="font-bold text-gray-400">Stripe</span>
            </div>
          </div>

          {/* Right Visual - Clean Dashboard Preview */}
          <div className="relative animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="relative rounded-2xl bg-white border border-gray-200 shadow-premium p-2 rotate-1 hover:rotate-0 transition-transform duration-500">
              <div className="rounded-xl overflow-hidden bg-gray-50 aspect-[4/3] relative border border-gray-100">
                {/* Abstract Code/IDE Representation */}
                <div className="flex h-full">
                  <div className="w-16 bg-white border-r border-gray-100 flex flex-col items-center py-4 gap-4">
                    <div className="w-2 h-2 rounded-full bg-red-400 mb-2"></div>
                    <div className="w-6 h-6 rounded bg-gray-100"></div>
                    <div className="w-6 h-6 rounded bg-gray-100"></div>
                    <div className="w-6 h-6 rounded bg-gray-100"></div>
                  </div>
                  <div className="flex-1 p-6 font-mono text-sm text-gray-400">
                    <div className="flex gap-2 mb-2">
                      <span className="text-purple-500">const</span>
                      <span className="text-blue-600">solveProblem</span>
                      <span>=</span>
                      <span className="text-brand-orange">async</span>
                      <span>()</span>
                      <span>=&gt;</span>
                      <span>{`{`}</span>
                    </div>
                    <div className="pl-4 text-gray-500">
                      <span className="text-gray-400">// TODO: Optimize Solution</span>
                    </div>
                    <div className="pl-4 mt-2">
                      <span className="text-purple-500">await</span>
                      <span className="text-brand-black">submitCode</span>
                      <span>(</span>
                      <span className="text-green-600">solution</span>
                      <span>);</span>
                    </div>
                    <div className="mt-2 text-brand-black">
                      <span>{`}`}</span>
                    </div>

                    <div className="mt-8 p-4 bg-brand-black rounded-lg shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-blue-500"></div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400 text-xs">Test Cases</span>
                        <div className="flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        </div>
                      </div>
                      <div className="text-green-400 text-xs">
                        &gt; All tests passed! (0.4s)<br />
                        &gt; Time Complexity: O(n)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decoration Elements */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br from-orange-100/30 to-blue-50/30 blur-3xl rounded-full opacity-60"></div>
          </div>
        </div>
      </section>

      <DualModeSection />

      <section className="py-24 bg-white" id="features">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <span className="text-brand-orange font-bold text-xs uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
              Why Choose Us
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-brand-black tracking-tight mt-6 mb-4">
              Everything you need to succeed.
            </h2>
            <p className="text-xl text-gray-500">
              From basic coding fundamentals to advanced system design, we have you covered.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* AI Mentorship */}
            <div className="premium-card p-8 group">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 border border-blue-100 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">smart_toy</span>
              </div>
              <h4 className="text-xl font-bold text-brand-black mb-3">AI Mentorship</h4>
              <p className="text-gray-500 leading-relaxed">
                Get instant help with your code. Our AI explains complex concepts and helps you debug efficiently.
              </p>
            </div>

            {/* 21-Day Sprint */}
            <div className="premium-card p-8 group md:-translate-y-4">
              <div className="w-14 h-14 bg-orange-50 text-brand-orange rounded-xl flex items-center justify-center mb-6 border border-orange-100 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">calendar_today</span>
              </div>
              <h4 className="text-xl font-bold text-brand-black mb-3">Structured Learning</h4>
              <p className="text-gray-500 leading-relaxed">
                Follow a proven roadmap designed by industry experts to master concepts one step at a time.
              </p>
            </div>

            {/* Verified Experience */}
            <div className="premium-card p-8 group">
              <div className="w-14 h-14 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-6 border border-green-100 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">verified_user</span>
              </div>
              <h4 className="text-xl font-bold text-brand-black mb-3">Placement Support</h4>
              <p className="text-gray-500 leading-relaxed">
                Build a portfolio that stands out. We help you connect with top companies looking for talent.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-32 py-24 overflow-hidden bg-brand-secondary/30">
        <div className="max-w-7xl mx-auto px-6" id="students">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="order-2 lg:order-1">
              <div className="rounded-2xl overflow-hidden shadow-premium border border-gray-100">
                <img
                  alt="Student collaboration"
                  className="w-full h-[450px] object-cover hover:scale-105 transition-transform duration-700"
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
                />
              </div>
            </div>
            <div className="order-1 lg:order-2 space-y-6">
              <span className="bg-white border border-gray-200 text-brand-black px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                For Students
              </span>
              <h2 className="text-4xl font-bold text-brand-black tracking-tight leading-[1.2]">
                Fast-track your career <br /> by two years.
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed">
                Instead of passive tutorials, build active work history. Graduate
                with a portfolio of completed industrial tasks and a verified skill score.
              </p>
              <div className="flex gap-12 pt-4">
                <div>
                  <div className="text-4xl font-extrabold text-brand-orange">94%</div>
                  <div className="text-xs text-brand-black font-bold uppercase tracking-widest mt-1">
                    Success Rate
                  </div>
                </div>
                <div>
                  <div className="text-4xl font-extrabold text-brand-orange">500+</div>
                  <div className="text-xs text-brand-black font-bold uppercase tracking-widest mt-1">
                    Mock Tasks
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6" id="corporates">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="order-2 lg:order-2">
              <div className="rounded-2xl overflow-hidden shadow-premium border border-gray-100">
                <img
                  alt="Corporate office"
                  className="w-full h-[450px] object-cover hover:scale-105 transition-transform duration-700"
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80"
                />
              </div>
            </div>
            <div className="order-1 lg:order-1 space-y-6">
              <span className="bg-brand-black text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                For Corporates
              </span>
              <h2 className="text-4xl font-bold text-brand-black tracking-tight leading-[1.2]">
                Hire vetted talent, <br /> not just candidates.
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed">
                Access candidates who have already survived your custom
                simulation. Reduce onboarding time by 70% and eliminate hiring risks.
              </p>
              <ul className="space-y-4 pt-2">
                <li className="flex items-center gap-3 text-brand-black font-medium">
                  <span className="material-symbols-outlined text-brand-orange">verified</span>
                  Performance data on technical & soft skills
                </li>
                <li className="flex items-center gap-3 text-brand-black font-medium">
                  <span className="material-symbols-outlined text-brand-orange">layers</span>
                  Custom environments for your specific stack
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <h2 className="text-5xl font-extrabold text-brand-black tracking-tight text-balance leading-[1.1]">
            Ready to step into the <br /> <span className="text-brand-orange">future of work?</span>
          </h2>
          <p className="text-gray-500 text-xl max-w-2xl mx-auto">
            Join We2 and transform your career trajectory starting today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Link href="/register" className="h-14 px-10 rounded-lg bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-lg transition-all shadow-subtle hover:shadow-md flex items-center justify-center">
              Apply Now
            </Link>
            <button className="h-14 px-10 rounded-lg bg-white border border-gray-200 text-brand-black font-bold text-lg hover:bg-gray-50 transition-all flex items-center justify-center">
              Talk to Sales
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
