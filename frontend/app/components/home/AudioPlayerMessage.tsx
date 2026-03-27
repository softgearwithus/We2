"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/app/lib/utils";

export default function AudioPlayerMessage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
      audio.currentTime = 0;
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "0:00";
    const m = Math.floor(timeInSeconds / 60);
    const s = Math.floor(timeInSeconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Generate deterministic heights for the waveform
  const waveformHeights = [
    0.2, 0.4, 0.3, 0.5, 0.8, 1.0, 0.7, 0.4, 0.6, 0.9, 0.8, 0.6, 0.4, 0.3, 0.5, 0.7,
    0.6, 0.8, 1.0, 0.9, 0.5, 0.3, 0.4, 0.6, 0.8, 0.7, 0.9, 0.6, 0.4, 0.2, 0.3, 0.5,
    0.7, 0.8, 0.6, 0.9, 0.5, 0.3, 0.4, 0.6, 0.8, 0.7, 0.5, 0.3, 0.2
  ];

  return (
    <section className="w-full py-4 md:py-8 flex justify-center items-center px-6 bg-transparent relative z-20 pointer-events-none -mt-8 md:-mt-12">
      <audio ref={audioRef} src="/preview-e01.mp3" preload="metadata" />
      
      <div className="w-full max-w-2xl flex flex-col gap-3 pointer-events-auto">
        {/* Sender Info */}
        <div className="flex items-center gap-3 px-1">
          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs ring-4 ring-background shadow-sm">
            e0
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">Message from e0</span>
            <span className="text-xs text-foreground/50">Voice note • Just now</span>
          </div>
        </div>

        {/* Audio Player Container */}
        <div className="relative group w-full bg-secondary/80 backdrop-blur-md border border-border/80 rounded-[40px] py-2.5 px-2 sm:py-3.5 sm:px-3 pr-4 sm:pr-5 flex items-center gap-3 sm:gap-5 shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 transition-all duration-500 overflow-hidden">
          
          {/* Subtle animated gradient behind the player for an 'ai-elements' feel */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          {/* Play Button */}
          <button 
            onClick={togglePlay}
            className="relative z-10 w-10 h-10 sm:w-14 sm:h-14 shrink-0 rounded-full bg-primary text-primary-foreground shadow-md flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-1" />
            )}
            
            {/* Animated Ping Ring when playing */}
            {isPlaying && (
              <span className="absolute inset-0 rounded-full border-2 border-primary opacity-50 animate-ping" style={{ animationDuration: '2s' }} />
            )}
          </button>

          {/* Waveform & Timestamps Content */}
          <div className="flex-1 flex flex-col gap-1 sm:gap-1.5 justify-center relative z-10 py-1 sm:py-2 min-w-0">
            
            {/* Timestamps */}
            <div className="flex justify-start items-center px-1">
              <span className="text-xs font-semibold text-primary">{formatTime(currentTime)}</span>
            </div>

            {/* Waveform */}
            <div className="flex items-center justify-between h-6 sm:h-8 w-full overflow-hidden shrink-0 min-w-0">
              {waveformHeights.map((h, i) => {
                const barProgress = (i / waveformHeights.length) * 100;
                const isPlayed = progress >= barProgress;
                
                return (
                  <motion.div
                    key={i}
                    className={cn(
                      "w-[2px] sm:w-[5px] rounded-full transition-colors duration-300 shrink-0",
                      isPlayed ? "bg-primary shadow-[0_0_8px_rgba(var(--primary),0.4)]" : "bg-primary/20 hover:bg-primary/30"
                    )}
                    animate={{
                      height: isPlaying ? `${Math.max(12, h * 32)}px` : `${Math.max(8, h * 20)}px`,
                    }}
                    transition={{
                      height: {
                        duration: 0.2,
                        ease: "easeOut"
                      }
                    }}
                  />
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
