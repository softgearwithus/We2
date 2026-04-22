'use client';

/**
 * HeroCard — the interactive draggable demo card.
 * Loaded with ssr:false so Framer Motion's AnimatePresence
 * never runs on the server → zero hydration mismatch.
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'motion/react';
import { GripHorizontal } from 'lucide-react';

export default function HeroCard() {
  const [sessionState, setSessionState] = useState<'idle' | 'connecting' | 'active'>('idle');
  const [time, setTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sessionState === 'active') {
      interval = setInterval(() => setTime((t) => t + 1), 1000);
    } else {
      setTime(0);
    }
    return () => clearInterval(interval);
  }, [sessionState]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSpeechChange = (isListening: boolean) => {
    if (isListening && sessionState === 'idle') {
      setSessionState('connecting');
      setTimeout(() => {
        setSessionState('active');
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => {});
        }
      }, 1500);
    } else if (!isListening) {
      endSession();
    }
  };

  const endSession = () => {
    setSessionState('idle');
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center relative z-20 lg:mt-0 mt-8">
      {/* audio: preload=none — only fetch when user clicks Start Speaking */}
      <audio ref={audioRef} src="/preview-e01.mp3" preload="none" />

      <div className="relative flex flex-col items-center w-full max-w-[320px]">
        {/* Anchor box */}
        <div className="w-6 h-6 border-2 border-[#202b20] bg-white rounded-none flex items-center justify-center shadow-[4px_4px_0_0_#202b20] relative z-30">
          <div className="w-2 h-2 rounded-none bg-[#202b20]" />
        </div>

        {/* Rope SVG */}
        <svg className="absolute top-[12px] left-1/2 overflow-visible pointer-events-none z-10" style={{ width: 2, height: 2 }}>
          <motion.line x1={0} y1={0} x2={dragX} y2={52} stroke="#202b20" strokeWidth="8" />
        </svg>

        {/* Draggable card */}
        <motion.div
          style={{ x: dragX, y: dragY, marginTop: '40px' }}
          drag
          dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
          dragElastic={0.6}
          whileDrag={{ scale: 1.05, rotate: 2, cursor: 'grabbing' }}
          whileHover={{ cursor: 'grab' }}
          className="w-full aspect-[4/5] bg-white border-2 border-[#202b20] shadow-[4px_4px_0_0_#202b20] rounded-none overflow-hidden relative flex flex-col p-6 items-center justify-between z-40"
        >
          {/* Drag handle */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center justify-center bg-[#ffa116] border-b-4 border-x-4 border-t-0 border-[#202b20] px-4 py-1 text-[11px] font-black uppercase tracking-widest text-[#202b20] pointer-events-none z-50">
            <GripHorizontal size={14} className="mr-1.5" /> move
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {/* ── IDLE ── */}
            {sessionState === 'idle' && (
              <motion.div
                key="idle"
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                className="flex flex-col items-center w-full h-full justify-between py-2"
              >
                <div className="text-center space-y-3 pt-2">
                  <h3 className="text-[26px] font-[300] tracking-tighter text-[#202b20]">Preview eO</h3>
                  <p
                    style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic' }}
                    className="text-[16px] text-[#202b20]/60 leading-snug"
                  >
                    our first most expressive<br />interview model
                  </p>
                  <p className="text-[14px] font-[500] text-[#202b20]/70 tracking-wide pt-2">I have a voice</p>
                </div>

                {/* Soundbar — pure CSS */}
                <style>{`
                  @keyframes bar{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.35)}}
                  .soundbar-bar{transform-origin:center;animation:bar 1.5s ease-in-out infinite;}
                `}</style>
                <div className="flex items-center justify-center gap-[6px] h-20 w-full my-auto">
                  {[8, 16, 40, 24, 48, 24, 40, 16, 8].map((h, i) => (
                    <div
                      key={i}
                      className="soundbar-bar w-[8px] rounded-full bg-[#202b20]"
                      style={{ height: `${h}px`, animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>

                <div className="w-full pb-2 px-2">
                  <button
                    onClick={() => handleSpeechChange(true)}
                    className="w-full h-[52px] flex items-center justify-center rounded-none border-2 border-[#202b20] bg-white text-[#202b20] hover:bg-[#ffa116] transition-all shadow-[4px_4px_0_0_#202b20] active:translate-y-[2px] active:translate-x-[2px] font-black uppercase tracking-widest"
                  >
                    Start speaking
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── CONNECTING ── */}
            {sessionState === 'connecting' && (
              <motion.div
                key="connecting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center w-full h-full gap-8"
              >
                <div className="flex-1 flex items-center justify-center relative w-full">
                  <style>{`
                    @keyframes spinCW{from{transform:rotate(0deg) scale(1)}to{transform:rotate(360deg) scale(1.4)}}
                    @keyframes spinCCW{from{transform:rotate(0deg) scale(1)}to{transform:rotate(-360deg) scale(1.8)}}
                    .spin-cw{animation:spinCW 3s ease-in-out infinite alternate;}
                    .spin-ccw{animation:spinCCW 3s 0.5s ease-in-out infinite alternate;}
                  `}</style>
                  <div className="w-24 h-24 bg-[#ffa116] border-2 border-[#202b20] absolute shadow-[4px_4px_0_0_#202b20]" />
                  <div className="spin-cw w-24 h-24 border-2 border-[#202b20] absolute" />
                  <div className="spin-ccw w-24 h-24 border-2 border-[#202b20] absolute" />
                </div>
                <div className="pb-8">
                  <p className="text-[#202b20] font-bold tracking-wide uppercase">connecting</p>
                </div>
              </motion.div>
            )}

            {/* ── ACTIVE ── */}
            {sessionState === 'active' && (
              <motion.div
                key="active"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-between w-full h-full"
              >
                <div className="flex-1 flex items-center justify-center relative w-full mt-12">
                  <style>{`
                    @keyframes spinL{to{transform:rotate(360deg)}}
                    @keyframes spinR{to{transform:rotate(-360deg)}}
                    .ring-slow{animation:spinL 10s linear infinite;}
                    .ring-fast{animation:spinR 8s linear infinite;}
                  `}</style>
                  <div className="ring-slow w-48 h-48 absolute border-2 border-dashed border-[#202b20]" />
                  <div className="ring-fast w-32 h-32 absolute border-2 border-dotted border-[#202b20] bg-[#ffa116]/10" />
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
    </div>
  );
}
