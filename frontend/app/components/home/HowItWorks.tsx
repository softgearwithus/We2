"use client";

import { motion } from "framer-motion";
import { UploadCloud, CheckCircle2, Mic, FileText, BarChart, ChevronRight, Play } from "lucide-react";

const Step1Mockup = () => (
  <div className="w-full h-full bg-slate-50 relative p-4 md:p-6 flex flex-col gap-4 group-hover:bg-slate-100 transition-colors duration-500">
    <div className="flex items-center gap-3">
       <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center border border-slate-200">
          <UploadCloud className="w-5 h-5 text-primary" />
       </div>
       <div>
         <div className="text-sm font-bold text-slate-800">Upload Context</div>
         <div className="text-xs text-slate-500">Resume & Job Description</div>
       </div>
    </div>
    
    <div className="flex-1 bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 p-3 md:p-4 relative overflow-hidden flex flex-col justify-between">
      <div className="space-y-3 h-full flex flex-col">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 shrink-0">
           <div className="flex items-center gap-2">
             <FileText className="w-4 h-4 text-emerald-600" />
             <span className="text-[10px] md:text-xs font-semibold text-slate-700">Eric_Software_Engineer.pdf</span>
           </div>
        </div>
        
        {/* Realistic Resume Content block */}
        <div className="font-serif text-[8px] md:text-[9px] text-slate-800 leading-tight bg-white border border-slate-200 p-3 rounded shadow-sm flex-1 flex flex-col gap-2 relative overflow-hidden">
           {/* Faded overlay at bottom to suggest more content */}
           <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent" />
           
           <div className="text-center border-b border-slate-300 pb-1.5 shrink-0">
             <div className="font-bold text-[11px] md:text-xs uppercase tracking-widest text-slate-900 mb-0.5">Eric Chen</div>
             <div className="text-[7.5px] md:text-[8px] text-slate-500">eric@example.com • github.com/eric • Software Engineer</div>
           </div>
           
           <div className="shrink-0">
             <div className="font-bold text-slate-900 uppercase tracking-widest mb-1 border-b border-slate-200 pb-0.5">Experience</div>
             <div className="flex justify-between font-semibold mb-0.5">
               <span>Lead UI Developer @ TechCorp</span> 
               <span className="text-slate-500 font-normal">2023 - Present</span>
             </div>
             <ul className="list-disc pl-3 text-slate-700 space-y-0.5 text-[7.5px] md:text-[8.5px]">
               <li>Architected micro-frontend scaling strategy using Next.js.</li>
               <li>Led migration of legacy monolith to React, improving LCP by 40%.</li>
               <li>Implemented WebSockets for real-time collaborative editing.</li>
             </ul>
           </div>
           
           <div className="shrink-0">
             <div className="font-bold text-slate-900 uppercase tracking-widest mb-1 border-b border-slate-200 pb-0.5 mt-1">Skills</div>
             <div className="text-slate-700 text-[7.5px] md:text-[8.5px]">
               React, Next.js, TypeScript, Node.js, WebSockets, System Design, GraphQL, Redis.
             </div>
           </div>
        </div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="absolute bottom-4 right-4 bg-white border border-primary text-foreground px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm"
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
        Tailored Questions Generated
      </motion.div>
    </div>
  </div>
);

