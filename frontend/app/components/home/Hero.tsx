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

export default function Hero() {
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
    <section className="bg-background text-foreground min-h-[85vh] flex items-center pt-28 pb-10 md:pt-36 md:pb-12 overflow-hidden relative">
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
              Practice Real Tech Interviews.
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.1, ease: "easeInOut" }}
              className="max-w-[42rem] leading-relaxed text-foreground/80 sm:text-[19px] sm:leading-8 font-medium"
            >
              Simulate tech interviews with <span className="font-bold text-[#6b7280] bg-[#eed9db] px-2.5 py-0.5 rounded-md mx-1">eO</span> or book a 1:1 real human interview. Improve your resume score and track placement readiness all in one platform.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: "easeInOut" }}
              className="mt-6 sm:mt-8 flex flex-col items-start gap-3 w-full sm:w-auto"
            >
              <Button asChild size="lg" className="h-[3.6rem] px-8 sm:px-10 rounded-2xl bg-foreground text-background font-bold text-sm sm:text-base border border-transparent hover:bg-background hover:text-foreground hover:border-primary shadow-[0_0_30px_-5px_var(--color-primary)] transition-all duration-300 hover:scale-[1.02] active:scale-95">
                <Link href="/dashboard">
                  Start Practicing Free
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 sm:ml-1" />
                </Link>
              </Button>
              <p className="text-[13px] font-medium text-foreground/60 pl-2">
                Includes eO <span className="mx-1 opacity-50">•</span> 1:1 real human interview
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
                        our first most expressive<br/>interview model
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
      </div>
    </section>
  );
}
