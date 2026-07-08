import { UploadCloud, CheckCircle2, Mic, FileText, ChevronRight, ArrowDown } from "lucide-react";

const Step1Mockup = () => (
  <div className="w-full h-full bg-slate-50/50 relative p-4 md:p-6 flex flex-col gap-4 transition-colors duration-500 rounded-3xl border border-gray-100 shadow-sm">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-pink-100 flex items-center justify-center">
        <UploadCloud className="w-6 h-6 text-pink-600" strokeWidth={2}/>
      </div>
      <div>
        <div className="text-[15px] font-[600] text-gray-900">Upload Context</div>
        <div className="text-[13px] font-[500] text-gray-500">Resume & Job Description</div>
      </div>
    </div>

    <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5 relative overflow-hidden flex flex-col justify-between">
      <div className="space-y-4 h-full flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400" strokeWidth={2}/>
            <span className="text-[11px] md:text-[12px] font-[600] text-gray-600">Eric_Software_Engineer.pdf</span>
          </div>
        </div>

        {/* Realistic Resume Content block */}
        <div className="font-serif text-[9px] md:text-[10px] text-gray-800 leading-relaxed bg-white p-3 flex-1 flex flex-col gap-3 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent" />

          <div className="text-center border-b border-gray-100 pb-2 shrink-0">
            <div className="font-[600] text-[13px] md:text-[14px] text-gray-900 mb-1">Eric Chen</div>
            <div className="text-[9px] md:text-[10px] text-gray-500">eric@example.com - github.com/eric - Software Engineer</div>
          </div>

          <div className="shrink-0">
            <div className="font-[600] text-gray-900 mb-1.5 border-b border-gray-50 pb-1">Experience</div>
            <div className="flex justify-between font-[600] mb-1">
              <span>Lead UI Developer @ TechCorp</span>
              <span className="text-gray-400 font-[500]">2023 - Present</span>
            </div>
            <ul className="list-disc pl-4 text-gray-600 space-y-1">
              <li>Architected micro-frontend scaling strategy using Next.js & React 18.</li>
              <li>Led migration of legacy monolith to React, improving LCP by 40%.</li>
              <li>Implemented WebSockets for real-time collaborative code editing.</li>
              <li>Mentored 4 junior engineers and conducted 50+ technical interviews.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-full text-[12px] font-[500] flex items-center gap-2 shadow-md">
        <CheckCircle2 className="w-4 h-4 text-pink-500" strokeWidth={2} />
        Questions Generated
      </div>
    </div>
  </div>
);