const Step2Mockup = () => (
  <div className="w-full h-full bg-slate-50 relative flex flex-col overflow-hidden group-hover:bg-slate-100 transition-colors duration-500">
    <div className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-5 z-10">
       <div className="flex items-center gap-3">
         <div className="relative">
           <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center relative z-10">
             <Mic className="w-4 h-4 text-primary" />
           </div>
           <motion.div 
             animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
             transition={{ repeat: Infinity, duration: 2 }}
             className="absolute inset-0 bg-primary/20 rounded-full"
           />
         </div>
         <span className="font-semibold text-sm text-slate-800">eO AI Interviewer</span>
       </div>
       <div className="flex items-center gap-1.5 bg-rose-50 text-rose-600 px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase border border-rose-100">
         <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
         Live
       </div>
    </div>
    <div className="flex-1 p-5 flex flex-col gap-4 justify-end">
       <motion.div 
         initial={{ opacity: 0, x: -10 }}
         whileInView={{ opacity: 1, x: 0 }}
         transition={{ delay: 0.2 }}
         className="self-start max-w-[85%] bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 text-[13px] text-slate-700 shadow-sm leading-relaxed"
       >
         Based on your resume, I see you designed a WebSockets architecture at TechCorp. How would you handle connection drops and message ordering at that scale?
       </motion.div>
       <motion.div 
         initial={{ opacity: 0, x: 10 }}
         whileInView={{ opacity: 1, x: 0 }}
         transition={{ delay: 0.8 }}
         className="self-end max-w-[85%] bg-white border border-primary text-foreground rounded-2xl rounded-tr-sm px-4 py-3 text-[13px] shadow-sm leading-relaxed"
       >
         I would implement a hybrid long-polling fallback and use sequence IDs to ensure message idempotency...
       </motion.div>
       
       <div className="flex items-end justify-center gap-1 h-8 mt-2 opacity-50">
          {[1,2,3,4,3,2,4,5,3,2].map((h, i) => (
             <motion.div 
               key={i}
               animate={{ height: [`${h*15}%`, `${h*25}%`, `${h*15}%`] }}
               transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.1 }}
               className="w-1.5 bg-emerald-500 rounded-full"
             />
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
             <motion.circle 
               initial={{ strokeDashoffset: 264 }}
               whileInView={{ strokeDashoffset: 45 }}
               transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
               cx="48" cy="48" r="42" 
               className="stroke-primary fill-none" 
               strokeWidth="8" 
               strokeDasharray="264" 
               strokeLinecap="round" 
             />
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
           <div key={i} className="bg-white rounded-xl border border-slate-200 p-3 flex flex-col justify-center flex-1 shadow-sm">
             <div className="flex justify-between items-center text-[10px] md:text-[11px] mb-1.5">
               <span className="text-slate-500 font-semibold">{stat.label}</span>
               <span className="text-slate-800 font-bold">{stat.score}</span>
             </div>
             <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 whileInView={{ width: stat.width }}
                 transition={{ duration: 1, delay: 0.3 + (i * 0.1) }}
                 className="h-full bg-primary rounded-full" 
               />
             </div>
           </div>
         ))}
       </div>
     </div>
     
     <div className="bg-white border border-primary flex-1 rounded-2xl shadow-lg p-4 md:p-5 flex items-center justify-between text-foreground relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10" />
        <div className="relative z-10">
           <div className="font-bold text-sm md:text-base">Need deeper feedback?</div>
           <div className="text-muted-foreground text-xs md:text-sm mt-0.5">Speak with an industry expert.</div>
        </div>
        <button className="relative z-10 bg-white border border-primary text-foreground px-4 py-2 rounded-lg text-xs font-bold shadow-md hover:scale-105 transition-transform flex items-center gap-1">
           Book 1:1 <ChevronRight className="w-3 h-3 text-primary" />
        </button>
     </div>
  </div>
);

