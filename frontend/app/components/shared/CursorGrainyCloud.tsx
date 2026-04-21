"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function CursorGrainyCloud() {
  const [mounted, setMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: -1000, y: -1000 });
  const [windowSize, setWindowSize] = useState({ w: 1000, h: 1000 });

  useEffect(() => {
    setMounted(true);
    setWindowSize({ w: window.innerWidth, h: window.innerHeight });
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const px = mousePosition.x - windowSize.w / 2;
  const py = mousePosition.y - windowSize.h / 2;

  // Seamless cloud SVG patterns
  const cloudBackLayer = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 400' preserveAspectRatio='none'%3E%3Cpath d='M0 400 L1200 400 L1200 200 Q1100 80 1000 180 Q850 40 700 150 Q550 50 400 170 Q250 80 100 180 Q50 120 0 200 Z' fill='%23e2e8f0' opacity='0.7'/%3E%3C/svg%3E`;
  const cloudFrontLayer = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 400' preserveAspectRatio='none'%3E%3Cpath d='M0 400 L1000 400 L1000 250 Q900 120 800 220 Q650 100 500 220 Q350 130 200 240 Q100 150 0 250 Z' fill='%23ffffff'/%3E%3C/svg%3E`;

  if (!mounted) return null;

  return (
    <>
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-gradient-to-b from-[#e0e7ff] via-[#f8f9fa] to-[#f8f9fa]">

        {/* Continuous Sky Clouds - Back Layer */}
        <motion.div
          className="absolute bottom-0 left-[-20vw] w-[140vw] h-[60vh] flex items-end"
          animate={{ x: px * -0.015, y: py * -0.015 }}
          transition={{ type: "tween", ease: "easeOut", duration: 1 }}
        >
          <div className="w-full h-full" style={{
            backgroundImage: `url("${cloudBackLayer}")`,
          backgroundRepeat: "repeat-x",
          backgroundSize: "800px 100%",
          backgroundPosition: "bottom"
          }} />
        </motion.div>

        {/* Continuous Sky Clouds - Front Layer */}
        <motion.div
          className="absolute bottom-0 left-[-20vw] w-[140vw] h-[45vh] flex items-end"
          animate={{ x: px * -0.03, y: py * -0.03 }}
          transition={{ type: "tween", ease: "easeOut", duration: 1 }}
        >
          <div className="w-full h-full" style={{
            backgroundImage: `url("${cloudFrontLayer}")`,
          backgroundRepeat: "repeat-x",
          backgroundSize: "1000px 100%",
          backgroundPosition: "bottom"
          }} />
        </motion.div>

      </div>

      {/* Cursor Following Cloud Aura */}
      <motion.div
        className="fixed top-0 left-0 w-[600px] h-[600px] rounded-full pointer-events-none z-0 mix-blend-multiply"
        animate={{
          x: mousePosition.x - 300,
          y: mousePosition.y - 300,
        }}
        transition={{
          type: "tween",
          ease: "easeOut",
          duration: 0.8,
        }}
        style={{
          background: "radial-gradient(circle, rgba(255, 161, 22, 0.15) 0%, rgba(255, 161, 22, 0) 70%)",
        }}
      />

      {/* Secondary darker aura for depth */}
      <motion.div
        className="fixed top-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none z-0 mix-blend-multiply"
        animate={{
          x: mousePosition.x - 200,
          y: mousePosition.y - 200,
        }}
        transition={{
          type: "tween",
          ease: "easeOut",
          duration: 0.3,
        }}
        style={{
          background: "radial-gradient(circle, rgba(32, 43, 32, 0.08) 0%, rgba(32, 43, 32, 0) 70%)",
        }}
      />

      {/* Global Grainy Noise Overlay - Gives the halftone/dithered effect over the clouds */}
      <div
        className="fixed inset-0 pointer-events-none z-10 opacity-[0.25]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </>
  );
}
