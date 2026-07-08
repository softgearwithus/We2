"use client";

import { motion } from "motion/react";
import { Code2, ShieldCheck, FileSearch, BarChart3 } from "lucide-react";

export default function FeatureShowcase() {
  return (
    <section className="py-24 relative overflow-hidden" id="features">
      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-[2.5rem] md:text-[3.5rem] font-bold tracking-tight text-gray-900 mb-4">
            Intelligent <span className="font-serif italic font-normal text-gray-500">Interview Infrastructure</span>
          </h2>
          <p className="text-lg text-gray-500">
            Enterprise-grade technical assessments that evaluate engineers exactly like your senior team would.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">

          {/* Cloud Environments Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col relative rounded-[2rem] p-8 sm:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all overflow-hidden group bg-white border border-gray-100"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-50/50 via-white to-purple-50/50 opacity-50 pointer-events-none" />

            <div className="mb-8 relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 mb-3">
                Live Technical <span className="font-serif italic font-normal text-pink-600">Environments</span>
              </h3>
              <p className="text-gray-500 leading-relaxed text-base">
                Candidates write, compile, and run code in secure, cloud-hosted IDEs that simulate real-world production environments.
              </p>
            </div>

            <div className="mt-auto pt-8 w-full relative z-10">
              <div className="bg-gray-900 rounded-2xl p-4 sm:p-6 border border-gray-800 shadow-sm relative flex flex-col gap-4 font-mono text-sm">
                <div className="flex gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="text-emerald-400">~/project $ npm run test</div>
                <div className="text-gray-300">
                  PASS  src/api/auth.test.ts<br />
                  PASS  src/utils/crypto.test.ts<br />
                  <span className="text-emerald-400 font-bold">Test Suites: 12 passed, 12 total</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Context-Aware AI Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col relative rounded-[2rem] p-8 sm:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all overflow-hidden group bg-white border border-gray-100"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-white to-lime-50/50 opacity-50 pointer-events-none" />

            <div className="mb-8 relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 mb-3">
                Context-Aware <span className="font-serif italic font-normal text-purple-600">Evaluation</span>
              </h3>
              <p className="text-gray-500 leading-relaxed text-base">
                Our AI reads your provided GitHub repositories and documentation to generate highly specific architectural questions.
              </p>
            </div>

            <div className="mt-auto pt-8 w-full relative z-10">
              <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-6 text-center">
                <div className="flex -space-x-4 mb-2">
                  <div className="w-16 h-20 rounded-xl bg-slate-900 border border-gray-800 shadow-md flex items-center justify-center relative z-20 overflow-hidden transform group-hover:-rotate-6 transition-transform">
                    <Code2 className="text-white w-6 h-6" />
                  </div>
                  <div className="w-16 h-20 rounded-xl bg-purple-100 border border-purple-200 shadow-md flex items-center justify-center relative z-10 overflow-hidden transform group-hover:rotate-6 transition-transform">
                    <FileSearch className="text-purple-600 w-6 h-6" />
                  </div>
                </div>
                <div className="w-full bg-white border border-gray-100 rounded-xl p-4 flex flex-col gap-3 shadow-sm text-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Parsing Repository...</span>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden relative">
                    <div className="absolute inset-y-0 left-0 bg-purple-500 w-full animate-pulse rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Plagiarism & Integrity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col relative rounded-[2rem] p-8 sm:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all overflow-hidden group bg-white border border-gray-100"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-lime-50/50 via-white to-pink-50/50 opacity-50 pointer-events-none" />

            <div className="mb-8 relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 mb-3">
                Anti-Cheat & <span className="font-serif italic font-normal text-lime-600">Integrity</span>
              </h3>
              <p className="text-gray-500 leading-relaxed text-base">
                Enterprise-grade proctoring including copy-paste detection, tab switching alerts, and AI-assisted plagiarism checks.
              </p>
            </div>

            <div className="mt-auto pt-8 w-full relative z-10">
              <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col gap-3 text-center">
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="text-lime-500 w-5 h-5" />
                    <span className="text-sm font-semibold text-gray-900">Copy-Paste Prevention</span>
                  </div>
                  <span className="text-xs bg-lime-100 text-lime-700 px-2 py-1 rounded-full font-bold">Active</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="text-lime-500 w-5 h-5" />
                    <span className="text-sm font-semibold text-gray-900">Tab Focus Tracking</span>
                  </div>
                  <span className="text-xs bg-lime-100 text-lime-700 px-2 py-1 rounded-full font-bold">Active</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Deep Analytics Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col relative rounded-[2rem] p-8 sm:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all overflow-hidden group bg-white border border-gray-100"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-white to-pink-50/50 opacity-50 pointer-events-none" />

            <div className="mb-8 relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 mb-3">
                Deep <span className="font-serif italic font-normal text-purple-600">Analytics</span>
              </h3>
              <p className="text-gray-500 leading-relaxed text-base">
                Stop guessing. Emble provides standardized scorecards comparing candidates across architecture, coding, and communication.
              </p>
            </div>

            <div className="mt-auto pt-8 w-full relative z-10">
              <div className="w-full bg-white border border-gray-100 shadow-sm rounded-2xl p-5 flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                  <span className="text-sm font-bold text-gray-900">ATS Scorecard</span>
                  <BarChart3 className="text-purple-500 w-4 h-4" />
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1 text-gray-600">
                      <span>System Design</span>
                      <span className="text-purple-600">92/100</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full"><div className="h-full bg-purple-500 rounded-full w-[92%]" /></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1 text-gray-600">
                      <span>Algorithm Optimization</span>
                      <span className="text-purple-600">85/100</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full"><div className="h-full bg-purple-500 rounded-full w-[85%]" /></div>
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
