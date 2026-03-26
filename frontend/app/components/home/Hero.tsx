"use client";

import { useState, useEffect, useRef } from "react";
import { Instrument_Serif } from "next/font/google";
import { motion, AnimatePresence } from "motion/react";
import Link from 'next/link';
import { SpeechInput } from "@/components/ai-elements/speech-input";
import ParticlesBackground from '../ui/ParticlesBackground';

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
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium leading-[1.05] tracking-tight text-foreground"
            >
              The most expressive human <span className={`${instrumentSerif.className} tracking-tight text-primary`}>interview</span> model.
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.1, ease: "easeInOut" }}
              className="text-lg sm:text-[22px] font-normal max-w-xl text-foreground/70 leading-relaxed"
            >
              <span className="font-semibold text-foreground underline decoration-primary/40 underline-offset-4">Practice</span> <span className="font-semibold text-foreground underline decoration-primary/40 underline-offset-4">real-time interviews</span> with emotionally intelligent AI agents. Additionally utilize our free core tools to conquer your placements before facing the real recruiter.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: "easeInOut" }}
              className="mt-4 sm:mt-6"
            >
              <Link 
                href="/register" 
                className="inline-flex items-center justify-center gap-2 bg-foreground text-background hover:bg-foreground/90 px-8 py-4 rounded-xl font-semibold text-base transition-all shadow-xl shadow-foreground/10 active:scale-95"
              >
                Try Emble for free
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1"><path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
              </Link>
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
                    className="flex flex-col items-center justify-center w-full h-full gap-8"
                  >
                    <div className="text-center space-y-2 pt-4">
                      <h3 className="text-xl font-medium text-foreground group-hover:text-primary transition-colors">Preview e0</h3>
                      <p className="text-sm text-foreground/60">our first most expressive<br/>interview model</p>
                      <motion.p 
                        className="text-sm font-semibold text-primary pt-2"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        I have a voice
                      </motion.p>
                    </div>

                    {/* Faux Waveform Image replacing Persona for exact screenshot match */}
                    <div className="flex-1 flex items-center justify-center w-full py-8">
                      <div className="flex items-center justify-center gap-1 h-24">
                        {[0.2, 0.4, 1, 0.6, 0.8, 1.2, 0.8, 0.4, 0.2].map((h, i) => (
                          <motion.div 
                            key={i}
                            className="w-3 bg-foreground rounded-full origin-center"
                            animate={{ height: `${h * 48}px` }}
                            transition={{ duration: 0.5 }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="w-full pb-4">
                      {/* We hide the speech input visually but use it to trigger interaction, 
                          or we just style it to look like the pill button! */}
                      <div className="relative w-full h-12">
                        <SpeechInput 
                          onListeningChange={handleSpeechChange}
                          className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                        />
                        <div className="absolute inset-0 flex items-center justify-center rounded-full border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 transition-colors">
                          <span className="font-medium">Start speaking</span>
                        </div>
                      </div>
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
                        <SpeechInput 
                          onListeningChange={handleSpeechChange}
                          className="w-12 h-12 rounded-full bg-secondary border border-primary/20 text-primary flex items-center justify-center hover:bg-secondary/80 transition-colors shadow-sm"
                        />
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
