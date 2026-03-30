"use client";

import { motion } from "motion/react";
import { Mic, Video, CheckCircle2, Play, UploadCloud } from "lucide-react";

export default function FeatureShowcase() {
  return (
    <section className="pt-8 pb-24 relative overflow-hidden" id="features">
      <div className="max-w-7xl mx-auto px-6">
        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">

          {/* Dynamic Speech-to-Speech AI Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col bg-card border border-border rounded-[32px] p-8 sm:p-10 shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
          >
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-3 tracking-tight">
                Dynamic <span className="underline decoration-primary/50 underline-offset-4">Speech-to-Speech</span> AI
              </h3>
              <p className="text-foreground/70 leading-relaxed text-sm sm:text-base">
                Interaction is fluid, conversational, and hyper-realistic. eO doesn't just read prompts; it analyzes your tone, filler words, and confidence.
              </p>
            </div>

            <div className="mt-auto pt-8 w-full">
              <div className="bg-secondary/30 rounded-2xl p-4 sm:p-6 border border-border/50 relative flex flex-col gap-4">
                <div className="self-end bg-primary text-primary-foreground px-4 py-3 rounded-2xl rounded-tr-sm text-sm shadow-sm max-w-[85%]">
                  eO: How would you scale the Redis cache for 1M reads/sec?
                </div>
                <div className="self-start bg-background border border-border px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-3 w-[85%]">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Mic size={14} className="text-primary" />
                  </div>
                  <div className="flex-1 flex items-center gap-[3px] h-6">
                    {[0.3, 0.6, 1, 0.7, 0.4, 0.8, 0.5, 0.3, 0.6, 0.9, 0.4].map((h, i) => (
                      <div key={i} className="w-[3px] bg-primary/40 rounded-full animate-pulse" style={{ height: `${h * 100}%` }} />
                    ))}
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium">Listening...</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Resume & JD Matching Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col bg-card border border-border rounded-[32px] p-8 sm:p-10 shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
          >
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-3 tracking-tight">
                Resume & JD <span className="underline decoration-primary/50 underline-offset-4">Matching</span>
              </h3>
              <p className="text-foreground/70 leading-relaxed text-sm sm:text-base">
                eO asks questions specifically tailored to your exact resume experiences and the demands of your target job description.
              </p>
            </div>

            <div className="mt-auto pt-8 w-full">
              <div className="bg-secondary/30 rounded-2xl p-6 border border-border/50 border-dashed flex flex-col items-center justify-center gap-4 text-center">
                <div className="flex -space-x-4 mb-2">
                  <div className="w-16 h-16 rounded-xl bg-background border border-border shadow-sm flex items-center justify-center relative z-20 overflow-hidden transform group-hover:-rotate-6 transition-transform">
                    <span className="text-[10px] font-bold text-primary">YOUR_CV.pdf</span>
                  </div>
                  <div className="w-16 h-16 rounded-xl bg-background border border-border shadow-sm flex items-center justify-center relative z-10 overflow-hidden transform group-hover:rotate-6 transition-transform">
                    <span className="text-[10px] font-bold text-indigo-500">APPLE_JD.pdf</span>
                  </div>
                </div>
                <div className="w-full bg-background border border-border rounded-xl p-3 flex flex-col gap-2 shadow-sm text-center">
                  <span className="text-xs font-semibold text-foreground">Extracting relevant experiences...</span>
                  <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full w-[100%] animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Market Radar (Score) Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col bg-card border border-border rounded-[32px] p-8 sm:p-10 shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
          >
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-3 tracking-tight">
                Market Radar <span className="underline decoration-primary/50 underline-offset-4">(The Score)</span>
              </h3>
              <p className="text-foreground/70 leading-relaxed text-sm sm:text-base">
                Stop guessing. Emble ranks your interview performance against the actual job market standard so you know exactly when you're ready.
              </p>
            </div>

            <div className="mt-auto pt-8 w-full">
              <div className="bg-secondary/30 rounded-2xl p-6 border border-border/50 flex flex-col gap-4 text-center">
                <div className="flex items-center justify-center gap-6">
                  <div className="w-24 h-24 rounded-full border-4 border-primary flex items-center justify-center relative shadow-sm bg-background">
                    <span className="text-2xl font-bold text-foreground">8.2<span className="text-sm text-muted-foreground">/10</span></span>
                  </div>
                  <div className="flex flex-col items-start gap-2 text-left">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Top Tier</span>
                      <span className="text-sm font-semibold text-emerald-600">Hireable match</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Percentile</span>
                      <span className="text-sm font-semibold text-foreground">Top 15% out of 5k</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Company-Specific Patterns Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col bg-card border border-border rounded-[32px] p-8 sm:p-10 shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
          >
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-3 tracking-tight">
                Company-Specific <span className="underline decoration-primary/50 underline-offset-4">Patterns</span>
              </h3>
              <p className="text-foreground/70 leading-relaxed text-sm sm:text-base">
                Practice the exact patterns (DSA or System Design) frequently asked by your target company. High-yield PYQs and mock tests.
              </p>
            </div>

            <div className="mt-auto pt-8 w-full">
              <div className="w-full bg-background border border-border shadow-sm rounded-2xl overflow-hidden flex flex-col">
                <div className="bg-secondary/50 px-4 py-3 border-b border-border/50 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Top Mock Tests</span>
                  <span className="text-[10px] font-bold text-primary">View All</span>
                </div>
                <div className="flex flex-col divide-y divide-border/40">
                  {[
                    { company: "Amazon", role: "SDE II", topics: "Graphs & DP" },
                    { company: "Microsoft", role: "SDE", topics: "System Design" },
                    { company: "Google", role: "L4", topics: "Hard Array / DP" },
                  ].map((test, i) => (
                    <div key={i} className="p-3 sm:p-4 flex items-center gap-3 bg-card hover:bg-secondary/30 transition-colors cursor-pointer">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                        <span className="text-[10px] font-bold text-primary">{test.company[0]}</span>
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex justify-between items-center w-full">
                          <span className="text-sm font-semibold text-foreground truncate">{test.company} <span className="font-normal text-muted-foreground">({test.role})</span></span>
                        </div>
                        <span className="text-xs text-muted-foreground truncate">{test.topics}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

function UserSilhouette() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted-foreground/30">
      <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" fill="currentColor" />
      <path d="M19.9678 18.5714C20.6976 20.3069 19.3409 22 17.3879 22H6.61208C4.65913 22 3.30237 20.3069 4.03215 18.5714L5.3435 15.4527C6.01254 13.8617 7.57688 12.8333 9.32599 12.8333H14.674C16.4231 12.8333 17.9875 13.8617 18.6565 15.4527L19.9678 18.5714Z" fill="currentColor" />
    </svg>
  );
}
