"use client";

import { UploadCloud, CheckCircle2, Mic, FileText, ChevronRight } from "lucide-react";

const Step1Mockup = () => (
  <div className="w-full h-full bg-slate-50 relative p-4 md:p-6 flex flex-col gap-4 group-hover:bg-slate-100 transition-colors duration-500">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center border border-slate-200">
        <UploadCloud className="w-5 h-5 text-slate-800" />
      </div>
      <div>
        <div className="text-sm font-bold text-slate-800">Upload Context</div>
        <div className="text-xs text-slate-500">Resume & Job Description</div>
      </div>
    </div>

    <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-3 md:p-4 relative overflow-hidden flex flex-col justify-between">
      <div className="space-y-3 h-full flex flex-col">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#556B2F]" />
            <span className="text-[10px] md:text-xs font-semibold text-slate-700">Eric_Software_Engineer.pdf</span>
          </div>
        </div>

        {/* Realistic Resume Content block */}
        <div className="font-serif text-[8px] md:text-[9px] text-slate-800 leading-tight bg-white border border-slate-200 p-3 rounded shadow-sm flex-1 flex flex-col gap-2 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent" />

          <div className="text-center border-b border-slate-300 pb-1.5 shrink-0">
            <div className="font-bold text-[11px] md:text-xs uppercase tracking-widest text-slate-900 mb-0.5">Eric Chen</div>
            <div className="text-[7.5px] md:text-[8px] text-slate-500">eric@example.com - github.com/eric - Software Engineer</div>
          </div>

          <div className="shrink-0">
            <div className="font-bold text-slate-900 uppercase tracking-widest mb-1 border-b border-slate-200 pb-0.5">Experience</div>
            <div className="flex justify-between font-semibold mb-0.5">
              <span>Lead UI Developer @ TechCorp</span>
              <span className="text-slate-500 font-normal">2023 - Present</span>
            </div>
            <ul className="list-disc pl-3 text-slate-700 space-y-0.5 text-[7.5px] md:text-[8.5px]">
              <li>Architected micro-frontend scaling strategy using Next.js & React 18.</li>
              <li>Led migration of legacy monolith to React, improving LCP by 40%.</li>
              <li>Implemented WebSockets for real-time collaborative code editing.</li>
              <li>Mentored 4 junior engineers and conducted 50+ technical interviews.</li>
            </ul>
          </div>

          <div className="shrink-0">
            <div className="flex justify-between font-semibold mb-0.5 mt-2">
              <span>Frontend Engineer @ StartupInc</span>
              <span className="text-slate-500 font-normal">2020 - 2023</span>
            </div>
            <ul className="list-disc pl-3 text-slate-700 space-y-0.5 text-[7.5px] md:text-[8.5px]">
              <li>Built internal dashboard toolkit used by 200+ employees daily.</li>
              <li>Integrated Stripe APIs for secure subscription processing.</li>
            </ul>
          </div>
          
          <div className="shrink-0 mt-1">
            <div className="font-bold text-slate-900 uppercase tracking-widest mb-1 border-b border-slate-200 pb-0.5 mt-1">Skills</div>
            <div className="text-slate-700 text-[7.5px] md:text-[8.5px]">
              React, Next.js, TypeScript, Node.js, WebSockets, System Design, GraphQL, Redis, AWS.
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 bg-[#556B2F] text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md">
        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
        Tailored Questions Generated
      </div>
    </div>
  </div>
);

const Step2Mockup = () => (
  <div className="w-full h-full bg-slate-50 relative flex flex-col overflow-hidden group-hover:bg-slate-100 transition-colors duration-500">
    <div className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-5 z-10">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-[#556B2F]/10 flex items-center justify-center relative z-10">
            <Mic className="w-4 h-4 text-[#556B2F]" />
          </div>
        </div>
        <span className="font-semibold text-sm text-slate-800">eO AI Interviewer</span>
      </div>
      <div className="flex items-center gap-1.5 bg-rose-50 text-rose-600 px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase border border-rose-100 shadow-sm">
        <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        Live
      </div>
    </div>
    <div className="flex-1 p-5 flex flex-col gap-4 justify-end">
      <div className="self-start max-w-[85%] bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 text-[13px] text-slate-700 shadow-sm leading-relaxed">
        Based on your resume, I see you designed a WebSockets architecture at TechCorp. How would you handle connection drops?
      </div>
      <div className="self-end max-w-[85%] bg-[#556B2F] text-white rounded-2xl rounded-tr-sm px-4 py-3 text-[13px] shadow-sm leading-relaxed">
        I would implement a hybrid long-polling fallback and use sequence IDs...
      </div>

      <div className="flex items-end justify-center gap-1 h-8 mt-2 opacity-60">
        {[40, 70, 50, 90, 60, 40, 80, 100, 50, 30].map((h, i) => (
          <div key={i} className="w-1.5 bg-[#556B2F] rounded-full transition-all duration-300" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  </div>
);

const Step3Mockup = () => (
  <div className="w-full h-full bg-slate-50 p-4 md:p-6 flex flex-col gap-4 group-hover:bg-slate-100 transition-colors duration-500">
    <div className="flex gap-4 h-3/5">
      <div className="w-1/2 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center relative">
        <svg className="w-24 h-24 transform -rotate-90">
          <circle cx="48" cy="48" r="42" className="stroke-slate-100 fill-none" strokeWidth="8" />
          <circle cx="48" cy="48" r="42" className="stroke-[#556B2F] fill-none" strokeWidth="8" strokeDasharray="264" strokeDashoffset="45" strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-slate-800 tracking-tighter">82</span>
          <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">Score</span>
        </div>
      </div>
      <div className="w-1/2 flex flex-col gap-2.5">
        {[
          { label: "Communication", score: "90%", width: "90%" },
          { label: "Technical", score: "75%", width: "75%" },
          { label: "Problem Solving", score: "85%", width: "85%" }
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-3 flex flex-col justify-center flex-1 shadow-sm transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex justify-between items-center text-[10px] md:text-[11px] mb-1.5">
              <span className="text-slate-500 font-semibold">{stat.label}</span>
              <span className="text-slate-800 font-bold">{stat.score}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#556B2F] rounded-full" style={{ width: stat.width }} />
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="bg-white border-2 border-slate-100 flex-1 rounded-2xl shadow-sm p-4 flex items-center justify-between text-slate-900 relative overflow-hidden transition-shadow hover:shadow-md hover:border-slate-200">
      <div className="relative z-10">
        <div className="font-bold text-sm text-slate-800">Need deeper feedback?</div>
        <div className="text-slate-500 text-xs mt-0.5">Speak with an industry expert.</div>
      </div>
      <button className="relative z-10 bg-[#556B2F] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md hover:scale-105 transition-transform flex items-center gap-1 hover:bg-[#4b5e29]">
        Book 1:1 <ChevronRight className="w-3 h-3 text-white" />
      </button>
    </div>
  </div>
);

export default function HowItWorks() {
  const steps = [
    {
      title: "Upload Resumes & Jobs",
      description: "We read applicant resumes and job descriptions to set up the interview. No generic questions—only what matters for the job.",
      badge: "Step 1: Automated Screening",
      Mockup: Step1Mockup
    },
    {
      title: "Conversational AI Interview",
      description: "Our AI acts as your interviewer. It adapts to answers, asks follow-up questions, and checks technical skills in real-time.",
      badge: "Step 2: The Interview",
      Mockup: Step2Mockup
    },
    {
      title: "Review Your Results",
      description: "Get instant scores on communication and technical skills. We filter the candidates so you only meet the best.",
      badge: "Step 3: Interview Intelligence",
      Mockup: Step3Mockup
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-white relative" id="how-it-works">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-[44px] font-[1000] text-[#1a2b3b] tracking-tight mb-5">
            The Ultimate AI Interview Platform
          </h2>
          <p className="text-lg text-slate-600 font-medium">
            A simple process to automate your interviews, from checking resumes to picking the best candidates.
          </p>
        </div>

        <div className="flex flex-col gap-24 md:gap-32">
          {steps.map((step, index) => (
            <div key={index} className={`flex flex-col md:flex-row items-center gap-12 lg:gap-20 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
              <div className="w-full md:w-1/2 flex flex-col items-start text-left relative z-10">
                <span className="px-4 py-1.5 rounded-full bg-slate-50 text-slate-800 font-bold text-sm tracking-wide mb-6 border border-slate-200">
                  {step.badge}
                </span>
                <h3 className="text-3xl md:text-4xl font-bold text-[#1a2b3b] tracking-tight mb-6">
                  {step.title}
                </h3>
                <p className="text-lg text-slate-600 font-medium leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="w-full md:w-1/2 aspect-square md:aspect-[4/3] rounded-[2rem] bg-slate-50 border border-slate-200 shadow-xl relative flex items-center justify-center p-2 group ring-4 ring-slate-50 hover:shadow-2xl transition-all duration-500 hover:ring-slate-100">
                <div className="w-full h-full rounded-[1.5rem] border border-slate-200 overflow-hidden relative bg-white shadow-inner">
                  <step.Mockup />
                </div>

                {/* Hand-drawn arrow and text for Step 1 -> Step 2 */}
                {index === 0 && (
                  <div className="absolute -bottom-16 -left-10 md:-bottom-24 md:-left-24 z-30 hidden lg:flex flex-col items-center pointer-events-none">
                    <div className="font-['Caveat',_cursive,_italic] text-xl font-medium text-slate-600 mb-1 -rotate-6">
                      We feed context <br /> to eO's brain
                    </div>
                    <svg width="100" height="120" viewBox="0 0 100 120" className="fill-none stroke-red-500 overflow-visible" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M 60 10 C 60 80, 20 80, -20 110" />
                      <path d="M -15 95 L -20 110 L -5 115" />
                    </svg>
                  </div>
                )}

                {/* Hand-drawn arrow and text for Step 2 -> Step 3 */}
                {index === 1 && (
                  <div className="absolute -bottom-16 -right-10 md:-bottom-24 md:-right-24 z-30 hidden lg:flex flex-col items-center pointer-events-none">
                    <div className="font-['Caveat',_cursive,_italic] text-xl font-medium text-slate-600 mb-1 rotate-6">
                      eO analyzes your <br /> performance
                    </div>
                    <svg width="100" height="120" viewBox="0 0 100 120" className="fill-none stroke-red-500 overflow-visible scale-x-[-1]" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M 60 10 C 60 80, 20 80, -20 110" />
                      <path d="M -15 95 L -20 110 L -5 115" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
