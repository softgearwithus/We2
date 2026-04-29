'use client';

import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { CheckCircle2, Star, Linkedin } from 'lucide-react';
import { Message, MessageContent } from "@/components/ai-elements/message";

const testimonials = [
    {
        name: "Ayush",
        college: "EPAM Systems",
        role: "Production Engineer",
        initials: "A",
        color: "bg-slate-100 text-slate-800",
        rating: 5,
        text: "Skeptical at first since it's a new platform, but the industrial logic is 1:1 with reality - it actually taught me how to handle production bugs properly.",
        verified: true,
    },
    {
        name: "Neha Gupta",
        college: "NIT Kurukshetra",
        role: "Full Stack Student",
        initials: "NG",
        color: "bg-slate-100 text-slate-800",
        rating: 5,
        text: "The Job Simulation is different from any other platform. It doesn't just give you questions - it gives you a system to build. Definitely worth the transition.",
        verified: true,
    },
    {
        name: "Rohan",
        college: "TCS",
        role: "SDE",
        initials: "R",
        color: "bg-slate-100 text-slate-800",
        rating: 5,
        text: "Used this for my lateral move - the SQL Industry 50 questions were correlated perfectly with my interview rounds. A very genuine approach.",
        verified: true,
    },
    {
        name: "Pooja Sharma",
        college: "Infosys",
        role: "Associate Engineer",
        initials: "PS",
        color: "bg-slate-100 text-slate-800",
        rating: 5,
        text: "The AI Mentor is a lifesaver. It doesn't spoil the answer but guides you through the logic - helped me stay consistent even during college exams.",
        verified: true,
    },
    {
        name: "Vikram Kumar",
        college: "IIT Roorkee",
        role: "Final Year Student",
        initials: "VK",
        color: "bg-slate-100 text-slate-800",
        rating: 4,
        text: "Highly correlated content with what companies are actually asking right now. The platform is new so checking out the features took time, but content is solid.",
        verified: true,
    },
    {
        name: "Anjali",
        college: "HCLTech",
        role: "System Engineer",
        initials: "A",
        color: "bg-slate-100 text-slate-800",
        rating: 5,
        text: "The transition from student coding to industrial simulation was smooth. It's rare to find a platform that focuses so much on production standards.",
        verified: true,
    },
    {
        name: "Rahul",
        college: "SRM University",
        role: "CS Student",
        initials: "R",
        color: "bg-slate-100 text-slate-800",
        rating: 4,
        text: "The DSA pattern roadmap is much more focused than generic problem lists. It feels like a real curriculum designed to help you think like an engineer.",
        verified: true,
    },
    {
        name: "Megha Rao",
        college: "VIT Vellore",
        role: "Student",
        initials: "MR",
        color: "bg-slate-100 text-slate-800",
        rating: 5,
        text: "Started as a beta user - the platform is evolving, but the depth of coding playground features is very impressive for solving complex logic.",
        verified: true,
    },
    {
        name: "Kartik",
        college: "Wipro",
        role: "Developer",
        initials: "K",
        color: "bg-slate-100 text-slate-800",
        rating: 4,
        text: "Good correlation with actual industrial workflows. Removing specific name-branding makes it feel more like a professional training tool.",
        verified: true,
    }
];

const Card = ({ t }: { t: typeof testimonials[0] }) => (
    <Message from="assistant" className="w-full max-w-full bg-white border-2 border-[#202b20] p-6 rounded-none shadow-[2px_2px_0px_0px_#202b20] hover:shadow-[2px_2px_0px_0px_#ffa116] hover:-translate-y-1 transition-all duration-300">
        <div className="flex gap-4 w-full">
            <div className={`shrink-0 w-12 h-12 rounded-none border-2 border-[#202b20] ${t.color} flex items-center justify-center font-bold text-sm bg-[#ffa116] text-[#202b20] shadow-[2px_2px_0px_0px_#202b20]`}>
                {t.initials}
            </div>
            <div className="flex flex-col w-full min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-slate-800 text-[15px]">{t.name}</h4>
                        {t.verified && <CheckCircle2 size={14} className="text-primary fill-primary/10" />}
                    </div>
                    <span className="hidden sm:inline text-slate-300">•</span>
                    <span className="text-xs text-slate-500 font-medium truncate">
                        {t.role} @ <span className="text-slate-700 font-semibold">{t.college}</span>
                    </span>
                </div>
                
                <MessageContent className="text-slate-600 text-[14px] leading-relaxed mb-4 group-[.is-assistant]:text-slate-600">
                    "{t.text}"
                </MessageContent>
                
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
                    <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                size={12}
                                className={`${i < t.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                            />
                        ))}
                    </div>
                    <a href="#" className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors" aria-label={`View ${t.name}'s LinkedIn profile`}>
                        <Linkedin size={12} fill="currentColor" />
                    </a>
                </div>
            </div>
        </div>
    </Message>
);

export default function ReviewsPage() {
  return (
    <div className="min-h-screen bg-[#efeff1] text-[#202b20] font-sans antialiased selection:bg-[#ffa116]/30 selection:text-[#202b20] relative flex flex-col pt-24">
      <Navbar />

      <div className="relative z-10 flex flex-col gap-12 sm:gap-16 pb-20">
        <div className="container mx-auto px-6 text-center max-w-3xl mt-12 mb-8">
            <h1 className="text-[3rem] md:text-[5rem] leading-[1.1] font-[800] tracking-tighter mb-6 text-[#202b20]">
                Success <span className="text-white bg-[#202b20] px-3 shadow-[2px_2px_0px_0px_#ffa116] block sm:inline-block mt-2 sm:mt-0">Stories</span>
            </h1>
            <p className="text-lg text-[#202b20]/70 font-[500] max-w-2xl mx-auto">Read firsthand how Emble has transformed the interview preparation process and changed careers.</p>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonials.map((t, i) => {
                    const uniqueKey = `${t.name.replace(/\s+/g, '-')}-${i}`;
                    return <Card key={uniqueKey} t={t} />;
                })}
            </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
