'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Code2, Terminal, UserCheck } from 'lucide-react';
import { useState, useEffect } from 'react';

// Force HMR reload by changing filename and component name
export default function HeroIDE() {
  const [step, setStep] = useState<'bug' | 'fixing' | 'fixed'>('bug');

  useEffect(() => {
    let timeout1: NodeJS.Timeout;
    let timeout2: NodeJS.Timeout;

    const cycle = () => {
      setStep('bug');
      timeout1 = setTimeout(() => {
        setStep('fixing');
        timeout2 = setTimeout(() => {
          setStep('fixed');
        }, 2000);
      }, 3000);
    };

    cycle();
    const mainInterval = setInterval(cycle, 8000);

    return () => {
      clearInterval(mainInterval);
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
  }, []);

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center relative z-20 lg:mt-0 mt-8">
      <div className="relative w-full max-w-[440px] group mx-auto">

        {/* Glowing blurred background under the HeroCard matching the requested theme */}
        <div className="absolute -inset-1 translate-y-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-70 group-hover:opacity-100 group-hover:scale-[1.02] transition-all duration-500 z-0" />

        {/* IDE Mockup */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full bg-white rounded-2xl shadow-[0_0_50px_-12px_rgba(168,85,247,0.5)] overflow-hidden relative z-30 font-mono group-hover:-translate-y-1 group-hover:scale-[1.02] group-hover:shadow-[0_0_80px_-12px_rgba(236,72,153,0.6)] transition-all duration-500 border border-purple-500/20"
        >
          {/* Mac-style Header */}
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
            </div>
            <div className="ml-2 flex flex-1 items-center justify-center">
              <span className="text-[11px] text-gray-500 flex items-center gap-2 font-medium">
                <Code2 size={12} className="text-pink-500" /> processPayment.ts
              </span>
            </div>
          </div>

          {/* Code Editor Body */}
          <div className="p-5 text-[13px] leading-relaxed overflow-hidden relative min-h-[380px]">
            {/* Line Numbers */}
            <div className="absolute left-0 top-0 bottom-0 w-10 bg-gray-50/50 border-r border-gray-200 flex flex-col items-end pr-2 pt-5 text-gray-400 select-none">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
              <span>6</span>
              <span>7</span>
            </div>

            <div className="pl-6">
              <div className="mb-3 text-pink-500 italic text-[12px] font-semibold border-b border-pink-200 pb-1 w-fit drop-shadow-[0_0_2px_rgba(236,72,153,0.3)]">
                // 🎯 Hire someone who can fix this.
              </div>
              <div className="text-purple-600 font-medium drop-shadow-[0_0_1px_rgba(147,51,234,0.3)]">async function <span className="text-blue-600 drop-shadow-[0_0_1px_rgba(37,99,235,0.3)]">processPayment</span><span className="text-gray-700">(cart: Cart, user: User) {'{'}</span></div>

              <AnimatePresence mode="wait">
                {step === 'bug' && (
                  <motion.div
                    key="bug"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative"
                  >
                    <div className="pl-4 text-red-500 font-medium italic mt-1 drop-shadow-[0_0_2px_rgba(239,68,68,0.3)]">// BUG: Race condition in payment processing</div>
                    <div className="pl-4 text-gray-700">const balance = <span className="text-purple-600 font-medium drop-shadow-[0_0_1px_rgba(147,51,234,0.3)]">await</span> getUserBalance(user.id);</div>
                    <div className="pl-4 text-gray-700">if (balance {'<'} cart.total) return <span className="text-orange-500 font-medium drop-shadow-[0_0_1px_rgba(249,115,22,0.3)]">'INSUFFICIENT'</span>;</div>
                    <div className="pl-4 mt-1 bg-red-50 border-l-2 border-red-500 py-1">
                      <span className="text-gray-700 pl-2"><span className="text-purple-600 font-medium drop-shadow-[0_0_1px_rgba(147,51,234,0.3)]">await</span> deductBalance(user.id, cart.total);</span>
                    </div>
                  </motion.div>
                )}

                {step === 'fixing' && (
                  <motion.div
                    key="fixing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="pl-4 text-pink-500 font-medium italic mt-2 flex items-center drop-shadow-[0_0_2px_rgba(236,72,153,0.3)]">
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                      >
                        █
                      </motion.span>
                      <span className="text-gray-500 ml-2">Candidate is refactoring...</span>
                    </div>
                  </motion.div>
                )}

                {step === 'fixed' && (
                  <motion.div
                    key="fixed"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative"
                  >
                    <div className="pl-4 text-emerald-500 font-medium italic mt-1 drop-shadow-[0_0_2px_rgba(16,185,129,0.3)]">// I am one of the best candidates.</div>
                    <div className="pl-4 text-emerald-500 font-medium italic drop-shadow-[0_0_2px_rgba(16,185,129,0.3)]">// FIXED: Used atomic transaction</div>
                    <div className="pl-4 text-gray-700"><span className="text-purple-600 font-medium drop-shadow-[0_0_1px_rgba(147,51,234,0.3)]">await</span> db.transaction(<span className="text-purple-600 font-medium drop-shadow-[0_0_1px_rgba(147,51,234,0.3)]">async</span> (trx) = {'>'} {'{'}</div>
                    <div className="pl-8 bg-emerald-50 border-l-2 border-emerald-500 py-1 text-gray-700">
                      <span className="pl-2">const user = <span className="text-purple-600 font-medium drop-shadow-[0_0_1px_rgba(147,51,234,0.3)]">await</span> trx('users').forUpdate().first();</span>
                    </div>
                    <div className="pl-8 text-gray-500">...</div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="text-gray-700 mt-1">{'}'}</div>
            </div>
          </div>

          {/* Terminal / Status Bar */}
          <div className="bg-gray-50 border-t border-gray-200 p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                <Terminal size={14} className={step === 'fixed' ? 'text-emerald-500' : 'text-pink-500'} />
                {step === 'bug' && <span className="text-red-500">Test suite failed (2/45)</span>}
                {step === 'fixing' && <span className="text-pink-500 animate-pulse">Running evaluation...</span>}
                {step === 'fixed' && <span className="text-emerald-600 font-medium">All tests passed (45/45)</span>}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Emble Evaluation Badge */}
        <AnimatePresence>
          {step === 'fixed' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute -left-6 -bottom-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-[0_10px_40px_rgba(236,72,153,0.15)] border border-pink-100 z-40 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 shadow-inner">
                <UserCheck size={20} />
              </div>
              <div className="flex flex-col pr-2">
                <span className="text-sm font-extrabold text-gray-900 leading-tight">Top 1% Engineer</span>
                <span className="text-[10px] text-pink-500 font-bold uppercase tracking-wider">Verified by Emble</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
