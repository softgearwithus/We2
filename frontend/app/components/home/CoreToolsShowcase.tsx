'use client';

import { motion } from "motion/react";
import { Layout, Server, Database, Briefcase } from "lucide-react";
import { PerspectiveCarousel } from "./PerspectiveCarousel";

export default function CoreToolsShowcase() {
  return (
    <section className="pt-20 pb-32 bg-background/50 relative overflow-hidden" id="features">
      {/* Smooth gradient transition to white at the bottom */}
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-b from-transparent to-white pointer-events-none z-0" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-[800] text-foreground tracking-tight mb-3 leading-tight">
            Free Core Tools for Placement Preparation
          </h2>
          <p className="text-base text-foreground/60 font-medium max-w-xl mx-auto">
            Your personal AI assistant integrates all the tools you need directly into your dashboard, making 100% free lifetime access feel premium.
          </p>
        </div>

        {/* 3D Core Tools Slideshow */}
        <div className="mb-16 w-full relative">
          <PerspectiveCarousel />
        </div>


      </div>
    </section>
  );
}
