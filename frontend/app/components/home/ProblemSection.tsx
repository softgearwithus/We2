"use client";

import { motion } from "motion/react";
import { FileSearch, Activity, BrainCircuit, Target } from "lucide-react";

export default function ProblemSection() {
  const painPoints = [
    {
      icon: <Target className="w-10 h-10 text-orange-500 mb-6" strokeWidth={1.5} />,
      title: "Context-Aware Assessments",
      description: "Connect your GitHub repositories, internal docs, and candidate files. Generate hyper-specific technical assessments with a single click.",
      color: "bg-white/60 col-span-1 md:col-span-1 md:row-span-2 text-left items-start justify-between p-8 md:p-10",
      titleClass: "text-[20px] md:text-[24px] font-[600] text-gray-900 tracking-tight leading-snug mb-3",
      descClass: "text-[15px] font-[500] text-gray-500 leading-relaxed"
    },
    {
      icon: <Activity className="w-10 h-10 text-emerald-500 mb-6" strokeWidth={1.5} />,
      title: "Automate Screening at Scale",
      description: "Send a single interview invite link to all your candidates. Our AI conducts simultaneous, in-depth technical screens so you don't have to.",
      color: "bg-white/80 col-span-1 md:col-span-2 md:row-span-1 text-left items-start justify-between p-8 md:p-10",
      titleClass: "text-[20px] md:text-[24px] font-[600] text-gray-900 tracking-tight leading-snug mb-3",
      descClass: "text-[15px] font-[500] text-gray-500 leading-relaxed max-w-lg"
    },
    {
      icon: <FileSearch className="w-10 h-10 text-blue-500 mb-6" strokeWidth={1.5} />,
      title: "Hire for True Knowledge",
      description: "Move beyond theoretical memorization. Evaluate candidates purely on their actual problem-solving abilities and practical technical knowledge.",
      color: "bg-gray-50/80 col-span-1 md:col-span-1 md:row-span-1 text-left items-start justify-between p-8 md:p-10",
      titleClass: "text-[20px] md:text-[24px] font-[600] text-gray-900 tracking-tight leading-snug mb-3",
      descClass: "text-[15px] font-[500] text-gray-500 leading-relaxed"
    },
    {
      icon: <BrainCircuit className="w-10 h-10 text-purple-500 mb-6" strokeWidth={1.5} />,
      title: "Find the Best Engineers",
      description: "We filter the noise and surface the smartest talent, giving you the confidence to hire the best software engineers for your team.",
      color: "bg-white/60 col-span-1 md:col-span-1 md:row-span-1 text-left items-start justify-between p-8 md:p-10",
      titleClass: "text-[20px] md:text-[24px] font-[600] text-gray-900 tracking-tight leading-snug mb-3",
      descClass: "text-[15px] font-[500] text-gray-500 leading-relaxed"
    }
  ];

  return (
    <section className="py-24 lg:py-32 bg-transparent relative overflow-hidden" id="problems">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="mb-16 md:mb-24 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[2.5rem] md:text-[4rem] font-[800] text-black tracking-tighter mb-4 leading-[1.05]"
          >
            Why teams switch <br className="hidden sm:block" />
            <span className="font-serif italic font-normal text-gray-400">to intelligent hiring.</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[18px] md:text-[20px] text-gray-500 font-[500] max-w-2xl mx-auto leading-relaxed"
          >
            Hiring engineers is slow, biased, and drains your team's time. EMBLE fixes the broken technical interview loop.
          </motion.p>
        </div>

        {/* Pain Cards Bento Grid - Litmus Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 auto-rows-fr gap-6 mt-16">
          {painPoints.map((point, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={`relative group flex flex-col rounded-3xl border border-gray-100/80 backdrop-blur-md shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${point.color}`}
            >
              <div>{point.icon}</div>
              <div className="mt-auto pt-8">
                <h3 className={point.titleClass}>
                  {point.title}
                </h3>
                <p className={point.descClass}>
                  {point.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
