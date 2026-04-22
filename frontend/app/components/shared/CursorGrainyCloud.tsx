"use client";

import { useEffect, useRef } from "react";

/**
 * Lightweight cursor aura — uses a single RAF loop + CSS custom properties.
 * Zero React state updates on mousemove → no re-renders, no layout thrash.
 * The cloud backdrop is pure CSS gradient (no animated SVG layers).
 */
export default function CursorGrainyCloud() {
  const auraRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const targetRef = useRef({ x: -600, y: -600 });
  const currentRef = useRef({ x: -600, y: -600 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Lerp loop — smooth follow without React setState
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const loop = () => {
      currentRef.current.x = lerp(currentRef.current.x, targetRef.current.x, 0.08);
      currentRef.current.y = lerp(currentRef.current.y, targetRef.current.y, 0.08);
      if (auraRef.current) {
        auraRef.current.style.transform = `translate(${currentRef.current.x - 200}px, ${currentRef.current.y - 200}px)`;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>

      {/* Subtle cloud shapes — pure CSS, static, zero JS */}
      <div
        className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute bottom-0 left-0 right-0 h-[55vh]"
          style={{
            background: "linear-gradient(to top, #ffffff 30%, transparent 100%)",
          }}
        />
        <div
          className="absolute bottom-[10%] left-[-5%] w-[55%] h-[35%] rounded-[60%_40%_70%_30%]"
          style={{
            background: "rgba(255,255,255,0.7)",
            filter: "blur(40px)",
          }}
        />
        <div
          className="absolute bottom-[5%] right-[-5%] w-[50%] h-[30%] rounded-[40%_60%_30%_70%]"
          style={{
            background: "rgba(255,255,255,0.6)",
            filter: "blur(50px)",
          }}
        />
      </div>

      {/* Cursor aura — GPU-composited via transform only, no layout */}
      <div
        ref={auraRef}
        className="fixed top-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none z-0 will-change-transform"
        style={{
          background: "radial-gradient(circle, rgba(255,161,22,0.12) 0%, rgba(255,161,22,0) 70%)",
          transform: "translate(-600px, -600px)", // start offscreen
        }}
      />

      {/* Grain noise overlay — static SVG, no JS */}
      <div
        className="fixed inset-0 pointer-events-none z-[1] opacity-[0.18]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
    </>
  );
}
