import { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { roadmapData } from '../lib/data/roadmapData';

export const metadata: Metadata = {
  title: 'Computer Science Placement Preparation and Practice 2026 | EMBLE',
  description: 'Master Computer Science placement preparation and practice with EMBLE. Comprehensive roadmap for DSA, SQL, CS Core, and AI Mock Interviews to crack top tech jobs.',
  keywords: ['Computer Science Placement Preparation', 'CS Placement Practice', 'DSA Preparation', 'Technical Interview Prep', 'Software Engineering Jobs'],
  openGraph: {
    title: 'Computer Science Placement Preparation and Practice | EMBLE',
    description: 'The ultimate guide to crack your dream software engineering job with structured roadmaps, mock interviews, and practice coding challenges.',
    url: 'https://emble.in/computer-science-placement-preparation',
    type: 'article',
  },
  alternates: {
    canonical: 'https://emble.in/computer-science-placement-preparation',
  }
};

const colorMap: Record<string, string> = {
  'emerald': 'bg-emerald-100 text-emerald-600',
  'brand-orange': 'bg-orange-100 text-orange-600',
  'indigo': 'bg-slate-100 text-slate-800',
  'slate': 'bg-slate-100 text-slate-600'
};

export default function CSPlacementPreparation() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: 'Computer Science Placement Preparation and Practice Masterclass',
    description: 'A complete step-by-step roadmap to master Data Structures and Algorithms, Core CS Subjects, Web Development, and Mock Interview Preparation designed to help you secure a top-tier software engineering placement equivalent to FAANG standards.',
    provider: {
      '@type': 'Organization',
      name: 'EMBLE',
      sameAs: 'https://emble.in'
    }
  };

  return (
    <div className="min-h-screen bg-white text-brand-black">
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 lg:pt-48 lg:pb-20 bg-gradient-to-br from-brand-orange/5 to-slate-600/5 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 mb-8 shadow-sm">
            <span className="text-sm font-bold tracking-tight text-gray-600">Updated for 2026 Hiring Trends</span>
          </div>
        
          <h1 className="text-4xl md:text-6xl font-[900] tracking-tight text-brand-black mb-6 text-balance leading-tight">
            The Ultimate Guide to <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-slate-600">
              Computer Science Placement Preparation
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
            Everything you need for comprehensive computer science placement practice in one place. Follow this structured roadmap to master Data Structures, System Design, and land your dream job at top product-based companies.
          </p>
          <div className="flex justify-center gap-4">
              <Link href="/register" className="h-14 px-8 rounded-2xl bg-brand-black text-white font-bold text-lg inline-flex items-center justify-center hover:bg-gray-900 transition-all shadow-xl hover:-translate-y-1 active:scale-95">
                Start Practicing Free
              </Link>
          </div>
        </div>
      </section>

      {/* Structured Roadmap Content Section */}
      <section className="py-20 bg-gray-50/50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-[900] text-brand-black mb-4">Complete Placement Roadmap</h2>
            <p className="text-gray-500 font-medium text-lg max-w-2xl mx-auto">Mastering computer science placement preparation requires a structured approach. Avoid getting overwhelmed and follow our proven 5-phase execution plan.</p>
          </div>
          
          <div className="space-y-12">
            {roadmapData.map((phase) => {
              const Icon = phase.icon;
              const colorClasses = colorMap[phase.color] || 'bg-gray-100 text-gray-600';
              
              return (
                <div key={phase.id} className="bg-white border border-gray-100 shadow-sm rounded-3xl p-8 hover:shadow-lg transition-all duration-300">
                  <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8 pb-8 border-b border-gray-100">
                    <div className={`w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center ${colorClasses}`}>
                       <Icon className="w-8 h-8" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-[900] text-brand-black mb-2">{phase.title}</h3>
                      <p className="text-gray-600 font-medium">{phase.desc}</p>
                    </div>
                    <div className="md:ml-auto flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Timeframe</div>
                        <div className="font-semibold text-gray-900">{phase.idealTime}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {phase.topics.map((topic, tIdx) => (
                      <div key={tIdx} className="p-5 bg-gray-50 hover:bg-gray-100 transition-colors rounded-2xl border border-gray-100">
                        <h4 className="font-bold text-gray-900 mb-2">{topic.title}</h4>
                        <p className="text-sm text-gray-600 leading-relaxed font-medium">{topic.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call To Action for Keyword Reinforcement */}
      <section className="py-24 bg-white text-center px-6 border-t border-gray-100">
        <h2 className="text-3xl md:text-5xl font-[900] mb-6">Ready for Real Placement Practice?</h2>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
            Stop guessing what will be asked in interviews. Join EMBLE today to access AI mock interviews, hands-on job simulations, and personalized computer science placement preparation.
        </p>
        <Link href="/register" className="h-[72px] px-16 rounded-2xl bg-brand-black text-white font-[900] text-xl inline-flex items-center justify-center hover:bg-gray-900 transition-all shadow-2xl hover:-translate-y-2 active:scale-95">
            Boost Your Placement Chances
        </Link>
      </section>

      <Footer />
    </div>
  );
}
