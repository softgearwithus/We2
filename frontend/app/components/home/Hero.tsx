"use client";

import { useState, useEffect, useRef } from "react";
import { Instrument_Serif } from "next/font/google";
import { motion, AnimatePresence, useMotionValue, useTransform } from "motion/react";
import Link from 'next/link';
import { ArrowRight, GripHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic"],
});

interface HeroProps {
  customTitle?: string;
  customTitleSpan?: string;
  customSubDescription?: React.ReactNode | string;
}

export default function Hero({ customTitle, customTitleSpan, customSubDescription }: HeroProps = {}) {
  const [sessionState, setSessionState] = useState<"idle" | "connecting" | "active">("idle");
  const [time, setTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);

  // Timer for active session
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sessionState === "active") {
      interval = setInterval(() => setTime((t) => t + 1), 1000);
    } else {
      setTime(0);
    }
    return () => clearInterval(interval);
  }, [sessionState]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleSpeechChange = (isListening: boolean) => {
    if (isListening && sessionState === "idle") {
      setSessionState("connecting");

      // Simulate connection delay and start audio
      setTimeout(() => {
        setSessionState("active");
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch((e: any) => console.error("Audio play failed:", e));
        }
      }, 1500);
    } else if (!isListening) {
      endSession();
    }
  };

  const endSession = () => {
    setSessionState("idle");
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  return (
    <section className="bg-transparent text-[#202b20] min-h-[85vh] flex items-center pt-32 pb-8 md:pt-40 lg:pt-48 overflow-hidden relative">
      <audio ref={audioRef} src="/preview-e01.mp3" preload="auto" />
      <div className="container mx-auto px-6 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center max-w-7xl mx-auto">

          {/* Left Content */}
          <div className="relative flex flex-col items-start text-left sm:gap-8 gap-6 z-20">

            {/* Apple Thin Typography on Neo-Brutalism */}
            <motion.h1
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="text-[3rem] sm:text-[4rem] md:text-[5rem] lg:text-[5.5rem] font-[300] leading-[1.05] tracking-tighter text-[#202b20]"
            >
              {customTitle ? (
                <>
                  {customTitle} <span className="inline-block bg-[#ffa116] text-[#202b20] px-4 py-1 sm:py-2 border-2 border-[#202b20] shadow-[4px_4px_0_0_#202b20] mt-2 tracking-tight">{customTitleSpan}</span>
                </>
              ) : (
                <>Intelligent layer <br className="hidden lg:block" />for <span className="inline-block bg-[#ffa116] text-[#202b20] px-4 py-1 sm:py-2 border-2 border-[#202b20] shadow-[4px_4px_0_0_#202b20] mt-2 sm:mt-4 lg:ml-2 tracking-tight">interviews.</span></>
              )}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.1, ease: "easeInOut" }}
              className="max-w-[42rem] mt-2 leading-relaxed text-[#202b20]/80 text-[18px] sm:text-[20px] lg:text-[22px] font-[400]"
            >
              {customSubDescription || (
                <>Experience the most powerful intelligent Interviewer. Automate technical screening, get deep candidate insights, and hire top talent effortlessly.</>
              )}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: "easeInOut" }}
              className="mt-6 sm:mt-8 flex flex-col items-start gap-4 w-full sm:w-auto"
            >
              {/* Tavus Buttons Restored */}
              <div className="flex flex-col sm:flex-row w-full gap-4">
                <Button asChild size="lg" className="relative h-14 sm:h-16 px-8 sm:px-10 rounded-none font-bold text-base sm:text-lg transition-transform duration-200 hover:-translate-y-1 active:translate-y-[2px] active:shadow-none group bg-[#ffa116] text-[#202b20] shadow-[4px_4px_0_0_#202b20] hover:bg-[#ff9100] border-2 border-[#202b20] w-full sm:w-auto">
                  <Link href="/register" className="relative z-10 flex items-center justify-center w-full">
                    <span className="relative z-10">Start Hiring Better</span>
                    <ArrowRight className="relative z-10 w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.5} />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="relative h-14 sm:h-16 px-8 sm:px-10 rounded-none font-bold text-base sm:text-lg transition-transform duration-200 hover:-translate-y-1 active:translate-y-[2px] active:shadow-none group border-2 border-[#202b20] bg-white text-[#202b20] hover:bg-[#202b20] hover:text-white shadow-[4px_4px_0_0_#202b20] w-full sm:w-auto">
                  <Link href="/dashboard" className="relative z-10 flex items-center justify-center w-full">
                    <span className="relative z-10">Practice as Candidate</span>
                  </Link>
                </Button>
              </div>
              <p className="text-[13px] font-medium text-slate-500 pl-4 flex items-center gap-2 mt-2">
                <span className="flex h-2 w-2 rounded-full bg-[#556B2F]"></span> Includes eO evaluate & exact simulations
              </p>
            </motion.div>
          </div>

          {/* Right Content - Hanging Voice Section Restored Tavus Style */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeInOut" }}
            className="w-full flex-1 flex flex-col items-center justify-center relative z-20 group cursor-pointer lg:mt-0 mt-8"
          >
            {/* Unified wrapper for rope coordinate calculation */}
            <div className="relative flex flex-col items-center w-full max-w-[320px]">

              {/* Brutalist Hanging Wire Anchor Box */}
              <div className="w-6 h-6 border-2 border-[#202b20] bg-white rounded-none flex items-center justify-center shadow-[4px_4px_0_0_#202b20] relative z-30">
                <div className="w-2 h-2 rounded-none bg-[#202b20]" />
              </div>

              {/* Dynamic SVG Stretchable Rope */}
              <svg className="absolute top-[12px] left-1/2 overflow-visible pointer-events-none z-10" style={{ width: 2, height: 2 }}>
                <motion.line
                  x1={0} y1={0}
                  x2={dragX} y2={useTransform(dragY, y => y + 52)}
                  stroke="#202b20"
                  strokeWidth="8"
                />
              </svg>

              <motion.div
                style={{ x: dragX, y: dragY, marginTop: "40px" }}
                drag
                dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
                dragElastic={0.6}
                whileDrag={{ scale: 1.05, rotate: 2, cursor: "grabbing" }}
                whileHover={{ cursor: "grab" }}
                className="w-full aspect-[4/5] bg-white border-2 border-[#202b20] shadow-[4px_4px_0_0_#202b20] rounded-none overflow-hidden relative flex flex-col p-6 items-center justify-between z-40"
              >

                {/* Drag Handle Indicator */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center justify-center bg-[#ffa116] border-b-4 border-x-4 border-t-0 border-[#202b20] px-4 py-1 text-[11px] font-black uppercase tracking-widest text-[#202b20] pointer-events-none z-50 transition-colors">
                  <GripHorizontal size={14} className="mr-1.5" /> move
                </div>

                <AnimatePresence mode="wait">
                  {/* IDLE STATE */}
                  {sessionState === "idle" && (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center w-full h-full justify-between py-2"
                    >
                      {/* Header Text */}
                      <div className="text-center space-y-3 pt-2">
                        <h3 className="text-[26px] font-[300] tracking-tighter text-[#202b20]">Preview eO</h3>
                        <p className={`${instrumentSerif.className} text-[16px] text-[#202b20]/60 leading-snug`}>
                          our first most expressive<br />interview model
                        </p>
                        <p className="text-[14px] font-[500] text-[#202b20]/70 tracking-wide pt-2">
                          I have a voice
                        </p>
                      </div>

                      {/* Precise Soundbar Visual from Image */}
                      <div className="flex items-center justify-center gap-[6px] h-20 w-full my-auto">
                        {[8, 16, 40, 24, 48, 24, 40, 16, 8].map((baseHeight, i) => (
                          <motion.div
                            key={i}
                            className="w-[8px] rounded-full bg-[#202b20]"
                            animate={{
                              height: [`${baseHeight}px`, `${baseHeight * 1.3}px`, `${baseHeight}px`],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              delay: i * 0.1,
                              ease: "easeInOut"
                            }}
                          />
                        ))}
                      </div>

                      {/* Button */}
                      <div className="w-full pb-2 px-2">
                        <button
                          onClick={() => handleSpeechChange(true)}
                          className="w-full h-[52px] flex items-center justify-center rounded-none border-2 border-[#202b20] bg-white text-[#202b20] hover:bg-[#ffa116] transition-all shadow-[4px_4px_0_0_#202b20] active:translate-y-[2px] active:translate-x-[2px] active:shadow-[4px_4px_0_0_#202b20] font-black uppercase tracking-widest text-[#202b20]"
                        >
                          Start speaking
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* CONNECTING STATE */}
                  {sessionState === "connecting" && (
                    <motion.div
                      key="connecting"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center w-full h-full gap-8"
                    >
                      <div className="flex-1 flex items-center justify-center relative w-full">
                        {/* Geometric Core */}
                        <div className="w-24 h-24 bg-[#ffa116] border-2 border-[#202b20] absolute shadow-[4px_4px_0_0_#202b20]" />
                        {/* Expanding geometric frames */}
                        <motion.div
                          animate={{ scale: [1, 1.5, 1], rotate: [0, 90, 180] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          className="w-24 h-24 border-2 border-[#202b20] absolute"
                        />
                        <motion.div
                          animate={{ scale: [1, 2, 1], rotate: [45, 135, 225] }}
                          transition={{ duration: 3, delay: 0.5, repeat: Infinity, ease: "easeInOut" }}
                          className="w-24 h-24 border-2 border-[#202b20] absolute"
                        />
                      </div>
                      <div className="pb-8">
                        <p className="text-[#202b20] font-bold tracking-wide uppercase">connecting</p>
                      </div>
                    </motion.div>
                  )}

                  {/* ACTIVE STATE */}
                  {sessionState === "active" && (
                    <motion.div
                      key="active"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-between w-full h-full"
                    >
                      <div className="flex-1 flex items-center justify-center relative w-full mt-12">
                        {/* Geometric gears/boxes */}
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                          className="w-48 h-48 absolute border-2 border-dashed border-[#202b20]"
                        />
                        <motion.div
                          animate={{ rotate: -360 }}
                          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                          className="w-32 h-32 absolute border-2 border-dotted border-[#202b20] bg-[#ffa116]/10"
                        />
                        <div className="w-16 h-16 bg-[#202b20] absolute shadow-[4px_4px_0_0_#ffa116]" />
                      </div>

                      <div className="w-full flex flex-col items-center gap-6 pb-4">
                        <p className="text-[#202b20]/60 font-mono text-sm tracking-widest">{formatTime(time)}</p>

                        <div className="flex items-center gap-4">
                          <button
                            aria-label="Stop recording"
                            onClick={() => handleSpeechChange(false)}
                            className="w-12 h-12 rounded-none border-2 border-[#202b20] bg-white flex items-center justify-center hover:bg-[#ffa116] transition-colors shadow-[4px_4px_0_0_#202b20] active:translate-y-1 active:translate-x-1 active:shadow-none"
                          >
                            <span className="w-4 h-4 bg-red-500 border-2 border-[#202b20] animate-pulse" />
                          </button>
                          <button
                            onClick={endSession}
                            className="h-12 px-6 rounded-none bg-red-500/10 text-red-600 font-black border-2 border-red-500 hover:bg-red-500 hover:text-white transition-colors shadow-[4px_4px_0px_0px_#ef4444] active:translate-y-1 active:translate-x-1 active:shadow-none uppercase tracking-widest text-sm"
                          >
                            end session
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </motion.div>
            </div>
          </motion.div>

        </div>

        {/* Company Logos Strip */}
        <div className="w-full relative z-20 mt-20 sm:mt-28 pb-4 overflow-hidden text-center opacity-0 animate-[fadeIn_1s_ease-in-out_1s_forwards]">
          <p className="text-[14px] sm:text-[15px] text-[#202b20]/50 font-medium tracking-wide mb-8 sm:mb-10">
            Simulating hundreds of <span className="font-bold text-[#202b20]/70">companies' interviews</span>
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-10 sm:gap-x-16 max-w-5xl mx-auto opacity-70 grayscale hover:grayscale-0 transition-all duration-700">
            {[
              "accenture.png", "adobe.png", "capegemini.png", "cisco.jpg", "cognizant.png",
              "oracle.png", "salesforce.png", "samsung.png", "tcs.png", "zoho.png"
            ].map((logo, idx) => (
              <img
                key={idx}
                src={`/companies/${logo}`}
                alt="Company Logo"
                className="h-6 sm:h-8 lg:h-9 w-auto object-contain dark:invert mix-blend-multiply dark:mix-blend-screen opacity-70 hover:opacity-100 transition-all duration-300 hover:scale-110"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
