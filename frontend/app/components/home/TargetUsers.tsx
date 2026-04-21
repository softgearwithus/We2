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
            className="text-[2.5rem] md:text-[4rem] font-[800] tracking-tighter text-[#202b20] mb-6"
          >
            Built for modern tech roles
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 pb-4 pr-4">
          {personas.map((persona, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className="group bg-white p-10 rounded-none border-2 border-[#202b20] shadow-[4px_4px_0_0_#202b20] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0_0_#ffa116] transition-all duration-300"
            >
              <div className="h-16 w-16 rounded-none bg-[#efeff1] border-2 border-[#202b20] shadow-[4px_4px_0_0_#202b20] flex items-center justify-center mb-8">
                {persona.icon}
              </div>
              <h3 className="text-2xl font-[600] text-[#202b20] mb-4">{persona.role}</h3>
              <p className="text-[#202b20]/75 font-[500] text-[16px] leading-relaxed">
                {persona.description}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
