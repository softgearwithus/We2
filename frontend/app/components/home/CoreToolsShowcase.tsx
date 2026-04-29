'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const tools = [
  {
    image: "/slideshow/a1.png",
    title: "Company Patterns",
    subtitle: "Highly Specific Assessments",
    description: "Generate highly specific, company-wise mock exams. Practice the exact patterns before stepping into the real online assessment."
  },
  {
    image: "/slideshow/a2.png",
    title: "AI Test Series Simulator",
    subtitle: "End-to-End Testing Environment",
    description: "Experience the pressure of real online assessments. Practice in a timed, closely simulated environment to maximize your test scores."
  },
  {
    image: "/slideshow/a3.png",
    title: "Project Labs",
    subtitle: "Build Real-World Applications",
    description: "Boost your portfolio with hands-on labs. Select your domain—Backend, Frontend, Data & AI, or Mobile—and start building."
  },
  {
    image: "/slideshow/a4.png",
    title: "Live Tech Interview",
    subtitle: "Real-Time AI Simulation Lab",
    description: "Conduct full mock interviews with eO. Face our AI avatar in a realistic environment and get feedback on logic and confidence."
  }
];

export default function CoreToolsShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextSlide = () => setActiveIndex((prev) => (prev + 1) % tools.length);
  const prevSlide = () => setActiveIndex((prev) => (prev - 1 + tools.length) % tools.length);

  // Auto-play
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % tools.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const getCardProps = (index: number) => {
    const diff = (index - activeIndex + tools.length) % tools.length;
    
    // We only display basically active, prev (diff = tools.length -1), and next (diff = 1) clearly
    let offset = 0;
    let scale = 1;
    let rotateY = 0;
    let zIndex = 0;
    let opacity = 0;

    if (diff === 0) {
      // Active center
      offset = 0;
      scale = 1;
      rotateY = 0;
      zIndex = 30;
      opacity = 1;
    } else if (diff === 1 || diff === tools.length - 1) {
      // Immediate neighbors
      const isNext = diff === 1;
      offset = isNext ? 35 : -35; 
      scale = 0.8;
      rotateY = isNext ? -15 : 15;
      zIndex = 20;
      opacity = 0.6;
    } else {
      // Further out hidden
      const isNext = diff < tools.length / 2;
      offset = isNext ? 0 : 0;
      scale = 0.6;
      rotateY = isNext ? 0 : 0;
      zIndex = 10;
      opacity = 0;
    }

    return {
      x: `calc(-50% + ${offset}%)`,
      y: "-50%",
      scale,
      rotateY,
      zIndex,
      opacity,
      pointerEvents: diff === 0 ? "auto" as const : "none" as const,
      diff
    };
  };

  return (
    <section className="pt-24 pb-32 bg-[#efeff1] relative overflow-hidden" id="free-tools">
      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        
        {/* Section Header */}
        <div className="mb-12 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[3rem] md:text-[4.5rem] leading-[1.1] font-[800] tracking-tighter text-[#202b20] mb-5"
          >
            Free <span className="text-white bg-[#202b20] px-3 shadow-[2px_2px_0_0_#ffa116] block sm:inline-block mt-2 sm:mt-0">Core Tools</span> for Interview Preparation
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-[#202b20]/80 font-[500] max-w-2xl mx-auto leading-relaxed"
          >
            Your personal AI assistant integrates all the tools you need directly into your dashboard, making 100% free lifetime access feel premium.
          </motion.p>
        </div>

        {/* 3D Carousel Container */}
        <div 
          className="relative w-full max-w-6xl mx-auto h-[450px] sm:h-[550px] md:h-[650px] lg:h-[750px] flex items-center justify-center group/carousel"
          style={{ perspective: "1500px" }}
        >
          {/* Navigation Arrows */}
          <button 
            onClick={prevSlide}
            className="absolute left-0 md:left-6 z-40 bg-[#ffa116] border-2 border-[#202b20] p-3 md:p-4 rounded-none shadow-[2px_2px_0_0_#202b20] opacity-0 translate-x-4 group-hover/carousel:translate-x-0 group-hover/carousel:opacity-100 hover:shadow-[2px_2px_0_0_#202b20] hover:translate-y-[2px] transition-all duration-300"
            aria-label="Previous slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-[#202b20]"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          
          <button 
            onClick={nextSlide}
            className="absolute right-0 md:right-6 z-40 bg-[#ffa116] border-2 border-[#202b20] p-3 md:p-4 rounded-none shadow-[2px_2px_0_0_#202b20] opacity-0 -translate-x-4 group-hover/carousel:translate-x-0 group-hover/carousel:opacity-100 hover:shadow-[2px_2px_0_0_#202b20] hover:translate-y-[2px] transition-all duration-300"
            aria-label="Next slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-[#202b20]"><path d="m9 18 6-6-6-6"/></svg>
          </button>

          {tools.map((tool, i) => {
            const props = getCardProps(i);
            
            return (
              <motion.div
                key={i}
                initial={false}
                animate={{
                  x: props.x,
                  y: props.y,
                  scale: props.scale,
                  rotateY: props.rotateY,
                  zIndex: props.zIndex,
                  opacity: props.opacity
                }}
                transition={{ type: "spring", stiffness: 260, damping: 30, mass: 1.2 }}
                className="absolute left-1/2 top-1/2 w-[85%] md:w-[75%] max-w-[950px] overflow-visible cursor-pointer"
                onClick={() => setActiveIndex(i)}
                style={{ pointerEvents: props.pointerEvents }}
              >
                {/* Image Container with Dynamic Border */}
                 <div className={`relative w-full pb-[60%] bg-white rounded-none transition-all duration-300 ${props.diff === 0 ? 'border-2 border-[#202b20] shadow-[2px_2px_0_0_#202b20]' : 'border-2 border-[#202b20]/50 shadow-[2px_2px_0px_0px_rgba(32,43,32,0.2)]'}`}>
                    <img 
                      src={tool.image} 
                      alt={tool.title} 
                      className="absolute inset-0 w-full h-full object-contain p-4 md:p-8 rounded-none"
                    />
                 </div>
              </motion.div>
            );
          })}
        </div>

        {/* Carousel Pagination Dots */}
        <div className="flex justify-center items-center gap-2 mt-4 mb-4 md:mt-8 md:mb-6">
          {tools.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`h-2 border border-[#202b20] rounded-none transition-all duration-300 ${i === activeIndex ? "w-6 bg-[#202b20]" : "w-2 bg-white hover:bg-[#ffa116]"}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Synchronized Descriptions */}
        <div 
          className="text-center max-w-2xl mx-auto min-h-[140px] cursor-pointer group"
          onClick={nextSlide}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="bg-transparent rounded-none p-4 md:p-0 transition-colors duration-300"
            >
              <p className="text-[#202b20]/60 font-bold uppercase tracking-widest text-[11px] mb-3">
                 {tools[activeIndex].subtitle}
              </p>
              <h3 className="text-3xl md:text-4xl font-[800] text-[#202b20] mb-4 tracking-tighter inline-flex items-center">
                {tools[activeIndex].title}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="ml-3 w-8 h-8 p-1.5 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 bg-[#202b20] text-[#ffa116] border-2 border-[#202b20] shadow-[2px_2px_0_0_#ffa116]"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </h3>
              <p className="text-[#202b20]/80 font-[500] leading-relaxed max-w-xl mx-auto text-[16px]">
                {tools[activeIndex].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
