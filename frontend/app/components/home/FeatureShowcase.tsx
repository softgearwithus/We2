"use client";

import { motion } from "motion/react";
import { Mic, Video, Users, FileText, CheckCircle2, Play, UploadCloud } from "lucide-react";
import { cn } from "@/app/lib/utils";

export default function FeatureShowcase() {
  return (
    <section className="py-24 bg-background/50 relative overflow-hidden" id="features">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-[900] text-foreground tracking-tight mb-4">
            Master the AI Interview
          </h2>
          <p className="text-lg text-foreground/60 font-medium max-w-xl mx-auto">
            Build confidence faster with tools designed to simulate real-world pressure and guarantee your readiness.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          
          {/* Audio Drill Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col bg-card border border-border rounded-[32px] p-8 sm:p-10 shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
          >
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-3 tracking-tight">
                Audio <span className="underline decoration-primary/50 underline-offset-4">Drill</span>
              </h3>
              <p className="text-foreground/70 leading-relaxed text-sm sm:text-base">
                Enhance your communication skills with targeted vocal exercises. Practice pacing and clarity using instant AI audio feedback.
              </p>
            </div>
            
            {/* Visual Mockup: Audio Chat */}
            <div className="mt-auto pt-8 w-full">
              <div className="bg-secondary/30 rounded-2xl p-4 sm:p-6 border border-border/50 relative flex flex-col gap-4">
                <div className="self-end bg-primary text-primary-foreground px-4 py-3 rounded-2xl rounded-tr-sm text-sm shadow-sm max-w-[85%]">
                  Tell me about a time you solved a complex problem.
                </div>
                <div className="self-start bg-background border border-border px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-3 w-[85%]">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Play size={14} className="text-primary ml-0.5" />
                  </div>
                  {/* Fake waveform */}
                  <div className="flex-1 flex items-center gap-[3px] h-6">
                    {[0.3, 0.6, 1, 0.7, 0.4, 0.8, 0.5, 0.3, 0.6, 0.9, 0.4].map((h, i) => (
                      <div key={i} className="w-[3px] bg-primary/40 rounded-full" style={{ height: `${h * 100}%` }} />
                    ))}
                    <div className="w-[3px] bg-foreground/10 rounded-full h-full" />
                    <div className="w-[3px] bg-foreground/10 rounded-full h-[60%]" />
                    <div className="w-[3px] bg-foreground/10 rounded-full h-[30%]" />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium">0:14</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Video Simulation Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col bg-card border border-border rounded-[32px] p-8 sm:p-10 shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
          >
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-3 tracking-tight">
                Video <span className="underline decoration-primary/50 underline-offset-4">Simulation</span>
              </h3>
              <p className="text-foreground/70 leading-relaxed text-sm sm:text-base">
                Interact face-to-face with an adaptive AI agent in a high-pressure setup. It reads your expressions and technical responses instantly.
              </p>
            </div>
            
            {/* Visual Mockup: Video Call */}
            <div className="mt-auto pt-8 w-full relative">
              <div className="w-full aspect-video bg-secondary/80 rounded-2xl border border-border/60 shadow-inner relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/50 pointer-events-none" />
                <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center shadow-md z-10">
                   <span className="font-bold text-primary text-xl">e0</span>
                </div>
                {/* PIP */}
                <div className="absolute bottom-4 right-4 w-24 aspect-[3/4] bg-background border border-border/80 rounded-xl shadow-lg overflow-hidden flex items-center justify-center">
                  <UserSilhouette />
                </div>
                {/* Call controls */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-border/50">
                   <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center"><Mic size={12} className="text-destructive" /></div>
                   <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center"><Video size={12} className="text-primary" /></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ATS Scan Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col bg-card border border-border rounded-[32px] p-8 sm:p-10 shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
          >
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-3 tracking-tight">
                Unlimited Resume <span className="underline decoration-primary/50 underline-offset-4">ATS Scan</span>
              </h3>
              <p className="text-foreground/70 leading-relaxed text-sm sm:text-base">
                Upload your resume and get immediate, actionable feedback on ATS compatibility, keyword matches, and strict industry standards.
              </p>
            </div>
            
            {/* Visual Mockup: ATS Scanner */}
            <div className="mt-auto pt-8 w-full">
              <div className="bg-secondary/30 rounded-2xl p-6 border border-border/50 border-dashed flex flex-col items-center justify-center gap-4 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
                  <UploadCloud size={24} />
                </div>
                <div>
                  <div className="font-medium text-foreground text-sm">Drop your resume here</div>
                  <div className="text-xs text-muted-foreground mt-1">PDF, DOCX up to 5MB</div>
                </div>
                {/* Scan Results Mock */}
                <div className="w-full bg-background border border-border rounded-xl p-3 mt-2 flex flex-col gap-2 shadow-sm text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">ATS Score</span>
                    <span className="text-xs font-bold text-emerald-600">85%</span>
                  </div>
                  <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[85%]" />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    <span className="text-[10px] text-muted-foreground">Keywords match high</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Industry Leaders Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col bg-card border border-border rounded-[32px] p-8 sm:p-10 shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
          >
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-3 tracking-tight">
                Live <span className="underline decoration-primary/50 underline-offset-4">Mock Interview</span>
              </h3>
              <p className="text-foreground/70 leading-relaxed text-sm sm:text-base">
                Book 1-on-1 mock interviews and interact with placed industry freelancers. Get actionable, real-world feedback from the best.
              </p>
            </div>
            
            {/* Visual Mockup: Sourcing List */}
            <div className="mt-auto pt-8 w-full">
              <div className="w-full bg-background border border-border shadow-sm rounded-2xl overflow-hidden flex flex-col">
                <div className="bg-secondary/50 px-4 py-3 border-b border-border/50 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Available Experts</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="flex flex-col divide-y divide-border/40">
                  {[
                    { name: "S. Rao", role: "Sr. Software Engineer @ Google", exp: "8 Yrs" },
                    { name: "M. Patel", role: "Backend Engineer @ Amazon", exp: "5 Yrs" },
                    { name: "A. Singh", role: "System Architect @ Microsoft", exp: "10 Yrs" },
                  ].map((expert, i) => (
                    <div key={i} className="p-3 sm:p-4 flex items-center gap-3 bg-card hover:bg-secondary/30 transition-colors cursor-pointer">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                        <span className="text-[10px] font-bold text-primary">{expert.name.split(' ')[0][0]}</span>
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex justify-between items-center w-full">
                          <span className="text-sm font-semibold text-foreground truncate">{expert.name}</span>
                          <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-sm">{expert.exp}</span>
                        </div>
                        <span className="text-xs text-muted-foreground truncate">{expert.role}</span>
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
      <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" fill="currentColor"/>
      <path d="M19.9678 18.5714C20.6976 20.3069 19.3409 22 17.3879 22H6.61208C4.65913 22 3.30237 20.3069 4.03215 18.5714L5.3435 15.4527C6.01254 13.8617 7.57688 12.8333 9.32599 12.8333H14.674C16.4231 12.8333 17.9875 13.8617 18.6565 15.4527L19.9678 18.5714Z" fill="currentColor"/>
    </svg>
  );
}
