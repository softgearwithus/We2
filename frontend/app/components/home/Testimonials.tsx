'use client';

import { useState } from 'react';
import { CheckCircle2, Star, Linkedin } from 'lucide-react';

const testimonials = [
    {
        name: "Ayush",
        college: "EPAM Systems",
        role: "Production Engineer",
        initials: "A",
        color: "bg-slate-100 text-[#202b20]",
        rating: 5,
        text: "Skeptical at first since it's a new platform, but the industrial logic is 1:1 with reality - it actually taught me how to handle production bugs properly.",
        verified: true,
    },
    {
        name: "Neha Gupta",
        college: "NIT Kurukshetra",
        role: "Full Stack Student",
        initials: "NG",
        color: "bg-slate-100 text-[#202b20]",
        rating: 5,
        text: "The Job Simulation is different from any other platform. It doesn't just give you questions - it gives you a system to build. Definitely worth the transition.",
        verified: true,
    },
    {
        name: "Rohan",
        college: "TCS",
        role: "SDE",
        initials: "R",
        color: "bg-slate-100 text-[#202b20]",
        rating: 5,
        text: "Used this for my lateral move - the SQL Industry 50 questions were correlated perfectly with my interview rounds. A very genuine approach.",
        verified: true,
    },
    {
        name: "Pooja Sharma",
        college: "Infosys",
        role: "Associate Engineer",
        initials: "PS",
        color: "bg-slate-100 text-[#202b20]",
        rating: 5,
        text: "The AI Mentor is a lifesaver. It doesn't spoil the answer but guides you through the logic - helped me stay consistent even during college exams.",
        verified: true,
    },
    {
        name: "Vikram Kumar",
        college: "IIT Roorkee",
        role: "Final Year Student",
        initials: "VK",
        color: "bg-slate-100 text-[#202b20]",
        rating: 4,
        text: "Highly correlated content with what companies are actually asking right now. The platform is new so checking out the features took time, but content is solid.",
        verified: true,
    },
    {
        name: "Anjali",
        college: "HCLTech",
        role: "System Engineer",
        initials: "A",
        color: "bg-slate-100 text-[#202b20]",
        rating: 5,
        text: "The transition from student coding to industrial simulation was smooth. It's rare to find a platform that focuses so much on production standards.",
        verified: true,
    },
    {
        name: "Rahul",
        college: "SRM University",
        role: "CS Student",
        initials: "R",
        color: "bg-slate-100 text-[#202b20]",
        rating: 4,
        text: "The DSA pattern roadmap is much more focused than generic problem lists. It feels like a real curriculum designed to help you think like an engineer.",
        verified: true,
    },
    {
        name: "Megha Rao",
        college: "VIT Vellore",
        role: "Student",
        initials: "MR",
        color: "bg-slate-100 text-[#202b20]",
        rating: 5,
        text: "Started as a beta user - the platform is evolving, but the depth of coding playground features is very impressive for solving complex logic.",
        verified: true,
    },
    {
        name: "Kartik",
        college: "Wipro",
        role: "Developer",
        initials: "K",
        color: "bg-slate-100 text-[#202b20]",
        rating: 4,
        text: "Good correlation with actual industrial workflows. Removing specific name-branding makes it feel more like a professional training tool.",
        verified: true,
    }
];

import { Message, MessageContent } from "@/components/ai-elements/message";

