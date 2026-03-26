"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import { cn } from "@/app/lib/utils";
import Navbar from "@/app/components/layout/Navbar";
import Footer from "@/app/components/layout/Footer";

export default function PricingPage() {
  const freeFeatures = [
    "Test series (Company and Subject wise)",
    "Resume building (Unlimited)",
    "Market updates (Newsletter)",
    "Project labs (100+ top projects)",
  ];

  const proFeatures = [
    "Real-World AI Audio & Video Interviews",
    "Infinite Resume Parsing & Scoring",
    "1-on-1 Guidance from Industry Leaders",
    "24/7 Priority Support & Onboarding",
    "Advanced Mock Interview Analytics",
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased flex flex-col relative overflow-x-hidden">
      {/* Absolute Dotted Background Layer */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-40"
        style={{
          backgroundImage: 'radial-gradient(hsl(var(--primary) / 0.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center pt-32 pb-24 px-6 z-10 w-full">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground">
          Start Free
        </h1>
        <p className="text-lg text-muted-foreground">
          Free will remain free for lifetime.
          <br className="hidden sm:block" />
          No credit card required.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full">
        
        {/* FREE PLAN */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col p-8 rounded-[32px] border border-border bg-background shadow-sm hover:shadow-md transition-shadow relative"
        >
          <div className="mb-8">
            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-4">
              Free
            </h3>
            <div className="flex items-baseline gap-1">
              <span className="text-6xl font-bold tracking-tighter text-foreground">$0</span>
              <span className="text-muted-foreground font-medium">/month</span>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Free for lifetime. Keep practicing with core tools.
            </p>
          </div>

          <div className="flex-1 space-y-4 mb-8">
            {freeFeatures.map((feature, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-emerald-600" strokeWidth={3} />
                </div>
                <span className="text-sm text-foreground/80">{feature}</span>
              </div>
            ))}
          </div>

          <Link 
            href="/register" 
            className="w-full py-4 px-6 rounded-2xl border-2 border-border text-foreground font-semibold text-center hover:bg-muted/50 transition-colors"
          >
            Get Started Free
          </Link>
        </motion.div>

        {/* PRO PLAN */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col p-8 rounded-[32px] border-2 border-primary/30 bg-background shadow-2xl relative overflow-hidden transform md:-translate-y-4"
        >
          {/* Subtle glow / ai-elements style accent */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-80" />
          
          <div className="absolute top-6 right-8">
            <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
              Most Popular
            </span>
          </div>

          <div className="mb-8 relative z-10">
            <h3 className="text-sm font-semibold tracking-wider text-primary uppercase mb-4">
              Pro
            </h3>
            <div className="flex items-baseline gap-1">
              <span className="text-6xl font-bold tracking-tighter text-foreground">$9</span>
              <span className="text-foreground/50 font-medium">.99 /month</span>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Everything in Free, plus premium tools.
            </p>
          </div>

          <div className="flex-1 space-y-4 mb-8 relative z-10">
            {/* Added "Everything in Free" summary marker */}
            <div className="flex items-start gap-3 pb-2 border-b border-border/50 mb-4">
              <div className="mt-0.5 w-5 h-5 rounded-full bg-foreground/5 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 text-foreground/50" strokeWidth={3} />
              </div>
              <span className="text-sm font-semibold text-foreground/50">Everything in Free, plus:</span>
            </div>

            {proFeatures.map((feature, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-0.5 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-primary" strokeWidth={3} />
                </div>
                <span className="text-sm font-medium text-foreground">{feature}</span>
              </div>
            ))}
          </div>

          <Link 
            href="/register?plan=pro" 
            className="w-full py-4 px-6 rounded-2xl bg-foreground text-background font-semibold text-center hover:bg-foreground/90 transition-colors shadow-lg active:scale-95"
          >
            Get Started
          </Link>
        </motion.div>

      </div>
      </main>

      <Footer />
    </div>
  );
}
