"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function AboutUs() {
  return (
    <section className="relative py-16 md:py-24 bg-background border-t border-border overflow-hidden flex flex-col items-center justify-center text-center">
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

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 lg:gap-20 items-center">

        {/* Left: Founder Story */}
        <div className="text-left space-y-6">
          <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-primary text-foreground mb-2 bg-white shadow-sm">
            Our Story
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground tracking-tight leading-tight">
            Built by engineers tired of failing interviews.
          </h2>
          <p className="text-lg text-foreground/70 font-medium leading-relaxed">
            We spent months grinding generic coding questions only to freeze when a real technical recruiter asked us to explain our architecture. We realized that coding skill doesn't equal interview skill.
          </p>
          <p className="text-lg text-foreground/70 font-medium leading-relaxed">
            Emble was built to fix this. We replaced generic text-based practice with a realistic, high-pressure vocal AI simulator. Fail in private, pass the real thing.
          </p>
          <div className="pt-4 flex items-center gap-4">
            <div className="h-px bg-border flex-1 max-w-[50px]"></div>
            <p className="font-bold text-foreground text-sm tracking-wide uppercase">Team Emble</p>
          </div>
        </div>

        {/* Right: Final Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="w-full bg-foreground text-background rounded-3xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden flex flex-col justify-center"
        >
          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            <h2 className="text-3xl lg:text-4xl font-[900] tracking-tight mb-4 leading-snug">
              Your First Interview Practice Takes Just 5 Minutes.
            </h2>
            <p className="text-lg text-background/70 font-medium mb-8">
              No credit card required. Start natively with eO today and see exactly where you stand.
            </p>
            <Button asChild size="lg" className="w-full sm:w-auto h-14 rounded-2xl bg-background text-foreground border border-primary px-8 text-[16px] font-bold hover:bg-background/90 hover:scale-[1.02] active:scale-95 shadow-xl transition-all">
              <Link href="/dashboard">
                Start Practicing Now
              </Link>
            </Button>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
