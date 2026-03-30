"use client";

import { useState, useEffect, useRef } from "react";
import { Instrument_Serif } from "next/font/google";
import { motion, AnimatePresence } from "motion/react";
import Link from 'next/link';
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SpeechInput } from "@/components/ai-elements/speech-input";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import ParticlesBackground from '../ui/ParticlesBackground';

const waveformHeights = [
  0.2, 0.4, 0.3, 0.5, 0.8, 1.0, 0.7, 0.4, 0.6, 0.9, 0.8, 0.6, 0.4, 0.3, 0.5, 0.7,
  0.6, 0.8, 1.0, 0.9, 0.5, 0.3, 0.4, 0.6, 0.8
];

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
    <section className="bg-background text-foreground min-h-[85vh] flex items-center pt-36 pb-10 md:pt-44 lg:pt-48 md:pb-12 overflow-hidden relative">
      <ParticlesBackground />
      <audio ref={audioRef} src="/preview-e01.mp3" preload="auto" />
      <div className="container mx-auto px-6 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center max-w-7xl mx-auto">

          {/* Left Content */}
          <div className="relative flex flex-col items-start text-left sm:gap-8 gap-6 z-20">


            <motion.h1
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-foreground"
            >
              {customTitle ? (
                <>
                  {customTitle} <span className="text-primary">{customTitleSpan}</span>
                </>
              ) : (
                "Practice Real Tech Interviews."
              )}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.1, ease: "easeInOut" }}
              className="max-w-[42rem] leading-relaxed text-foreground/80 text-[16px] sm:text-[18px] lg:text-[19px] sm:leading-8 font-medium"
            >
              {customSubDescription || (
                <>Simulate tech interviews with <span className="font-bold text-[#6b7280] bg-[#eed9db] px-2.5 py-0.5 rounded-md mx-1">eO</span> or book a 1:1 interview with industry experts. Improve your resume score and practice <span className="whitespace-nowrap">company-specific tests</span>, all in one platform.</>
              )}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: "easeInOut" }}
              className="mt-6 sm:mt-8 flex flex-col items-start gap-4 w-full sm:w-auto"
            >
              <Button asChild size="lg" className="relative h-14 px-8 sm:px-10 rounded-full font-bold text-base transition-all duration-500 hover:scale-[1.02] active:scale-95 group overflow-hidden bg-slate-900 text-white shadow-2xl hover:shadow-indigo-500/25 border border-slate-800">
                <Link href="/dashboard" className="relative z-10 flex items-center justify-center w-full">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0" />
                  <span className="relative z-10">Start Practicing Free</span>
                  <ArrowRight className="relative z-10 w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
              <p className="text-[13px] font-medium text-slate-500 pl-4 flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span> Includes eO & 1:1 human interviews
              </p>
            </motion.div>
          </div>

          {/* Right Content - Hanging Voice Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeInOut" }}
            whileHover={{ y: -4 }}
            className="w-full flex-1 flex flex-col items-center justify-center relative z-20 group cursor-pointer lg:mt-0 mt-8"
          >
            {/* Hanging Stitch Effect */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center z-30">
              <div className="w-3 h-3 rounded-full bg-primary shadow flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-background" />
              </div>
              <div className="w-[2px] h-6 bg-gradient-to-b from-primary to-primary/20" />
            </div>

            {/* Ultra-Premium Glassmorphic Annotation */}
            <div className="hidden lg:block absolute -top-[120px] xl:-top-[130px] left-[5%] xl:-left-[5%] z-50 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  opacity: { duration: 0.8, delay: 1.5 },
                  scale: { duration: 0.8, delay: 1.5, type: "spring" }
                }}
                className="relative"
              >
                <div className="max-w-[220px] xl:max-w-[240px] relative group/message">
                  <Message from="assistant" className="relative shadow-sm border border-slate-200 rounded-2xl bg-white/95 backdrop-blur-xl overflow-hidden">
                    {/* Glass shine overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-white/0 pointer-events-none" />

                    <MessageContent className="p-4 bg-transparent border-none shadow-none flex flex-col gap-1.5 w-full">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center relative w-4 h-4 rounded-full bg-emerald-100">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                          </div>
                          <span className="font-bold text-[11px] text-indigo-500 uppercase tracking-widest">eO Says </span>
                        </div>
                      </div>
                      <div className="text-[12.5px] leading-snug text-slate-700 bg-transparent text-left break-words w-full">
                        <span className="text-slate-500 font-medium">I have perfect memory.</span><br />
                        <span className="font-semibold text-slate-800">Yes, I am your personal interviewer.</span>
                      </div>
                    </MessageContent>
                  </Message>
                </div>

                {/* Flowing animated dash connection line */}
                <svg className="absolute -bottom-[35px] left-[50%] w-[50px] h-[40px] overflow-visible pointer-events-none" viewBox="0 0 50 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Stable background dashed path */}
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 2.2, duration: 1, ease: "easeInOut" }}
                    d="M 0 0 Q 15 25, 30 35"
                    stroke="url(#line-glow)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray="5 5"
                    opacity="0.3"
                  />
                  {/* Animated flowing dashed overlay */}
                  <motion.path
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, strokeDashoffset: [10, 0] }}
                    transition={{
                      opacity: { delay: 2.2, duration: 1 },
                      strokeDashoffset: { repeat: Infinity, duration: 1, ease: "linear" }
                    }}
                    d="M 0 0 Q 15 25, 30 35"
                    stroke="url(#line-glow)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray="5 5"
                  />
                  {/* Elegant arrowhead pointing to the card */}
                  <motion.path
                    initial={{ opacity: 0, y: -3 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.8, duration: 0.3 }}
                    d="M 30 38 L 24 28 L 36 30 Z"
                    fill="#8b5cf6"
                  />
                  <defs>
                    <linearGradient id="line-glow" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>
            </div>

            <div className="w-full max-w-[320px] aspect-[4/5] bg-background/50 backdrop-blur-md border border-border rounded-2xl shadow-xl overflow-hidden relative flex flex-col p-6 items-center justify-between group-hover:border-primary/30 group-hover:shadow-primary/10 transition-all duration-500">

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
                      <h3 className="text-[22px] font-medium text-foreground tracking-tight">Preview eO</h3>
                      <p className={`${instrumentSerif.className} text-[16px] text-foreground/60 leading-snug`}>
                        our first most expressive<br />interview model
                      </p>
                      <p className="text-[14px] font-bold text-foreground/70 tracking-wide pt-2">
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
                        className="w-full h-[46px] flex items-center justify-center rounded-[24px] border border-foreground/20 bg-transparent text-foreground hover:bg-foreground/5 transition-colors"
                      >
                        <span className="font-medium text-[15px]">Start speaking</span>
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
                      {/* Solid light green core */}
                      <div className="w-48 h-48 rounded-full bg-secondary/60 absolute" />
                      {/* Expanding rings */}
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-56 h-56 rounded-full border border-primary/40 absolute"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                        transition={{ duration: 2, delay: 0.5, repeat: Infinity, ease: "linear" }}
                        className="w-64 h-64 rounded-full border border-primary/20 absolute"
                      />
                    </div>
                    <div className="pb-8">
                      <p className="text-primary font-bold tracking-wide">connecting</p>
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
                      {/* Dashed outer ring */}
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="w-64 h-64 absolute rounded-full border-[3px] border-dashed border-primary"
                      />
                      {/* Inner dashed ring rotating opposite */}
                      <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="w-52 h-52 absolute rounded-full border-[2px] border-dashed border-primary/50"
                      />
                    </div>

                    <div className="w-full flex flex-col items-center gap-6 pb-4">
                      <p className="text-foreground/60 font-mono text-sm tracking-widest">{formatTime(time)}</p>

                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleSpeechChange(false)}
                          className="w-12 h-12 rounded-full bg-secondary border border-primary/20 text-primary flex items-center justify-center hover:bg-secondary/80 transition-colors shadow-sm"
                        >
                          {/* Recording indicator dot */}
                          <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        </button>
                        <button
                          onClick={endSession}
                          className="h-12 px-6 rounded-full bg-destructive/20 text-destructive font-medium hover:bg-destructive/30 border border-destructive/20 transition-colors"
                        >
                          end session
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </motion.div>

        </div>

        {/* Company Logos Strip */}
        <div className="w-full relative z-20 mt-20 sm:mt-28 pb-4 overflow-hidden text-center opacity-0 animate-[fadeIn_1s_ease-in-out_1s_forwards]">
          <p className="text-[14px] sm:text-[15px] text-foreground/50 font-medium tracking-wide mb-8 sm:mb-10">
            Featuring targeted test series for <span className="font-bold text-foreground/70">100+ top companies</span>
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
