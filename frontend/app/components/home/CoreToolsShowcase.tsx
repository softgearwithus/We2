'use client';

import { motion } from "motion/react";
import { TrendingUp, Layout, Server, Database, Briefcase } from "lucide-react";

export default function CoreToolsShowcase() {
  return (
    <section className="py-20 bg-background/50 relative overflow-hidden" id="features">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-[800] text-foreground tracking-tight mb-3 leading-tight">
            Free Core Tools for Placement Preparation
          </h2>
          <p className="text-base text-foreground/60 font-medium max-w-xl mx-auto">
            Your personal AI assistant integrates all the tools you need directly into your dashboard, making 100% free lifetime access feel premium.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          
          {/* Test Series Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col bg-card border border-border rounded-[32px] p-8 sm:p-10 shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
          >
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-3 tracking-tight">
                AI <span className="underline decoration-primary/50 underline-offset-4">Test Series</span>
              </h3>
              <p className="text-foreground/70 leading-relaxed text-sm sm:text-base">
                Generate highly specific, company-wise and role-based mock exams. Practice the exact patterns before stepping into the real online assessment.
              </p>
            </div>
            
            {/* Visual Mockup - Sub Boxes */}
            <div className="mt-auto pt-8 w-full select-none">
              <div className="bg-background rounded-2xl border border-border/60 shadow-sm overflow-hidden group-hover:-translate-y-2 transition-transform duration-500">
                <div className="flex items-center gap-6 border-b border-border/50 px-6 py-4 bg-secondary/30">
                  <span className="text-sm font-bold text-foreground border-b-2 border-primary pb-4 -mb-[18px]">Company Tests</span>
                  <span className="text-sm font-medium text-muted-foreground pb-4 -mb-[18px]">Role Based</span>
                </div>
                <div className="p-4 flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {[
                    { company: "Google", role: "SDE II", time: "90 min" },
                    { company: "TCS", role: "NQT Prime", time: "180 min" },
                    { company: "Amazon", role: "OA Pattern", time: "70 min" },
                  ].map((test, i) => (
                    <div key={i} className="min-w-[180px] bg-secondary/40 border border-border/50 rounded-xl p-4 flex flex-col gap-3 shrink-0">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-foreground">{test.company}</span>
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">Pro</span>
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">{test.role} • {test.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Project Labs Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col bg-card border border-border rounded-[32px] p-8 sm:p-10 shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
          >
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-3 tracking-tight">
                Guided <span className="underline decoration-primary/50 underline-offset-4">Project Labs</span>
              </h3>
              <p className="text-foreground/70 leading-relaxed text-sm sm:text-base">
                Stop building generic clones. Access top industry-grade projects separated by tech-stacks to make your resume impossible to reject.
              </p>
            </div>
            
            {/* Visual Mockup - Sub Boxes */}
            <div className="mt-auto pt-8 w-full select-none">
              <div className="grid grid-cols-2 gap-3 group-hover:-translate-y-2 transition-transform duration-500">
                <div className="bg-background border border-border/60 rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-center h-[100px] shadow-sm">
                  <Layout size={20} className="text-blue-500" />
                  <span className="text-sm font-bold">Frontend</span>
                  <span className="text-[10px] text-muted-foreground">React • Next.js</span>
                </div>
                <div className="bg-background border border-border/60 rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-center h-[100px] shadow-sm">
                  <Server size={20} className="text-green-500" />
                  <span className="text-sm font-bold">Backend</span>
                  <span className="text-[10px] text-muted-foreground">Node • Go • Python</span>
                </div>
                <div className="bg-background border border-border/60 rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-center h-[100px] col-span-2 shadow-sm relative overflow-hidden">
                  <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
                  <Database size={20} className="text-primary" />
                  <span className="text-sm font-bold text-foreground z-10">Fullstack Architecture</span>
                  <span className="text-[10px] text-muted-foreground z-10">End-to-end System Design Projects</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Market Updates Card - Full Width at bottom */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="md:col-span-2 flex flex-col sm:flex-row bg-card border border-border rounded-[32px] p-8 sm:p-10 shadow-sm hover:shadow-md transition-shadow overflow-hidden group items-center"
          >
            <div className="w-full sm:w-1/2 mb-8 sm:mb-0 pr-0 sm:pr-8">
              <h3 className="text-2xl font-bold text-foreground mb-3 tracking-tight">
                Predictive <span className="underline decoration-primary/50 underline-offset-4">Market Alerts</span>
              </h3>
              <p className="text-foreground/70 leading-relaxed text-sm sm:text-base">
                Your AI agent monitors thousands of job boards and insider pipelines, pinging you instantly when sudden hiring drives or rare off-campus opportunities open up.
              </p>
            </div>
            
            {/* Visual Mockup - Simplified Alert */}
            <div className="w-full sm:w-1/2 select-none relative sm:-right-4 group-hover:translate-x-2 transition-transform">
              <div className="bg-background rounded-2xl border border-border p-5 shadow-sm flex flex-col gap-3">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
                     <Briefcase className="text-blue-600" size={16} />
                   </div>
                   <div className="flex flex-col">
                     <div className="flex items-center gap-2">
                       <h4 className="font-bold text-sm text-foreground">Amazon SDE I Hiring Drive</h4>
                       <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                     </div>
                     <p className="text-xs text-blue-600 font-semibold mt-1">Apply before midnight • Link inside</p>
                   </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
