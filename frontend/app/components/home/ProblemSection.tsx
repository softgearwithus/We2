"use client";

import { motion } from "motion/react";
import { FileSearch, Activity, BrainCircuit, Target } from "lucide-react";

export default function ProblemSection() {
  const painPoints = [
    {
      icon: <Target className="w-10 h-10 text-[#1a2b3b] mb-4 md:mb-8" strokeWidth={1.5} />,
      title: "Automated Technical Screening",
      description: "Stop wasting engineers' time. Our AI handles basic phone screens.",
      color: "bg-[#efeff1] border-transparent col-span-1 md:col-span-1 md:row-span-2 text-center items-center justify-center p-8 md:p-10",
      titleClass: "text-[20px] md:text-[24px] font-bold text-[#1a2b3b] tracking-tight leading-snug mb-4",
      descClass: "text-[14px] md:text-[15px] font-medium text-slate-600 leading-relaxed"
    },
    {
      icon: <Activity className="w-10 h-10 text-[#1a2b3b] mb-4" strokeWidth={1.5} />,
      title: "Fair Interview Intelligence",
      description: "Human interviewers get tired. Our AI gives every candidate a fair, accurate score.",
      color: "bg-white border-border/80 col-span-1 md:col-span-2 md:row-span-1 text-left items-start justify-center p-8 md:p-10",
      titleClass: "text-[20px] md:text-[24px] font-bold text-[#1a2b3b] tracking-tight leading-snug mb-3",
      descClass: "text-[14px] md:text-[15px] font-medium text-slate-600 leading-relaxed max-w-lg"
    },
    {
      icon: <FileSearch className="w-10 h-10 text-[#1a2b3b] mb-4 md:mb-6" strokeWidth={1.5} />,
      title: "Fast Video Interviewing",
      description: "Speed up your hiring and find top talent before they get hired elsewhere.",
      color: "bg-gradient-to-br from-[#e4d4ec] to-[#f4ebf4] border-transparent col-span-1 md:col-span-1 md:row-span-1 text-center items-center justify-center p-8 md:p-10",
      titleClass: "text-[20px] md:text-[24px] font-bold text-[#1a2b3b] tracking-tight leading-snug mb-4",
      descClass: "text-[14px] font-medium text-slate-700 leading-relaxed"
    },
    {
      icon: <BrainCircuit className="w-10 h-10 text-[#1a2b3b] mb-4 md:mb-6" strokeWidth={1.5} />,
      title: "Real-time AI Mock Interviews",
      description: "Let candidates practice in a real environment so they are calm and ready when it matters.",
      color: "bg-[#efeff1] border-transparent col-span-1 md:col-span-1 md:row-span-1 text-center items-center justify-center p-8 md:p-10",
      titleClass: "text-[20px] md:text-[24px] font-bold text-[#1a2b3b] tracking-tight leading-snug mb-4",
      descClass: "text-[14px] font-medium text-slate-600 leading-relaxed"
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-background relative overflow-hidden" id="problems">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="mb-12 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-[44px] font-[1000] text-[#1a2b3b] tracking-tight mb-5"
          >
            The Problems We Solve
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed"
          >
            We make hiring tech talent fast and easy for companies, and give candidates a clear way to prepare.
          </motion.p>
        </div>

        {/* Pain Cards Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 auto-rows-fr gap-4 sm:gap-6">
          {painPoints.map((point, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`rounded-[28px] border flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${point.color}`}
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