const Step2Mockup = () => (
  <div className="w-full h-full bg-slate-50/50 p-4 md:p-6 flex flex-col gap-4 transition-colors duration-500 rounded-3xl border border-gray-100 shadow-sm">
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col gap-4 h-full">
      <div className="border-b border-gray-100 pb-3">
        <h4 className="text-gray-900 font-[600] text-[15px]">Interview Configuration</h4>
        <p className="text-gray-500 text-[12px] mt-1">Select the stages for your screening pipeline.</p>
      </div>

      <div className="flex flex-col gap-3 flex-1">
        {/* Toggle 1 */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50/50 border border-purple-100">
          <div>
            <div className="text-purple-900 font-[600] text-[13px]">Advanced Resume Screening</div>
            <div className="text-purple-700/70 text-[11px] mt-0.5">Filter by JD match & ATS score</div>
          </div>
          <div className="w-10 h-6 bg-purple-500 rounded-full relative shadow-sm">
            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
          </div>
        </div>

        {/* Toggle 2 */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-gray-100 opacity-60">
          <div>
            <div className="text-gray-900 font-[600] text-[13px]">Predefined Q&A</div>
            <div className="text-gray-500 text-[11px] mt-0.5">Standard behavioral questions</div>
          </div>
          <div className="w-10 h-6 bg-gray-200 rounded-full relative">
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
          </div>
        </div>

        {/* Toggle 3 */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-lime-50/50 border border-lime-100">
          <div>
            <div className="text-lime-900 font-[600] text-[13px]">Technical Deep-Dive</div>
            <div className="text-lime-700/70 text-[11px] mt-0.5">GitHub & Architecture analysis</div>
          </div>
          <div className="w-10 h-6 bg-lime-500 rounded-full relative shadow-sm">
            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Step4Mockup = () => (
  <div className="w-full h-full bg-slate-50/50 p-4 md:p-6 flex flex-col gap-4 transition-colors duration-500 rounded-3xl border border-gray-100 shadow-sm">
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
         <div className="text-gray-900 font-[600] text-[14px]">Final Candidate List</div>
         <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded-full text-[10px] font-bold">5 Accepted</span>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl">
          <span className="text-gray-700 text-[12px] font-[500]">Alice - Senior Engineer</span>
          <span className="text-purple-600 text-[11px] font-[600]">Invite Sent</span>
        </div>
        <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl">
          <span className="text-gray-700 text-[12px] font-[500]">Bob - UI Developer</span>
          <span className="text-red-500 text-[11px] font-[600]">Rejection Sent</span>
        </div>
      </div>
    </div>
  </div>
);

const Step3Mockup = () => (
  <div className="w-full h-full bg-slate-50/50 p-4 md:p-6 flex flex-col gap-4 transition-colors duration-500 rounded-3xl border border-gray-100 shadow-sm">
    <div className="flex gap-4 h-[65%]">
      <div className="w-1/2 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center relative">
        <svg className="w-28 h-28 transform -rotate-90">
          <circle cx="56" cy="56" r="48" className="stroke-gray-100 fill-none" strokeWidth="8" />
          <circle cx="56" cy="56" r="48" className="stroke-pink-500 fill-none" strokeWidth="8" strokeDasharray="301" strokeDashoffset="54" strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-[700] text-gray-900 tracking-tight mt-1">82</span>
          <span className="text-[11px] text-gray-400 font-[600] uppercase tracking-wider mt-1">Overall</span>
        </div>
      </div>
      <div className="w-1/2 flex flex-col gap-3">
        {[
          { label: "Communication", score: "90", width: "90%", color: "bg-pink-400" },
          { label: "Technical", score: "75", width: "75%", color: "bg-purple-400" },
          { label: "Problem Solving", score: "85", width: "85%", color: "bg-lime-400" }
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-3 flex flex-col justify-center flex-1 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600 font-[500] text-[11px] md:text-[12px]">{stat.label}</span>
              <span className="text-gray-900 font-[600] text-[12px]">{stat.score}</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${stat.color}`} style={{ width: stat.width }} />
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="bg-gray-900 flex-1 rounded-2xl p-5 flex items-center justify-between text-white relative overflow-hidden shadow-md">
      <div className="relative z-10">
        <div className="font-[600] text-[15px]">Need deeper feedback?</div>
        <div className="text-gray-400 font-[400] text-[13px] mt-1">Speak with an industry expert.</div>
      </div>
      <button className="relative z-10 bg-white text-gray-900 px-4 py-2 rounded-full text-[13px] font-[500] hover:bg-gray-50 transition-colors flex items-center gap-1.5 shadow-sm">
        Book 1:1 <ChevronRight className="w-3.5 h-3.5 text-gray-500" strokeWidth={2.5}/>
      </button>
    </div>
  </div>
);

export default function HowItWorks() {
  const steps = [
    {
      title: "Connect Context & Create Assessment",
      description: "Provide a link to your GitHub repos, docs, and any internal context. Emble instantly generates a tailored assessment in one click.",
      badge: "Step 1",
      Mockup: Step1Mockup
    },
    {
      title: "Customize Your Workflow",
      description: "Add a predefined or technical interview, or simply opt for our advanced resume screening to filter applicants automatically.",
      badge: "Step 2",
      Mockup: Step2Mockup
    },
    {
      title: "Set Threshold & Check ATS",
      description: "Set a prescribed ATS score (e.g., 75 ATS). Click 'Check ATS' to instantly screen and filter all incoming candidates against your criteria.",
      badge: "Step 3",
      Mockup: Step3Mockup
    },
    {
      title: "Automated Communication & Shortlist",
      description: "Rejected candidates automatically receive a polite email, while accepted candidates receive an interview invite. You get a final list of the most intelligent engineers.",
      badge: "Step 4",
      Mockup: Step4Mockup
    }
  ];

  return (
    <section className="py-20 lg:py-24 bg-white relative" id="how-it-works">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16 md:mb-24 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4 leading-tight">
            The ultimate AI <br className="hidden sm:block" />
            <span className="text-indigo-600">interview platform.</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed mt-6">
            A simple process to automate your interviews, from checking resumes to picking the best candidates.
          </p>
        </div>

        <div className="flex flex-col gap-20 md:gap-32">
          {steps.map((step, index) => (
            <div key={index} className={`flex flex-col md:flex-row items-center gap-12 lg:gap-20 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
              <div className="w-full md:w-1/2 flex flex-col items-start text-left relative z-10">
                <span className="px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-sm tracking-wide mb-6">
                  {step.badge}
                </span>
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-4">
                  {step.title}
                </h3>
                <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-lg">
                  {step.description}
                </p>
              </div>

              <div className="w-full md:w-1/2 aspect-square md:aspect-[4/3] relative flex items-center justify-center p-0">
                <div className="w-full h-full relative">
                  <step.Mockup />
                </div>

                {/* Suble arrow indicators */}
                {index === 0 && (
                  <div className="absolute -bottom-10 -left-4 md:-bottom-16 md:-left-8 z-30 hidden lg:flex flex-col items-center pointer-events-none">
                    <div className="font-[500] text-[12px] text-gray-500 bg-white/80 backdrop-blur-md border border-gray-100 px-4 py-2 flex items-center gap-2 rounded-full shadow-sm">
                      <ArrowDown size={14} className="text-gray-400" />
                      AI Analyzes Profile
                    </div>
                  </div>
                )}

                {index === 1 && (
                  <div className="absolute -bottom-10 -right-4 md:-bottom-16 md:-right-8 z-30 hidden lg:flex flex-col items-center pointer-events-none">
                    <div className="font-[500] text-[12px] text-gray-500 bg-white/80 backdrop-blur-md border border-gray-100 px-4 py-2 flex items-center gap-2 rounded-full shadow-sm">
                      <ArrowDown size={14} className="text-gray-400" />
                      Generating Results
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
