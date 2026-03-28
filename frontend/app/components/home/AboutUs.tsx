"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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

      <div className="max-w-4xl mx-auto px-6 space-y-16 flex flex-col items-center">

        {/* Founder Story */}
        <div className="text-center space-y-6 max-w-3xl border-b border-border/50 pb-16">
          <span className="font-bold text-primary tracking-widest text-sm uppercase">Our Story</span>
          <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
            Built by engineers who were tired of failing interviews.
          </h2>
          <p className="text-lg text-foreground/70 font-medium leading-relaxed">
            We spent months grinding generic coding questions only to freeze when a real technical recruiter asked us to explain our architecture. We realized that coding skill doesn't equal interview skill.
          </p>
          <p className="text-lg text-foreground/70 font-medium leading-relaxed">
            Emble was built to fix this. We replaced the generic text-based practice with a realistic, high-pressure vocal AI simulator. So you can fail in private, and pass the real thing.
          </p>
          <div className="pt-6 flex flex-col items-center justify-center">
            <p className="font-bold text-foreground text-lg tracking-wide">Team Emble</p>
          </div>
        </div>

        {/* Final Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="w-full bg-foreground text-background rounded-3xl p-10 md:p-16 text-center shadow-2xl relative overflow-hidden"
        >
          {/* Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            <h2 className="text-4xl md:text-5xl lg:text-5xl font-[900] tracking-tight mb-6">
              Your First Interview Practice Takes Just 5 Minutes.
            </h2>
            <p className="text-xl text-background/70 font-medium mb-10">
              No credit card required. Start natively with eO today and see exactly where you stand.
            </p>
            <Button asChild size="lg" className="h-16 rounded-2xl bg-background text-foreground border border-primary px-10 text-[17px] font-bold hover:bg-background/90 hover:scale-[1.02] active:scale-95 shadow-xl transition-all">
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