export default function HowItWorks() {
  const steps = [
    {
      title: "Start with your context",
      description: "We ingest your CV, past projects, and target role to create a hyper-personalized interview environment. No generic questions—only what you'll actually face.",
      badge: "Step 1: Context",
      Mockup: Step1Mockup
    },
    {
      title: "Voice-first, entirely dynamic",
      description: "eO adapts to your answers, probes deeper on weak points, and simulates the pressure of a real technical round. Speak naturally, think out loud.",
      badge: "Step 2: The Interview",
      Mockup: Step2Mockup
    },
    {
      title: "Granular Feedback & Human Review",
      description: "Don't just practice—improve. Get instant AI analytics on your communication and technical accuracy, or escalate to a 1:1 human session to clear final doubts.",
      badge: "Step 3: Analytics",
      Mockup: Step3Mockup
    }
  ];

  return (
    <section className="py-24 bg-background relative" id="how-it-works">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-[44px] font-[1000] text-[#1a2b3b] tracking-tight mb-5"
          >
            How Emble Works
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600 font-medium"
          >
            A systematic approach to perfecting your interview skills, from zero to offer.
          </motion.p>
        </div>

        <div className="flex flex-col gap-24 md:gap-32">
          {steps.map((step, index) => (
            <div 
              key={index}
              className={`flex flex-col md:flex-row items-center gap-12 lg:gap-20 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
            >
              <motion.div 
                initial={{ opacity: 0, x: index % 2 === 1 ? 40 : -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="w-full md:w-1/2 flex flex-col items-start text-left relative z-10"
              >
                <span className="px-4 py-1.5 rounded-full bg-white text-foreground font-bold text-sm tracking-wide mb-6 border border-primary shadow-sm">
                  {step.badge}
                </span>
                <h3 className="text-3xl md:text-4xl font-bold text-[#1a2b3b] tracking-tight mb-6">
                  {step.title}
                </h3>
                <p className="text-lg text-slate-600 font-medium leading-relaxed">
                  {step.description}
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
                className="w-full md:w-1/2 aspect-square md:aspect-[4/3] rounded-[2rem] bg-white border border-slate-200 shadow-xl relative flex items-center justify-center p-2 group ring-4 ring-slate-50/50"
              >
                {/* Note: overflow-hidden moved to the inner div to allow absolute arrows outside */}
                <div className="w-full h-full rounded-[1.5rem] border border-slate-100 overflow-hidden relative bg-white shadow-inner">
                  <step.Mockup />
                </div>

                {/* Hand-drawn arrow and text for Step 1 -> Step 2 */}
                {index === 0 && (
                  <motion.div 
                    initial={{ opacity: 0, pathLength: 0 }}
                    whileInView={{ opacity: 1, pathLength: 1 }}
                    transition={{ delay: 1, duration: 0.8 }}
                    className="absolute -bottom-16 -left-10 md:-bottom-24 md:-left-24 z-30 hidden lg:flex flex-col items-center pointer-events-none"
                  >
                    <div className="font-['Caveat',_cursive,_italic] text-xl font-medium text-slate-600 mb-1 -rotate-6">
                      We feed context <br/> to eO's brain
                    </div>
                    <svg width="100" height="120" viewBox="0 0 100 120" className="fill-none stroke-red-500 overflow-visible" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M 60 10 C 60 80, 20 80, -20 110" />
                      <path d="M -15 95 L -20 110 L -5 115" />
                    </svg>
                  </motion.div>
                )}

                {/* Hand-drawn arrow and text for Step 2 -> Step 3 */}
                {index === 1 && (
                  <motion.div 
                    initial={{ opacity: 0, pathLength: 0 }}
                    whileInView={{ opacity: 1, pathLength: 1 }}
                    transition={{ delay: 1, duration: 0.8 }}
                    className="absolute -bottom-16 -right-10 md:-bottom-24 md:-right-24 z-30 hidden lg:flex flex-col items-center pointer-events-none"
                  >
                    <div className="font-['Caveat',_cursive,_italic] text-xl font-medium text-slate-600 mb-1 rotate-6">
                      eO analyzes your <br/> performance
                    </div>
                    {/* Flipping the SVG horizontally to point towards right */}
                    <svg width="100" height="120" viewBox="0 0 100 120" className="fill-none stroke-red-500 overflow-visible scale-x-[-1]" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M 60 10 C 60 80, 20 80, -20 110" />
                      <path d="M -15 95 L -20 110 L -5 115" />
                    </svg>
                  </motion.div>
                )}
              </motion.div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
