"use client";

import { motion } from "motion/react";
import { Code2, PenTool, LayoutTemplate } from "lucide-react";

export default function TargetUsers() {
  const personas = [
    {
      icon: <Code2 className="w-8 h-8 text-primary group-hover:text-primary transition-colors" />,
      role: "Software Engineers",
      description: "Master system design, DSA, and technical deep-dives with role-specific AI mock interviews."
    },
    {
      icon: <LayoutTemplate className="w-8 h-8 text-indigo-500 group-hover:text-indigo-500 transition-colors" />,
      role: "Product Managers",
      description: "Practice product sense, execution, and behavioral rounds with realistic stakeholder scenarios."
    },
    {
      icon: <PenTool className="w-8 h-8 text-teal-500 group-hover:text-teal-500 transition-colors" />,
      role: "UX Designers",
      description: "Articulate your design process, whiteboard effectively, and handle portfolio defense questions."
    }
  ];

  return (
    <section className="py-24 lg:py-32 bg-transparent relative" id="personas">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center mb-16 md:mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[2.5rem] md:text-[4rem] font-[800] tracking-tighter text-black mb-4 leading-[1.05]"
          >
            Built for modern <br className="hidden sm:block" />
            <span className="font-serif italic font-normal text-gray-400">tech roles.</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 pb-4 pr-4">
          {personas.map((persona, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className="group bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-gray-100 flex items-center justify-center mb-8">
                {persona.icon}
              </div>
              <h3 className="text-2xl font-[600] text-gray-900 mb-3 tracking-tight">{persona.role}</h3>
              <p className="text-gray-500 font-[400] text-[16px] leading-relaxed">
                {persona.description}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
