import { UploadCloud, CheckCircle2, Mic, FileText, ChevronRight, ArrowDown } from "lucide-react";

const Step1Mockup = () => (
  <div className="w-full h-full bg-white relative p-4 md:p-6 flex flex-col gap-4 transition-colors duration-500">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-none bg-[#ffa116] shadow-[2px_2px_0_0_#202b20] flex items-center justify-center border-2 border-[#202b20]">
        <UploadCloud className="w-5 h-5 text-[#202b20]" strokeWidth={3}/>
      </div>
      <div>
        <div className="text-[14px] font-[600] text-[#202b20] uppercase">Upload Context</div>
        <div className="text-[12px] font-[600] text-[#202b20]/70 uppercase">Resume & Job Description</div>
      </div>
    </div>

    <div className="flex-1 bg-white rounded-none shadow-[4px_4px_0_0_#202b20] border-2 border-[#202b20] p-3 md:p-4 relative overflow-hidden flex flex-col justify-between">
      <div className="space-y-3 h-full flex flex-col">
        <div className="flex items-center justify-between pb-2 border-b-2 border-[#202b20] shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#202b20]" strokeWidth={3}/>
            <span className="text-[10px] md:text-[12px] font-[600] text-[#202b20] uppercase border-[#202b20]">Eric_Software_Engineer.pdf</span>
          </div>
        </div>

        {/* Realistic Resume Content block */}
        <div className="font-serif text-[8px] md:text-[9px] text-slate-800 leading-tight bg-white border border-slate-200 p-3 rounded shadow-sm flex-1 flex flex-col gap-2 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent" />

          <div className="text-center border-b border-slate-300 pb-1.5 shrink-0">
            <div className="font-[600] text-[11px] md:text-[12px] uppercase tracking-widest text-slate-900 mb-0.5">Eric Chen</div>
            <div className="text-[7.5px] md:text-[8px] text-slate-500">eric@example.com - github.com/eric - Software Engineer</div>
          </div>

          <div className="shrink-0">
            <div className="font-[600] text-slate-900 uppercase tracking-widest mb-1 border-b border-slate-200 pb-0.5">Experience</div>
            <div className="flex justify-between font-[600] mb-0.5">
              <span>Lead UI Developer @ TechCorp</span>
              <span className="text-slate-500 font-[500]">2023 - Present</span>
            </div>
            <ul className="list-disc pl-3 text-slate-700 space-y-0.5 text-[7.5px] md:text-[8.5px]">
              <li>Architected micro-frontend scaling strategy using Next.js & React 18.</li>
              <li>Led migration of legacy monolith to React, improving LCP by 40%.</li>
              <li>Implemented WebSockets for real-time collaborative code editing.</li>
              <li>Mentored 4 junior engineers and conducted 50+ technical interviews.</li>
            </ul>
          </div>

          <div className="shrink-0">
            <div className="flex justify-between font-[600] mb-0.5 mt-2">
              <span>Frontend Engineer @ StartupInc</span>
              <span className="text-slate-500 font-[500]">2020 - 2023</span>
            </div>
            <ul className="list-disc pl-3 text-slate-700 space-y-0.5 text-[7.5px] md:text-[8.5px]">
              <li>Built internal dashboard toolkit used by 200+ employees daily.</li>
              <li>Integrated Stripe APIs for secure subscription processing.</li>
            </ul>
          </div>
          
          <div className="shrink-0 mt-1">
            <div className="font-[600] text-slate-900 uppercase tracking-widest mb-1 border-b border-slate-200 pb-0.5 mt-1">Skills</div>
            <div className="text-slate-700 text-[7.5px] md:text-[8.5px]">
              React, Next.js, TypeScript, Node.js, WebSockets, System Design, GraphQL, Redis, AWS.
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 bg-[#202b20] text-white px-3 py-1.5 rounded-none text-[12px] font-[600] flex items-center gap-1.5 shadow-[4px_4px_0_0_#ffa116] uppercase border-2 border-[#202b20]">
        <CheckCircle2 className="w-3.5 h-3.5 text-[#ffa116]" strokeWidth={3} />
        Questions Generated
      </div>
    </div>
  </div>
);

const Step2Mockup = () => (
  <div className="w-full h-full bg-white relative flex flex-col overflow-hidden transition-colors duration-500">
    <div className="h-14 border-b-2 border-[#202b20] bg-[#efeff1] flex items-center justify-between px-5 z-10">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-8 h-8 rounded-none border-2 border-[#202b20] bg-[#ffa116] flex items-center justify-center relative z-10 shadow-[2px_2px_0_0_#202b20]">
            <Mic className="w-4 h-4 text-[#202b20]" strokeWidth={3} />
          </div>
        </div>
        <span className="font-[600] text-[14px] text-[#202b20] uppercase">eO AI Interviewer</span>
      </div>
      <div className="flex items-center gap-1.5 bg-white text-red-600 px-2 py-1 rounded-none text-[10px] font-[600] tracking-wider uppercase border-2 border-[#202b20] shadow-[2px_2px_0_0_#202b20]">
        <div className="w-2 h-2 rounded-none bg-red-500 border border-[#202b20]" />
        Live
      </div>
    </div>
    <div className="flex-1 p-5 flex flex-col gap-4 justify-end bg-white">
      <div className="self-start max-w-[85%] bg-white border-2 border-[#202b20] rounded-none px-4 py-3 text-[13px] text-[#202b20] font-[600] shadow-[4px_4px_0_0_#202b20] leading-relaxed">
        Based on your resume, I see you designed a WebSockets architecture at TechCorp. How would you handle connection drops?
      </div>
      <div className="self-end max-w-[85%] bg-[#202b20] text-white border-2 border-[#202b20] rounded-none px-4 py-3 text-[13px] font-[600] shadow-[4px_4px_0_0_#ffa116] leading-relaxed">
        I would implement a hybrid long-polling fallback and use sequence IDs...
      </div>

      <div className="flex items-end justify-center gap-[4px] h-8 mt-2 opacity-100">
        {[40, 70, 50, 90, 60, 40, 80, 100, 50, 30].map((h, i) => (
          <div key={i} className="w-2 bg-[#202b20] border-t-2 border-l border-r border-[#202b20] rounded-none transition-all duration-300" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  </div>
);

const Step3Mockup = () => (
  <div className="w-full h-full bg-white p-4 md:p-6 flex flex-col gap-4 transition-colors duration-500">
    <div className="flex gap-4 h-[65%]">
      <div className="w-1/2 bg-[#ffa116] rounded-none border-2 border-[#202b20] shadow-[4px_4px_0_0_#202b20] flex flex-col items-center justify-center relative">
        <svg className="w-24 h-24 transform -rotate-90">
          <rect x="12" y="12" width="72" height="72" className="stroke-[#202b20] fill-none" strokeWidth="8" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center mt-2">
          <span className="text-4xl font-[600] text-[#202b20] tracking-tighter">82</span>
          <span className="text-[12px] text-[#202b20] font-[600] tracking-widest uppercase mt-0.5">Score</span>
        </div>
      </div>
      <div className="w-1/2 flex flex-col gap-2.5">
        {[
          { label: "COMM", score: "90%", width: "90%" },
          { label: "TECH", score: "75%", width: "75%" },
          { label: "SOLVE", score: "85%", width: "85%" }
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-none border-2 border-[#202b20] p-2 flex flex-col justify-center flex-1 shadow-[2px_2px_0_0_#202b20]">
            <div className="flex justify-between items-center text-[10px] md:text-[11px] mb-1.5">
              <span className="text-[#202b20] font-[600] uppercase text-[10px]">{stat.label}</span>
              <span className="text-[#202b20] font-[600]">{stat.score}</span>
            </div>
            <div className="w-full h-2 bg-[#efeff1] rounded-none border border-[#202b20] overflow-hidden">
              <div className="h-full bg-[#202b20]" style={{ width: stat.width }} />
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="bg-[#202b20] border-2 border-[#202b20] flex-1 rounded-none shadow-[4px_4px_0_0_#ffa116] p-4 flex items-center justify-between text-white relative overflow-hidden">
      <div className="relative z-10">
        <div className="font-[600] text-sm uppercase text-[#ffa116]">Need deeper feedback?</div>
        <div className="text-white/80 font-[600] text-[12px] mt-0.5">Speak with an industry expert.</div>
      </div>
      <button className="relative z-10 bg-white text-[#202b20] px-3 py-1.5 rounded-none border-2 border-white text-[12px] font-[600] hover:bg-[#ffa116] hover:border-[#202b20] transition-colors flex items-center gap-1 uppercase">
        Book 1:1 <ChevronRight className="w-3 h-3 text-[#202b20]" strokeWidth={3}/>
      </button>
    </div>
  </div>
);

export default function HowItWorks() {
  const steps = [
    {
      title: "Upload Resumes & Jobs",
      description: "We read applicant resumes and job descriptions to set up the interview. No generic questions—only what matters for the job.",
      badge: "Step 1",
      Mockup: Step1Mockup
    },
    {
      title: "Conversational AI Interview",
      description: "Our AI acts as your interviewer. It adapts to answers, asks follow-up questions, and checks technical skills in real-time.",
      badge: "Step 2",
      Mockup: Step2Mockup
    },
    {
      title: "Review Your Results",
      description: "Get instant scores on communication and technical skills. We filter the candidates so you only meet the best.",
      badge: "Step 3",
      Mockup: Step3Mockup
    }
  ];

  return (
    <section className="py-24 lg:py-32 bg-white relative" id="how-it-works">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-24 md:mb-32 max-w-3xl mx-auto">
          <h2 className="text-[2.5rem] md:text-[4rem] font-[800] tracking-tighter text-[#202b20] mb-6">
            The ultimate AI interview platform
          </h2>
          <p className="text-[18px] md:text-[20px] text-[#202b20]/75 font-[500] max-w-2xl mx-auto leading-relaxed">
            A simple process to automate your interviews, from checking resumes to picking the best candidates.
          </p>
        </div>

        <div className="flex flex-col gap-32 md:gap-48">
          {steps.map((step, index) => (
            <div key={index} className={`flex flex-col md:flex-row items-center gap-12 lg:gap-20 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
              <div className="w-full md:w-1/2 flex flex-col items-start text-left relative z-10">
                <span className="px-4 py-1.5 rounded-none bg-[#202b20] text-white font-[600] text-[14px] tracking-widest mb-6 border-2 border-[#202b20] shadow-[4px_4px_0_0_#ffa116] uppercase">
                  {step.badge}
                </span>
                <h3 className="text-3xl md:text-4xl font-[500] text-[#202b20] tracking-tight mb-6">
                  {step.title}
                </h3>
                <p className="text-[18px] md:text-[20px] text-[#202b20]/75 font-[500] leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="w-full md:w-1/2 aspect-square md:aspect-[4/3] bg-white border-2 border-[#202b20] shadow-[4px_4px_0_0_#202b20] relative flex items-center justify-center p-0 transition-transform duration-500 hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0_0_#202b20]">
                <div className="w-full h-full border-0 overflow-hidden relative bg-white">
                  <step.Mockup />
                </div>

                {/* Industrial pipe arrow for Step 1 -> Step 2 */}
                {index === 0 && (
                  <div className="absolute -bottom-12 -left-4 md:-bottom-16 md:-left-16 z-30 hidden lg:flex flex-col items-center pointer-events-none">
                    <div className="font-[600] text-[12px] uppercase tracking-widest text-[#202b20] bg-white border-2 border-[#202b20] px-4 py-2 shadow-[2px_2px_0_0_#ffa116] flex items-center gap-2 rounded-full">
                      <ArrowDown size={16} className="text-[#202b20] animate-bounce" strokeWidth={3} />
                      AI ANALYZES PROFILE
                    </div>
                  </div>
                )}

                {/* Industrial pipe arrow for Step 2 -> Step 3 */}
                {index === 1 && (
                  <div className="absolute -bottom-12 -right-4 md:-bottom-16 md:-right-16 z-30 hidden lg:flex flex-col items-center pointer-events-none">
                    <div className="font-[600] text-[12px] uppercase tracking-widest text-[#202b20] bg-white border-2 border-[#202b20] px-4 py-2 shadow-[2px_2px_0_0_#ffa116] flex items-center gap-2 rounded-full">
                      <ArrowDown size={16} className="text-[#202b20] animate-bounce" strokeWidth={3} />
                      GENERATING RESULTS
                    </div>
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
