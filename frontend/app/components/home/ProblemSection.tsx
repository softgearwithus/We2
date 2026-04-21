"use client";

import { motion } from "motion/react";
import { FileSearch, Activity, BrainCircuit, Target } from "lucide-react";

export default function ProblemSection() {
  const painPoints = [
    {
      icon: <Target className="w-12 h-12 text-[#202b20] mb-4 md:mb-8" strokeWidth={2} />,
      title: "Automated Technical Screening",
      description: "Stop wasting engineers' time. Our AI handles basic phone screens.",
      color: "bg-[#ffa116] border-2 border-[#202b20] col-span-1 md:col-span-1 md:row-span-2 text-center items-center justify-center p-8 md:p-10",
      titleClass: "text-[20px] md:text-[24px] font-[500] text-[#202b20] tracking-tight leading-snug mb-4",
      descClass: "text-[15px] font-[500] text-[#202b20]/90 leading-relaxed"
    },
    {
      icon: <Activity className="w-12 h-12 text-[#202b20] mb-4" strokeWidth={2} />,
      title: "Fair Interview Intelligence",
      description: "Human interviewers get tired. Our AI gives every candidate a fair, accurate score.",
      color: "bg-white border-2 border-[#202b20] col-span-1 md:col-span-2 md:row-span-1 text-left items-start justify-center p-8 md:p-10",
      titleClass: "text-[20px] md:text-[24px] font-[500] text-[#202b20] tracking-tight leading-snug mb-3",
      descClass: "text-[15px] font-[500] text-[#202b20]/80 leading-relaxed max-w-lg"
    },
    {
      icon: <FileSearch className="w-12 h-12 text-[#202b20] mb-4 md:mb-6" strokeWidth={2} />,
      title: "Fast Video Interviewing",
      description: "Speed up your hiring and find top talent before they get hired elsewhere.",
      color: "bg-[#efeff1] border-2 border-[#202b20] col-span-1 md:col-span-1 md:row-span-1 text-center items-center justify-center p-8 md:p-10",
      titleClass: "text-[20px] md:text-[24px] font-[500] text-[#202b20] tracking-tight leading-snug mb-4",
      descClass: "text-[15px] font-[500] text-[#202b20]/80 leading-relaxed"
    },
    {
      icon: <BrainCircuit className="w-12 h-12 text-[#202b20] mb-4 md:mb-6" strokeWidth={2} />,
      title: "Real-time AI Mock Interviews",
      description: "Let candidates practice in a real environment so they are calm and ready when it matters.",
      color: "bg-white border-2 border-[#202b20] col-span-1 md:col-span-1 md:row-span-1 text-center items-center justify-center p-8 md:p-10",
      titleClass: "text-[20px] md:text-[24px] font-[500] text-[#202b20] tracking-tight leading-snug mb-4",
      descClass: "text-[15px] font-[500] text-[#202b20]/80 leading-relaxed"
    }
  ];

  return (
    <section className="py-24 lg:py-32 bg-transparent relative overflow-hidden" id="problems">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="mb-16 md:mb-24 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[2.5rem] md:text-[4rem] font-[800] text-[#202b20] tracking-tighter mb-4"
          >
            The problems we solve
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[18px] md:text-[20px] text-[#202b20]/75 font-[500] max-w-2xl mx-auto leading-relaxed"
          >
            Hiring engineers is slow, biased, and drains your team's time. EMBLE fixes the broken technical interview loop.
          </motion.p>
        </div>

        {/* Pain Cards Bento Grid - Tavus Style Restored */}
        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 auto-rows-fr gap-8 md:gap-12 mt-16 md:mt-24 pb-6 pr-6">
          {painPoints.map((point, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={`relative group flex flex-col rounded-none shadow-[4px_4px_0_0_#202b20] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0_0_#ffa116] transition-all overflow-hidden ${point.color}`}
            >
              <div>{point.icon}</div>
              <h3 className={point.titleClass}>
                {point.title}
              </h3>
              <p className={point.descClass}>
                {point.description}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
