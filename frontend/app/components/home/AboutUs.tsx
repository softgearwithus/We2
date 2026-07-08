"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function AboutUs() {
  return (
    <section className="relative py-16 md:py-32 bg-transparent border-t border-gray-100 overflow-hidden flex flex-col items-center justify-center text-center">
      <div className="absolute inset-0 pointer-events-none z-0">
        <svg className="absolute w-full h-full text-gray-900 opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dot-line-bg" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M0 32V.5H32" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx="0" cy="0" r="2.5" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dot-line-bg)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 lg:gap-20 items-center">

        {/* Left: Founder Story */}
        <div className="text-left space-y-6">
          <div className="inline-block px-3 py-1 rounded-full text-[12px] font-[600] uppercase tracking-widest border border-gray-200 text-gray-600 mb-2 bg-white/50 backdrop-blur-sm shadow-sm">
            Our Story
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-[800] text-black tracking-tighter leading-[1.05]">
            Built by engineers, <br className="hidden sm:block" />
            <span className="font-serif italic font-normal text-gray-400 block mt-1">for engineers.</span>
          </h2>
          <p className="text-lg text-gray-500 font-[400] leading-relaxed">
            We spent months sitting on both sides of the table—grinding generic coding questions as candidates, and wasting hours on basic technical screens as interviewers.
          </p>
          <p className="text-lg text-gray-500 font-[400] leading-relaxed">
            Emble was built to fix both. We replaced static resumes and scripted AI wrappers with an autonomous evaluator. Companies hire faster, and candidates get a realistic, objective chance to shine.
          </p>
          <div className="pt-6 flex items-center gap-4">
            <div className="h-px bg-gray-200 flex-1 max-w-[50px]"></div>
            <p className="font-[600] text-gray-900 text-sm tracking-widest uppercase">Team Emble</p>
          </div>
        </div>

        {/* Right: Final Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="w-full bg-gray-900 text-white rounded-3xl p-10 md:p-12 text-center shadow-2xl relative overflow-hidden flex flex-col justify-center"
        >
          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            <h2 className="text-3xl lg:text-4xl font-[700] tracking-tight mb-4 leading-snug">
              Transform your hiring <br /> pipeline today.
            </h2>
            <p className="text-[16px] text-gray-400 font-[400] mb-8 leading-relaxed">
              No credit card required. Experience our autonomous evaluator eO in action and stop wasting engineering hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button asChild size="lg" className="w-full sm:w-auto h-14 rounded-full bg-white text-gray-900 px-8 text-[15px] font-[600] hover:bg-gray-50 hover:scale-[1.02] shadow-xl transition-all duration-300">
                <Link href="/register">
                  Start Hiring Better
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
