"use client";

import { motion } from "motion/react";
import { Mic, Video, CheckCircle2, Play, UploadCloud } from "lucide-react";

export default function FeatureShowcase() {
  return (
    <section className="pt-8 pb-24 relative overflow-hidden" id="features">
      <div className="max-w-7xl mx-auto px-6">
        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">

          {/* Dynamic Speech-to-Speech AI Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col bg-white border-2 border-[#202b20] rounded-none p-8 sm:p-10 shadow-[2px_2px_0_0_#202b20] hover:shadow-[2px_2px_0_0_#ffa116] hover:-translate-y-1 transition-all overflow-hidden group"
          >
            <div className="mb-8">
              <h3 className="text-3xl md:text-4xl font-[800] tracking-tighter text-[#202b20] mb-3">
                Dynamic <span className="text-white bg-[#202b20] px-2 shadow-[2px_2px_0_0_#ffa116]">Speech-to-Speech</span> AI
              </h3>
              <p className="text-[#202b20]/70 leading-relaxed text-base font-[500]">
                Interaction is fluid, conversational, and hyper-realistic. eO doesn't just read prompts; it analyzes your tone, filler words, and confidence.
              </p>
            </div>

            <div className="mt-auto pt-8 w-full">
              <div className="bg-[#efeff1] rounded-none p-4 sm:p-6 border-2 border-[#202b20] relative flex flex-col gap-5 shadow-[2px_2px_0_0_#202b20]">
                <div className="self-end bg-[#ffa116] text-[#202b20] font-bold px-4 py-3 rounded-none border-2 border-[#202b20] shadow-[2px_2px_0_0_#202b20] text-sm max-w-[85%]">
                  eO: How would you scale the Redis cache for 1M reads/sec?
                </div>
                <div className="self-start bg-white border-2 border-[#202b20] shadow-[2px_2px_0_0_#202b20] px-4 py-3 rounded-none flex items-center gap-3 w-[85%]">
                  <div className="w-8 h-8 rounded-none border-2 border-[#202b20] bg-white flex items-center justify-center shrink-0">
                    <Mic size={14} className="text-[#202b20]" />
                  </div>
                  <div className="flex-1 flex items-center gap-[3px] h-6">
                    {[0.3, 0.6, 1, 0.7, 0.4, 0.8, 0.5, 0.3, 0.6, 0.9, 0.4].map((h, i) => (
                      <div key={i} className="w-[4px] bg-[#202b20] rounded-none animate-pulse" style={{ height: `${h * 100}%` }} />
                    ))}
                  </div>
                  <span className="text-[10px] text-[#202b20] uppercase font-bold tracking-wider">Listening...</span>
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
            className="flex flex-col bg-white border-2 border-[#202b20] rounded-none p-8 sm:p-10 shadow-[2px_2px_0_0_#202b20] hover:shadow-[2px_2px_0_0_#ffa116] hover:-translate-y-1 transition-all overflow-hidden group"
          >
            <div className="mb-8">
              <h3 className="text-3xl md:text-4xl font-[800] tracking-tighter text-[#202b20] mb-3">
                Experience & JD <span className="text-white bg-[#202b20] px-2 shadow-[2px_2px_0_0_#ffa116]">Matching</span>
              </h3>
              <p className="text-[#202b20]/70 leading-relaxed text-base font-[500]">
                eO asks questions specifically tailored to your exact resume experiences and the demands of your target job description.
              </p>
            </div>

            <div className="mt-auto pt-8 w-full">
              <div className="bg-[#efeff1] rounded-none p-6 border-[3px] border-[#202b20] border-dashed shadow-[2px_2px_0_0_#202b20] flex flex-col items-center justify-center gap-6 text-center">
                <div className="flex -space-x-4 mb-2">
                  <div className="w-16 h-20 rounded-none bg-white border-2 border-[#202b20] shadow-[2px_2px_0_0_#202b20] flex items-center justify-center relative z-20 overflow-hidden transform group-hover:-rotate-6 transition-transform">
                    <span className="text-[10px] font-bold text-[#202b20] uppercase tracking-wider">YOUR_CV.pdf</span>
                  </div>
                  <div className="w-16 h-20 rounded-none bg-[#ffa116] border-2 border-[#202b20] shadow-[2px_2px_0_0_#202b20] flex items-center justify-center relative z-10 overflow-hidden transform group-hover:rotate-6 transition-transform">
                    <span className="text-[10px] font-bold text-[#202b20] uppercase tracking-wider">APPLE_JD.pdf</span>
                  </div>
                </div>
                <div className="w-full bg-white border-2 border-[#202b20] rounded-none p-4 flex flex-col gap-3 shadow-[2px_2px_0_0_#202b20] text-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#202b20]">Extracting relevant experiences...</span>
                  <div className="w-full h-2 bg-[#202b20]/10 rounded-none overflow-hidden relative">
                    <div className="absolute inset-y-0 left-0 bg-[#ffa116] w-full border-r-2 border-[#202b20] animate-pulse" />
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
            className="flex flex-col bg-white border-2 border-[#202b20] rounded-none p-8 sm:p-10 shadow-[2px_2px_0_0_#202b20] hover:shadow-[2px_2px_0_0_#ffa116] hover:-translate-y-1 transition-all overflow-hidden group"
          >
            <div className="mb-8">
              <h3 className="text-3xl md:text-4xl font-[800] tracking-tighter text-[#202b20] mb-3">
                Market Radar <span className="text-white bg-[#202b20] px-2 shadow-[2px_2px_0_0_#ffa116] whitespace-nowrap">(The Score)</span>
              </h3>
              <p className="text-[#202b20]/70 leading-relaxed text-base font-[500]">
                Stop guessing. Emble ranks your interview performance against the actual job market standard so you know exactly when you're ready.
              </p>
            </div>

            <div className="mt-auto pt-8 w-full">
              <div className="bg-[#efeff1] rounded-none p-6 border-2 border-[#202b20] shadow-[2px_2px_0_0_#202b20] flex flex-col gap-4 text-center">
                <div className="flex items-center justify-center gap-6">
                  <div className="w-24 h-24 rounded-none border-2 border-[#202b20] flex items-center justify-center relative shadow-[2px_2px_0_0_#202b20] bg-white transform -rotate-3">
                    <span className="text-[2rem] font-[1000] text-[#202b20] tracking-tighter">8.2<span className="text-base text-[#202b20]/50">/10</span></span>
                  </div>
                  <div className="flex flex-col items-start gap-3 text-left">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-[#202b20]/60 uppercase font-bold tracking-wider">Top Tier</span>
                      <span className="text-[15px] font-bold text-[#ffa116] px-1 bg-[#202b20] border-2 border-[#202b20]">Hireable match</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-[#202b20]/60 uppercase font-bold tracking-wider">Percentile</span>
                      <span className="text-[14px] font-[600] text-[#202b20]">Top 15% out of 5k</span>
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
            className="flex flex-col bg-white border-2 border-[#202b20] rounded-none p-8 sm:p-10 shadow-[2px_2px_0_0_#202b20] hover:shadow-[2px_2px_0_0_#ffa116] hover:-translate-y-1 transition-all overflow-hidden group"
          >
            <div className="mb-8">
              <h3 className="text-3xl md:text-4xl font-[800] tracking-tighter text-[#202b20] mb-3">
                Company-Specific <span className="text-white bg-[#202b20] px-2 shadow-[2px_2px_0_0_#ffa116]">Patterns</span>
              </h3>
              <p className="text-[#202b20]/70 leading-relaxed text-base font-[500]">
                Practice the exact patterns (DSA or System Design) frequently asked by your target company. High-yield PYQs and mock tests.
              </p>
            </div>

            <div className="mt-auto pt-8 w-full">
              <div className="w-full bg-white border-2 border-[#202b20] shadow-[2px_2px_0_0_#202b20] rounded-none overflow-hidden flex flex-col">
                <div className="bg-[#202b20] px-4 py-3 border-b-2 border-[#202b20] flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#ffa116] uppercase tracking-wider">Top Mock Tests</span>
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider cursor-pointer hover:underline underline-offset-2">View All</span>
                </div>
                <div className="flex flex-col divide-y-2 divide-[#202b20]">
                  {[
                    { company: "Amazon", role: "SDE II", topics: "Graphs & DP" },
                    { company: "Microsoft", role: "SDE", topics: "System Design" },
                    { company: "Google", role: "L4", topics: "Hard Array / DP" },
                  ].map((test, i) => (
                    <div key={i} className="p-3 sm:p-4 flex items-center gap-4 bg-[#efeff1] hover:bg-[#ffa116] transition-colors cursor-pointer group/test">
                      <div className="w-10 h-10 rounded-none bg-white flex items-center justify-center shrink-0 border-2 border-[#202b20] shadow-[2px_2px_0_0_#202b20]">
                        <span className="text-sm font-bold text-[#202b20] uppercase">{test.company[0]}</span>
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex justify-between items-center w-full">
                          <span className="text-[15px] font-bold text-[#202b20] uppercase tracking-wide truncate">{test.company} <span className="font-medium text-[#202b20]/60 normal-case tracking-normal">({test.role})</span></span>
                        </div>
                        <span className="text-xs text-[#202b20]/70 font-medium truncate">{test.topics}</span>
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