const Card = ({ t }: { t: typeof testimonials[0] }) => (
    <Message from="assistant" className="w-full max-w-full bg-white border-2 border-[#202b20] p-5 rounded-none shadow-[4px_4px_0_0_#202b20] hover:shadow-[4px_4px_0_0_#ffa116] hover:-translate-y-1 transition-all duration-300">
        <div className="flex gap-4 w-full">
            {/* Avatar */}
            <div className={`shrink-0 w-12 h-12 rounded-none ${t.color} flex items-center justify-center font-[600] text-sm shadow-[2px_2px_0_0_#202b20] border-2 border-[#202b20]`}>
                {t.initials}
            </div>
            {/* Content */}
            <div className="flex flex-col w-full min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                        <h4 className="font-[600] text-[#202b20] text-[15px]">{t.name}</h4>
                        {t.verified && <CheckCircle2 size={16} className="text-[#ffa116] fill-[#202b20]" />}
                    </div>
                    <span className="hidden sm:inline text-[#202b20] font-bold">•</span>
                    <span className="text-xs text-[#202b20]/80 font-medium truncate">
                        {t.role} @ <span className="text-[#202b20] font-[600] bg-[#efeff1] px-1 border border-[#202b20]">{t.college}</span>
                    </span>
                </div>

                <MessageContent className="text-[#202b20] font-[500] text-[15px] leading-relaxed mb-4 group-[.is-assistant]:text-[#202b20]">
                    "{t.text}"
                </MessageContent>

                <div className="flex items-center justify-between mt-auto pt-3 border-t-2 border-[#202b20]">
                    <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                size={16}
                                className={`${i < t.rating ? 'stroke-[#202b20] fill-[#ffa116] stroke-2' : 'stroke-[#202b20] fill-[#efeff1] stroke-2'}`}
                            />
                        ))}
                    </div>
                    <a href="#" className="flex items-center justify-center w-8 h-8 rounded-none border-2 border-[#202b20] bg-white text-[#202b20] hover:bg-[#ffa116] transition-colors shadow-[2px_2px_0_0_#202b20]" aria-label={`View ${t.name}'s LinkedIn profile`}>
                        <Linkedin size={14} fill="currentColor" />
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
        <section className="py-24 lg:py-32 bg-transparent relative overflow-hidden border-t-2 border-[#202b20]">
            {/* Header */}
            <div className="max-w-7xl mx-auto px-6 mb-24 relative z-10 text-center">
                <h2 className="text-[2.5rem] md:text-[4rem] font-[800] tracking-tighter text-[#202b20] mb-6">
                    Offers dropped. <br className="md:hidden" /><span className="text-white bg-[#202b20] px-4 py-1 border-2 border-[#202b20] shadow-[4px_4px_0_0_#ffa116]">Lives changed.</span>
                </h2>
                <p className="text-lg md:text-xl text-[#202b20]/75 font-[500] max-w-2xl mx-auto leading-relaxed mt-4">
                    Stop practicing blindly. See what happens when you train like a senior engineer and finally beat the applicant tracking systems.
                </p>
            </div>

            {/* Platform Impact Stats Strip */}
            <div className="max-w-5xl mx-auto px-6 mb-20 relative z-10">
                <div className="bg-white border-2 border-[#202b20] shadow-[4px_4px_0_0_#202b20] rounded-none p-5 md:p-8 grid grid-cols-2 md:flex md:flex-row items-center justify-between md:divide-x-2 divide-[#202b20] gap-y-8 md:gap-0">

                    <div className="flex flex-col items-center justify-center w-full md:w-1/4 pb-4 md:pb-0">
                        <span className="text-3xl md:text-5xl font-[800] text-[#202b20] flex items-center gap-1.5 tracking-tighter">4.3 <Star className="w-5 h-5 md:w-8 md:h-8 stroke-[#202b20] fill-[#ffa116] stroke-2 -mt-1" /></span>
                        <span className="text-[10px] md:text-[11px] font-[600] text-[#202b20] uppercase tracking-widest mt-2 text-center">Average Rating</span>
                    </div>

                    <div className="flex flex-col items-center justify-center w-full md:w-1/4 pb-4 md:pb-0">
                        <span className="text-3xl md:text-5xl font-[800] tracking-tighter text-[#202b20]">400+</span>
                        <span className="text-[10px] md:text-[11px] font-[600] text-[#202b20] uppercase tracking-widest mt-2 text-center">Active Users</span>
                    </div>

                    <div className="flex flex-col items-center justify-center w-full md:w-1/4">
                        <span className="text-3xl md:text-5xl font-[800] tracking-tighter text-[#202b20]">110+</span>
                        <span className="text-[10px] md:text-[11px] font-[600] text-[#202b20] uppercase tracking-widest mt-2 text-center">Resumes Analysed</span>
                    </div>

                    <div className="flex flex-col items-center justify-center w-full md:w-1/4 relative group cursor-default">
                        <div className="hidden md:block absolute inset-0 bg-[#ffa116] scale-0 group-hover:scale-110 transition-transform duration-500 border-2 border-[#202b20]" />
                        <span className="text-3xl md:text-5xl font-[800] tracking-tighter text-[#202b20] relative z-10 group-hover:text-[#202b20] transition-colors">37</span>
                        <span className="text-[10px] md:text-[11px] font-[600] text-[#202b20] uppercase tracking-widest mt-2 text-center relative z-10">Interviews Conducted</span>
                    </div>

                </div>
            </div>

            {/* Conversation Grid Container */}
            <div className="max-w-5xl mx-auto px-6 relative z-10">
                <div className="mb-8 flex items-center gap-3 border-b-4 border-[#202b20] pb-4">
                    <div className="w-3 h-3 rounded-none bg-red-500 animate-pulse border-2 border-[#202b20]" />
                    <span className="text-sm font-[600] text-[#202b20] uppercase tracking-widest bg-[#efeff1] px-2 py-0.5 border-2 border-[#202b20]">Live Community Feedback</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pr-4 pb-4">
                    {testimonials.slice(0, 2).map((t, i) => {
                        const uniqueKey = `${t.name.replace(/\s+/g, '-')}-${i}`;
                        return <Card key={uniqueKey} t={t} />;
                    })}
                </div>

                <div className="mt-16 text-center">
                    <a
                        href="/reviews"
                        className="inline-flex items-center justify-center bg-white border-2 border-[#202b20] text-[#202b20] hover:bg-[#ffa116] px-8 py-4 rounded-none font-[600] text-[13px] tracking-widest uppercase transition-all shadow-[4px_4px_0_0_#202b20] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0_0_#202b20] gap-2"
                    >
                        Read all success stories
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="4" strokeLinecap="square" strokeLinejoin="miter" />
                        </svg>
                    </a>
                </div>
            </div>
        </section>
    );
}
