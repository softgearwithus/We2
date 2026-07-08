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
    <Message from="assistant" className="w-full max-w-full bg-white border border-gray-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex gap-4 w-full">
            {/* Avatar */}
            <div className={`shrink-0 w-12 h-12 rounded-full ${t.color.replace('text-[#202b20]', 'text-gray-700').replace('bg-slate-100', 'bg-slate-50')} flex items-center justify-center font-[600] text-sm border border-gray-100`}>
                {t.initials}
            </div>
            {/* Content */}
            <div className="flex flex-col w-full min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-3">
                    <div className="flex items-center gap-1.5">
                        <h4 className="font-[600] text-gray-900 text-[15px]">{t.name}</h4>
                        {t.verified && <CheckCircle2 size={16} className="text-emerald-500" />}
                    </div>
                    <span className="hidden sm:inline text-gray-300 font-bold">•</span>
                    <span className="text-[13px] text-gray-500 font-[400] truncate">
                        {t.role} @ <span className="text-gray-700 font-[500]">{t.college}</span>
                    </span>
                </div>

                <MessageContent className="text-gray-600 font-[400] text-[15px] leading-relaxed mb-5 group-[.is-assistant]:text-gray-600">
                    "{t.text}"
                </MessageContent>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                    <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                size={14}
                                className={`${i < t.rating ? 'stroke-orange-400 fill-orange-400' : 'stroke-gray-200 fill-gray-200'}`}
                            />
                        ))}
                    </div>
                    <a href="#" className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-100 bg-slate-50 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors" aria-label={`View ${t.name}'s LinkedIn profile`}>
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
        <section className="py-16 bg-transparent relative overflow-hidden">
            {/* Header */}
            <div className="max-w-7xl mx-auto px-6 mb-12 relative z-10 text-center">
                <h2 className="text-[2.5rem] md:text-[4rem] font-[800] tracking-tighter text-black mb-4 leading-[1.05]">
                    Offers dropped. <br className="md:hidden" />
                    <span className="font-serif italic font-normal text-gray-400">Lives changed.</span>
                </h2>
                <p className="text-[18px] md:text-[20px] text-gray-500 font-[500] max-w-2xl mx-auto leading-relaxed mt-6">
                    Stop practicing blindly. See what happens when you train like a senior engineer and finally beat the applicant tracking systems.
                </p>
            </div>

            {/* Platform Impact Stats Strip */}
            <div className="max-w-5xl mx-auto px-6 mb-16 relative z-10">
                <div className="bg-slate-50/50 border border-gray-100 shadow-sm rounded-3xl p-6 md:p-8 grid grid-cols-2 md:flex md:flex-row items-center justify-between md:divide-x divide-gray-200 gap-y-8 md:gap-0">

                    <div className="flex flex-col items-center justify-center w-full md:w-1/4 pb-4 md:pb-0">
                        <span className="text-3xl md:text-5xl font-[800] text-gray-900 flex items-center gap-2 tracking-tighter">4.3 <Star className="w-5 h-5 md:w-8 md:h-8 stroke-orange-400 fill-orange-400 -mt-1" /></span>
                        <span className="text-[11px] font-[600] text-gray-400 uppercase tracking-widest mt-2 text-center">Average Rating</span>
                    </div>

                    <div className="flex flex-col items-center justify-center w-full md:w-1/4 pb-4 md:pb-0">
                        <span className="text-3xl md:text-5xl font-[800] tracking-tighter text-gray-900">400+</span>
                        <span className="text-[11px] font-[600] text-gray-400 uppercase tracking-widest mt-2 text-center">Active Users</span>
                    </div>

                    <div className="flex flex-col items-center justify-center w-full md:w-1/4">
                        <span className="text-3xl md:text-5xl font-[800] tracking-tighter text-gray-900">110+</span>
                        <span className="text-[11px] font-[600] text-gray-400 uppercase tracking-widest mt-2 text-center">Resumes Analysed</span>
                    </div>

                    <div className="flex flex-col items-center justify-center w-full md:w-1/4 relative group cursor-default">
                        <span className="text-3xl md:text-5xl font-[800] tracking-tighter text-gray-900 relative z-10 transition-colors">37</span>
                        <span className="text-[11px] font-[600] text-gray-400 uppercase tracking-widest mt-2 text-center relative z-10">Interviews Conducted</span>
                    </div>

                </div>
            </div>

            {/* Conversation Grid Container */}
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="mb-10 flex items-center gap-3 border-b border-gray-100 pb-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[12px] font-[600] text-gray-500 uppercase tracking-widest">Live Community Feedback</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pr-2 pb-4">
                    {testimonials.slice(0, 3).map((t, i) => {
                        const uniqueKey = `${t.name.replace(/\s+/g, '-')}-${i}`;
                        return <Card key={uniqueKey} t={t} />;
                    })}
                </div>

                <div className="mt-8 text-center">
                    <a
                        href="/reviews"
                        className="inline-flex items-center justify-center bg-white border border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-slate-50 px-8 py-4 rounded-full font-[500] text-[14px] transition-all shadow-sm hover:shadow-md gap-2"
                    >
                        Read all success stories
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </a>
                </div>
            </div>
        </section>
    );
}
