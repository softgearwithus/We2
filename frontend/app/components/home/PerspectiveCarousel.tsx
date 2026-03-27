'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Variants, type Transition } from 'motion/react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const slideImages = [
  '/slideshow/a1.png',
  '/slideshow/a2.png',
  '/slideshow/a3.png',
  '/slideshow/a4.png',
  '/slideshow/a5.png',
  '/slideshow/a6.png',
];

const features = [
  {
    title: "Company Patterns",
    subtitle: "Company-Wise Mock Tests",
    description: "Targeted mock tests mirroring the exact interviews of top-tier firms. Practice previous year questions (PYQs) and the most asked patterns."
  },
  {
    title: "AI Test Series",
    subtitle: "Role-Based Mock Exams",
    description: "Generate highly specific, company-wise mock exams. Practice the exact patterns before stepping into the real online assessment."
  },
  {
    title: "Guided Project Labs",
    subtitle: "Industry-Grade Architecture",
    description: "Stop building generic clones. Access top industry-grade projects separated by tech-stacks to make your resume impossible to reject."
  },
  {
    title: "Mock Interview Simulation",
    subtitle: "AI-Powered Assessment Suite",
    description: "Refine your communication and behavioral skills. Focus on vocal delivery, body language, and confidence with instant AI feedback."
  },
  {
    title: "Parallel Applications",
    subtitle: "That Run End-to-End",
    description: "Let AI handle the tedious form-filling and cover letter generation across dozens of portals simultaneously in the background."
  },
  {
    title: "Predictive Market Alerts",
    subtitle: "Real-time Opportunities",
    description: "Your AI agent monitors thousands of job boards and insider pipelines, pinging you instantly when sudden hiring drives open up."
  }
];

export function PerspectiveCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slideImages.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slideImages.length) % slideImages.length);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  const getVariant = (index: number) => {
    const diff = (index - currentIndex + slideImages.length) % slideImages.length;
    
    if (diff === 0) return 'active';
    if (diff === 1) return 'next';
    if (diff === slideImages.length - 1) return 'prev';
    return 'hidden';
  };

  const transitionConfig: Transition = {
    type: "spring",
    stiffness: 260,
    damping: 25,
    mass: 1
  };

  const variants: Variants = {
    active: {
      x: 0,
      scale: 1,
      rotateY: 0,
      zIndex: 30,
      opacity: 1,
      transition: transitionConfig
    },
    next: {
      x: '40%',
      scale: 0.9,
      rotateY: -15,
      zIndex: 20,
      opacity: 0.8,
      transition: transitionConfig
    },
    prev: {
      x: '-40%',
      scale: 0.9,
      rotateY: 15,
      zIndex: 20,
      opacity: 0.8,
      transition: transitionConfig
    },
    hidden: {
      x: 0,
      scale: 0.6,
      rotateY: 0,
      zIndex: 0,
      opacity: 0,
      transition: transitionConfig
    }
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto flex flex-col items-center justify-center py-6 sm:py-12">
      
      {/* Desktop 3D View */}
      <div className="hidden md:flex flex-col w-full items-center justify-center">
        <div 
          className="relative w-full px-4 sm:px-12 flex justify-center items-center" 
          style={{ perspective: '1200px' }}
        >
          <button 
            onClick={prevSlide}
            className="absolute left-0 sm:-left-4 z-40 p-2 sm:p-3 rounded-full bg-background/80 border border-border text-foreground shadow-lg hover:bg-background hover:scale-105 transition-all hidden sm:block"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Carousel Container */}
          <div className="relative w-full max-w-[1000px] aspect-[4/3] sm:aspect-[16/10] mx-auto">
            {slideImages.map((src, index) => {
              const variant = getVariant(index);
              const isActive = variant === 'active';

              return (
                <motion.div
                  key={index}
                  variants={variants}
                  initial={false}
                  animate={variant}
                  className={cn(
                    "absolute top-0 left-0 w-full h-full rounded-[24px] overflow-hidden shadow-2xl border border-border/40 bg-card will-change-transform",
                    isActive ? "cursor-default ring-1 ring-primary/20" : "cursor-pointer hover:border-primary/50"
                  )}
                  onClick={() => {
                    if (!isActive && variant !== 'hidden') {
                      setCurrentIndex(index);
                    }
                  }}
                >
                  <div className="w-full h-8 bg-muted border-b border-border/40 flex items-center px-4 gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-destructive/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    </div>
                    <div className="flex-1 flex justify-center">
                      <div className="h-4 w-32 bg-background/50 rounded flex items-center justify-center text-[10px] text-muted-foreground font-medium">Free Core Tools</div>
                    </div>
                  </div>
                  <img 
                    src={src} 
                    alt={`Core Tool ${index + 1}`} 
                    className="w-full h-[calc(100%-32px)] object-cover object-top"
                  />
                  
                  {!isActive && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-background/30 pointer-events-none" 
                    />
                  )}
                </motion.div>
              );
            })}
          </div>

          <button 
            onClick={nextSlide}
            className="absolute right-0 sm:-right-4 z-40 p-2 sm:p-3 rounded-full bg-background/80 border border-border text-foreground shadow-lg hover:bg-background hover:scale-105 transition-all hidden sm:block"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Slide Indicators */}
        <div className="flex gap-2.5 mt-8 z-30 mb-8 sm:mb-12">
          {slideImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                "h-2 rounded-full transition-all duration-500",
                idx === currentIndex ? "w-8 bg-primary" : "w-2 bg-primary/20 hover:bg-primary/40"
              )}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Dynamic Feature Text */}
        <div className="w-full relative h-[140px] flex items-start justify-center text-center px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute flex flex-col items-center max-w-2xl"
            >
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-2 sm:mb-3">
                {features[currentIndex].title}
              </h3>
              <h4 className="text-lg sm:text-xl md:text-2xl text-primary font-medium mb-3 sm:mb-4">
                {features[currentIndex].subtitle}
              </h4>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
                {features[currentIndex].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Stacked View */}
      <div className="flex md:hidden flex-col w-full gap-24 pt-4">
        {features.map((feature, idx) => (
          <div key={idx} className="flex flex-col w-full gap-6 px-2">
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-primary uppercase tracking-widest mb-3">
                {feature.subtitle}
              </span>
              <h3 className="text-3xl font-[800] text-foreground tracking-tight mb-4 leading-tight">
                {feature.title}
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed max-w-sm">
                {feature.description}
              </p>
            </div>
            
            <div className="w-full rounded-[24px] overflow-hidden shadow-2xl border border-border/40 bg-card">
              <div className="w-full h-8 bg-muted border-b border-border/40 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-destructive/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 flex justify-center opacity-50">
                  <div className="h-4 w-24 bg-background/50 rounded flex items-center justify-center text-[9px] text-muted-foreground font-medium truncate px-2">
                    {feature.title}
                  </div>
                </div>
              </div>
              <img 
                src={slideImages[idx]} 
                alt={feature.title} 
                className="w-full h-auto object-cover object-top"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
