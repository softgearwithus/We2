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
    <section className="py-24 bg-secondary/20 relative" id="personas">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-foreground tracking-tight mb-4"
          >
            Built for modern tech roles
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {personas.map((persona, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="group bg-background p-10 rounded-3xl border shadow-sm hover:shadow-xl hover:border-border/80 transition-all duration-300"
            >
              <div className="h-16 w-16 rounded-2xl bg-secondary/50 flex items-center justify-center mb-8">
                {persona.icon}
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">{persona.role}</h3>
              <p className="text-foreground/70 font-medium leading-relaxed">
                {persona.description}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
