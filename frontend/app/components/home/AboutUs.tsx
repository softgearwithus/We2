"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function AboutUs() {
  return (
    <section className="relative py-24 md:py-32 bg-background border-t border-border overflow-hidden flex flex-col items-center justify-center text-center">
      <div className="absolute inset-0 pointer-events-none z-0">
        <svg className="absolute w-full h-full text-foreground opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dot-line-bg" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M0 32V.5H32" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx="0" cy="0" r="2.5" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dot-line-bg)" />
        </svg>
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 space-y-10 flex flex-col items-center">
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-[40px] md:text-5xl lg:text-7xl font-bold text-foreground tracking-[-0.03em] leading-[1.05]"
        >
          We built the ultimate ecosystem to get you <span className="text-foreground/50">hired faster by simulating real corporate challenges.</span>
        </motion.h2>

        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto font-serif leading-relaxed"
        >
          Preparation works best when everything aligns. We connect your resume, coding skills, and interview readiness into a cohesive, free platform.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="pt-4"
        >
          <Link 
            href="/dashboard" 
            className="inline-flex h-[52px] items-center justify-center rounded-[14px] bg-[#1c241d] px-8 font-medium text-background transition-all hover:bg-[#2a3626] active:scale-95 group shadow-sm"
          >
            Practice for free
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
