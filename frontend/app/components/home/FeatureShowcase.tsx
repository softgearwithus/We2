'use client';

const features = [
  {
    title: "Simulate the exact FAANG tech stack.",
    description: "Stop writing algorithms in a vacuum. Build full-stack applications with React, Node, and PostgreSQL, precisely mapped to current industry requirements.",
    image: "/images/dsa-training-dashboard.png",
    color: "from-brand-orange to-red-500",
    badge: "Machine Coding"
  },
  {
    title: "The Amazon SDE Loop, deconstructed.",
    description: "Don't guess what they'll ask. Take timed, proctored mock tests mirroring the exact difficulty and patterns of TCS, Amazon, Deloitte, and more.",
    image: "/images/test-series-dashboard.png",
    color: "from-blue-500 to-slate-600",
    badge: "Oa & Technical Rounds"
  },
  {
    title: "Beat the behavioral filter.",
    description: "Pass the technical, fail the cultural? Not anymore. Train against our AI hiring manager that grills you on Leadership Principles and past projects.",
    image: "/images/interview-dashboard.png",
    color: "from-slate-500 to-pink-600",
    badge: "Behavioral & System Design"
  },
  {
    title: "Bypass the automated screeners.",
    description: "Your code is worthless if your resume is rejected. Generate strictly-formatted, ATS-optimized technical resumes that actually reach a human recruiter.",
    image: "/images/resume-builder-dashboard.png",
    color: "from-green-500 to-emerald-600",
    badge: "ATS Optimization"
  },
  {
    title: "Real-time hiring radar.",
    description: "The market moves fast. Get live updates on actively hiring companies, shifting tech stacks, and exactly what skills are closing offers today.",
    image: "/images/market-radar-for-latest-updates.png",
    color: "from-slate-700 to-cyan-500",
    badge: "Market Intelligence"
  }
];

export default function FeatureShowcase() {
  return (
    <section className="py-12 md:py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-24">
          <span className="text-brand-orange font-bold text-[11px] uppercase tracking-[0.2em] bg-orange-50 px-4 py-2 rounded-full border border-orange-100 inline-block mb-8 shadow-sm">
            Inside the Platform
          </span>
          <h2 className="text-4xl md:text-6xl font-[900] text-brand-black tracking-tight mb-6 leading-tight">
            Stop guessing. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-slate-600">Start experiencing.</span>
          </h2>
          <p className="text-xl text-gray-500 font-medium leading-relaxed">
            Don't just read about our features. See exactly the tools you'll use to land your dream job.
          </p>
        </div>

        <div className="space-y-16 lg:space-y-32">
          {features.map((feature, index) => (
            <div key={index} className={`flex flex-col lg:flex-row items-center gap-10 lg:gap-16 ${index % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
              
              {/* Text Content */}
              <div className="w-full lg:w-5/12 space-y-6 z-10">
                <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r ${feature.color} text-white shadow-lg`}>
                  {feature.badge}
                </span>
                <h3 className="text-3xl lg:text-5xl font-black text-brand-black tracking-tight leading-tight">
                  {feature.title}
                </h3>
                <p className="text-lg lg:text-xl text-gray-500 font-medium leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Image Content */}
              <div className="w-full lg:w-7/12 relative group perspective-[2000px]">
                <div className={`absolute -inset-4 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 blur-2xl transition duration-500 rounded-[40px]`}></div>
                
                <div className={`relative transform transition duration-700 ease-in-out ${index % 2 === 0 ? 'rotate-y-[-5deg]' : 'rotate-y-[5deg]'} rotate-x-[2deg] group-hover:rotate-y-0 group-hover:rotate-x-0`}>
                  <img loading="lazy" decoding="async" 
                    src={feature.image} 
                    alt={feature.title} 
                    className="relative rounded-[24px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-gray-100 object-cover w-full h-auto"
                  />
                  {/* Glass reflection effect */}
                  <div className="absolute inset-0 rounded-[24px] bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
