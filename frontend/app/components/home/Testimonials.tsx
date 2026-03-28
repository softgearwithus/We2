'use client';

import { useState } from 'react';
import { CheckCircle2, Star, Linkedin } from 'lucide-react';

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

import { Message, MessageContent } from "@/components/ai-elements/message";

const Card = ({ t }: { t: typeof testimonials[0] }) => (
    <Message from="assistant" className="w-full max-w-full bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-500/30 transition-all duration-300">
        <div className="flex gap-4 w-full">
            {/* Avatar */}
            <div className={`shrink-0 w-12 h-12 rounded-full ${t.color} flex items-center justify-center font-bold text-sm shadow-sm border border-slate-200`}>
                {t.initials}
            </div>
            {/* Content */}
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

export default function Testimonials() {
    const [showAll, setShowAll] = useState(false);
    const displayedTestimonials = showAll ? testimonials : testimonials.slice(0, 8); // Slice 8 for even 2-column

    return (
        <section className="py-12 md:py-24 bg-transparent relative overflow-hidden border-t border-border/30">
            {/* Header */}
            <div className="max-w-7xl mx-auto px-6 mb-16 relative z-10 text-center">
                <h2 className="text-4xl md:text-6xl font-[1000] text-foreground tracking-tighter mb-4">
                    Offers dropped. <span className="text-primary">Lives changed.</span>
                </h2>
                <p className="text-xl text-foreground/70 font-medium max-w-2xl mx-auto leading-relaxed">
                    Stop practicing blindly. See what happens when you train like a senior engineer and finally beat the applicant tracking systems.
                </p>
            </div>

            {/* AI Elements - Conversational Stats */}
            <div className="max-w-4xl mx-auto px-6 mb-24 relative z-10">
                <div className="flex flex-col gap-6">
                    <Message from="user">
                        <MessageContent>
                            What's the latest platform impact for Emble learners?
                        </MessageContent>
                    </Message>
                    
                    <Message from="assistant" className="bg-white border-slate-200 border shadow-md p-2">
                        <MessageContent>
                            <div className="space-y-4 pt-1">
                                <p className="text-slate-600 font-medium">
                                    We've been scaling rapidly. Here are the latest numbers generated from our systems:
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-2">
                                    <div className="flex flex-col justify-center bg-slate-50 border border-slate-100 rounded-xl p-4 md:p-5">
                                        <span className="text-3xl font-black text-slate-800 flex items-center gap-1.5">4.3 <Star className="w-6 h-6 text-amber-400 fill-amber-400" /></span>
                                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">Average Rating</span>
                                    </div>
                                    <div className="flex flex-col justify-center bg-slate-50 border border-slate-100 rounded-xl p-4 md:p-5">
                                        <span className="text-3xl font-black text-slate-800">400+</span>
                                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">Active Users</span>
                                    </div>
                                    <div className="flex flex-col justify-center bg-slate-50 border border-slate-100 rounded-xl p-4 md:p-5">
                                        <span className="text-3xl font-black text-slate-800">110</span>
                                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">Resumes Analysed</span>
                                    </div>
                                    <div className="flex flex-col justify-center bg-white border border-primary rounded-xl p-4 md:p-5 relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-primary/5 scale-0 group-hover:scale-150 transition-transform duration-500 rounded-full" />
                                        <span className="text-3xl font-black text-foreground relative z-10">37</span>
                                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-1 relative z-10">Interviews Conducted</span>
                                    </div>
                                </div>
                            </div>
                        </MessageContent>
                    </Message>
                </div>
            </div>

            {/* Conversation Grid Container */}
            <div className="max-w-5xl mx-auto px-6 relative z-10">
                <div className="mb-8 flex items-center gap-3 border-b border-border/50 pb-4">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Live Community Feedback</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {displayedTestimonials.map((t, i) => {
                        const uniqueKey = `${t.name.replace(/\s+/g, '-')}-${i}`;
                        
                        if (!showAll && i === 7) {
                            return (
                                <div key={uniqueKey} className="group relative w-full h-full transform-gpu will-change-transform cursor-pointer" onClick={() => setShowAll(true)}>
                                    <div className="absolute inset-0 z-20 bg-background/50 backdrop-blur-[3px] rounded-[1rem] flex flex-col items-center justify-center transition-all duration-300 group-hover:bg-background/20 border border-border overflow-hidden">
                                        <div className="bg-white text-foreground border border-primary px-6 py-3 rounded-full font-bold shadow-2xl group-hover:scale-105 transition-transform flex items-center gap-2">
                                            View {testimonials.length - 7} More Stories →
                                        </div>
                                    </div>
                                    <div className="relative z-10 opacity-60 pointer-events-none h-full">
                                        <Card t={t} />
                                    </div>
                                </div>
                            );
                        }
                        return <Card key={uniqueKey} t={t} />;
                    })}
                </div>

                {showAll && (
                    <div className="mt-16 text-center">
                        <button 
                            onClick={() => setShowAll(false)}
                            className="bg-card border border-border text-foreground/70 hover:text-foreground hover:border-primary/50 px-8 py-3 rounded-full font-bold text-sm tracking-wider uppercase transition-all shadow-sm"
                        >
                            Collapse Feed
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
