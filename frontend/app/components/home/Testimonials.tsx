'use client';

import { useState } from 'react';
import { CheckCircle2, Star } from 'lucide-react';

const testimonials = [
    {
        name: "Ayush",
        role: "Production Engineer @ EPAM Systems",
        initials: "A",
        color: "bg-blue-500",
        rating: 4.5,
        text: "Skeptical at first since it's a new platform, but the industrial logic is 1:1 with reality - it actually taught me how to handle production bugs properly.",
        verified: true,
        gradient: "from-blue-50 to-blue-100/50"
    },
    {
        name: "Neha Gupta",
        role: "Full Stack Student",
        initials: "NG",
        color: "bg-slate-500",
        rating: 4.2,
        text: "The Job Simulation is different from any other platform. It doesn't just give you questions - it gives you a system to build. Definitely worth the transition.",
        verified: false,
        gradient: "from-slate-50 to-slate-100/50"
    },
    {
        name: "Rohan",
        role: "SDE @ TCS",
        initials: "R",
        color: "bg-orange-500",
        rating: 4.7,
        text: "Used this for my lateral move - the SQL Industry 50 questions were correlated perfectly with my interview rounds. A very genuine approach.",
        verified: true,
        gradient: "from-orange-50 to-orange-100/50"
    },
    {
        name: "Pooja Sharma",
        role: "Associate Engineer @ Infosys",
        initials: "PS",
        color: "bg-slate-500",
        rating: 4.6,
        text: "The AI Mentor is a lifesaver. It doesn't spoil the answer but guides you through the logic - helped me stay consistent even during college exams.",
        verified: true,
        gradient: "from-slate-50 to-slate-100/50"
    },
    {
        name: "Vikram Kumar",
        role: "Final Year Student",
        initials: "VK",
        color: "bg-emerald-500",
        rating: 3.9,
        text: "Highly correlated content with what companies are actually asking right now. The platform is new so checking out the features took time, but content is solid.",
        verified: false,
        gradient: "from-emerald-50 to-emerald-100/50"
    },
    {
        name: "Anjali",
        role: "System Engineer @ HCLTech",
        initials: "A",
        color: "bg-pink-500",
        rating: 4.4,
        text: "The transition from student coding to industrial simulation was smooth. It's rare to find a platform that focuses so much on production standards.",
        verified: true,
        gradient: "from-pink-50 to-pink-100/50"
    },
    {
        name: "Rahul",
        role: "CS Student @ SRM",
        initials: "R",
        color: "bg-cyan-500",
        rating: 4.1,
        text: "The DSA pattern roadmap is much more focused than generic problem lists. It feels like a real curriculum designed to help you think like an engineer.",
        verified: false,
        gradient: "from-cyan-50 to-cyan-100/50"
    },
    {
        name: "Megha Rao",
        role: "Student @ VIT",
        initials: "MR",
        color: "bg-amber-500",
        rating: 4.3,
        text: "Started as a beta user - the platform is evolving, but the depth of coding playground features is very impressive for solving complex logic.",
        verified: false,
        gradient: "from-amber-50 to-amber-100/50"
    },
    {
        name: "Kartik",
        role: "Developer @ Wipro",
        initials: "K",
        color: "bg-blue-600",
        rating: 4.0,
        text: "Good correlation with actual industrial workflows. Removing specific name-branding makes it feel more like a professional training tool.",
        verified: true,
        gradient: "from-blue-50 to-blue-200/50"
    },
    {
        name: "Siddharth Jain",
        role: "Full Stack Student",
        initials: "SJ",
        color: "bg-rose-500",
        rating: 4.7,
        text: "The 21-day sprint is intense. It's not academic - it's purely professional. You're building features that feel like real tech stack tickets.",
        verified: false,
        gradient: "from-rose-50 to-rose-100/50"
    },
    {
        name: "Priyanka",
        role: "Automation Engineer @ EPAM",
        initials: "P",
        color: "bg-teal-500",
        rating: 4.5,
        text: "Placement rounds are mostly about hidden logic patterns. This platform exposes those patterns very early in the training.",
        verified: true,
        gradient: "from-teal-50 to-teal-100/50"
    },
    {
        name: "Abhishek",
        role: "Student @ KIIT",
        initials: "A",
        color: "bg-violet-500",
        rating: 4.2,
        text: "The AI debugger is actually useful. It explains the 'Why' instead of just fixing the code - helping me understand system design better.",
        verified: false,
        gradient: "from-violet-50 to-violet-100/50"
    },
    {
        name: "Ishita",
        role: "Frontend Student",
        initials: "I",
        color: "bg-orange-600",
        rating: 4.3,
        text: "The interface is very modern and fast. Even though it's new, the content for React and NestJS is very deep and industrial.",
        verified: false,
        gradient: "from-orange-50 to-orange-200/50"
    },
    {
        name: "Varun Sharma",
        role: "Backend Dev @ TCS",
        initials: "VS",
        color: "bg-slate-800",
        rating: 4.6,
        text: "System design simulations are spot on. I used the exact same patterns in my onsite migration project. Highly correlated stuff.",
        verified: true,
        gradient: "from-slate-50 to-slate-200/50"
    },
    {
        name: "Sneha",
        role: "Final Year @ Amity",
        initials: "S",
        color: "bg-emerald-600",
        rating: 3.9,
        text: "Platform took some time to get used to because of the AI integrations, but now I can't go back to normal coding editors.",
        verified: false,
        gradient: "from-emerald-50 to-emerald-200/50"
    },
    {
        name: "Manish",
        role: "Placement Prep Student",
        initials: "M",
        color: "bg-amber-600",
        rating: 4.4,
        text: "The Skill Scorecard is a reality check. It shows exactly where your logic is weak - very helpful for targeted preparation.",
        verified: false,
        gradient: "from-amber-50 to-amber-200/50"
    },
    {
        name: "Aditi Gupta",
        role: "Student @ MU",
        initials: "AG",
        color: "bg-pink-600",
        rating: 4.1,
        text: "Best part is the 24/7 AI support. I can practice deep logic late at night and still get progressive hints when I'm stuck.",
        verified: false,
        gradient: "from-pink-50 to-pink-200/50"
    },
    {
        name: "Harsh",
        role: "Student @ IPU",
        initials: "H",
        color: "bg-cyan-600",
        rating: 4.5,
        text: "Correlated 1:1 with modern MNC rounds. If you finish the 200+ patterns here, you are ready for any technical interview.",
        verified: false,
        gradient: "from-cyan-50 to-cyan-200/50"
    },
    {
        name: "Deepak Rawat",
        role: "Analyst @ Infosys",
        initials: "DR",
        color: "bg-violet-600",
        rating: 4.2,
        text: "Grounded and realistic training. No hype - just pure industrial simulations that actually help you perform on day 1 of the job.",
        verified: true,
        gradient: "from-violet-50 to-violet-200/50"
    },
    {
        name: "Kavya",
        role: "Student @ BITS",
        initials: "K",
        color: "bg-rose-600",
        rating: 4.7,
        text: "As India's First Integrated AI Placement Ecosystem Hub, the tech depth is incredible. Building microservices with real-time AI feedback is a game changer.",
        verified: false,
        gradient: "from-rose-50 to-rose-200/50"
    },
    {
        name: "Ritvik",
        role: "Software Student",
        initials: "R",
        color: "bg-blue-700",
        rating: 3.9,
        text: "Slight learning curve for the environment, but the industrial logic for Docker and AWS is something no one else is teaching properly.",
        verified: false,
        gradient: "from-blue-50 to-blue-300/50"
    },
    {
        name: "Sanya Roy",
        role: "Placement Ready Student",
        initials: "SR",
        color: "bg-slate-900",
        rating: 4.4,
        text: "The SQL 50 set is brutal but necessary. It transformed my query optimization logic entirely for the placement season.",
        verified: false,
        gradient: "from-slate-50 to-slate-200/50"
    },
    {
        name: "Amit",
        role: "Student @ Tier-2",
        initials: "A",
        color: "bg-orange-700",
        rating: 4.1,
        text: "Genuine platform for genuine students. The content is huge and very detailed - it's like a complete industrial bootcamp.",
        verified: false,
        gradient: "from-orange-50 to-orange-300/50"
    },
    {
        name: "Pooja",
        role: "Full Stack Student",
        initials: "P",
        color: "bg-slate-900",
        rating: 4.6,
        text: "The industrial sprint projects are high quality. You actually build stuff that you can talk about confidently in interviews.",
        verified: false,
        gradient: "from-slate-50 to-slate-300/50"
    },
    {
        name: "Rishi",
        role: "Student @ PES",
        initials: "R",
        color: "bg-emerald-700",
        rating: 4.3,
        text: "Great correlation between curriculum and industry needs. The AI Mentor makes sure you don't just copy-paste solutions.",
        verified: false,
        gradient: "from-emerald-50 to-emerald-300/50"
    }
];

const Card = ({ t }: { t: typeof testimonials[0] }) => (
    <div className="group relative w-full h-full transform-gpu will-change-transform">
        <div className="relative h-full bg-card rounded-[1.8rem] p-8 border border-border/50 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300 flex flex-col justify-between">
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full ${t.color} flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                            {t.initials}
                        </div>
                        <div>
                            <h4 className="font-bold text-foreground text-sm">{t.name}</h4>
                            <p className="text-[10px] text-foreground/60 font-bold uppercase tracking-wider">{t.role}</p>
                        </div>
                    </div>
                    {t.verified && <CheckCircle2 size={18} className="text-primary fill-primary/10" />}
                </div>

                <p className="text-foreground/80 text-[15px] leading-relaxed font-medium">"{t.text}"</p>
            </div>

            <div className="pt-4 border-t border-border/30 flex items-center justify-between mt-auto">
                <div className="flex gap-0.5 items-center">
                    <div className="flex gap-0.5 mr-2">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                size={12}
                                className={`${i < Math.floor(t.rating) ? 'text-[#FFD700] fill-[#FFD700]' : 'text-border'}`}
                            />
                        ))}
                    </div>
                    <span className="text-[11px] font-bold text-foreground/60">{t.rating}</span>
                </div>
            </div>
        </div>
    </div>
);

export default function Testimonials() {
    const [showAll, setShowAll] = useState(false);
    const displayedTestimonials = showAll ? testimonials : testimonials.slice(0, 9);

    return (
        <section className="py-12 md:py-24 bg-transparent relative overflow-hidden border-t border-border/30">
            {/* Header */}
            <div className="max-w-7xl mx-auto px-6 mb-16 relative z-10 text-center">
                {/* Removed Verified Outcomes Badge */}
                <h2 className="text-4xl md:text-6xl font-[1000] text-foreground tracking-tighter mb-4">
                    Offers dropped. <span className="text-primary">Lives changed.</span>
                </h2>
                <p className="text-xl text-foreground/70 font-medium max-w-2xl mx-auto leading-relaxed">
                    Stop practicing blindly. See what happens when you train like a senior engineer and finally beat the applicant tracking systems.
                </p>
            </div>

            {/* Grid Container */}
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayedTestimonials.map((t, i) => {
                        const uniqueKey = `${t.name.replace(/\s+/g, '-')}-${i}`;
                        
                        if (!showAll && i === 8) {
                            return (
                                <div key={uniqueKey} className="group relative w-full h-full transform-gpu will-change-transform cursor-pointer" onClick={() => setShowAll(true)}>
                                    <div className="absolute inset-0 z-20 bg-background/50 backdrop-blur-[3px] rounded-[1.8rem] flex flex-col items-center justify-center transition-all duration-300 group-hover:bg-background/20 border border-border overflow-hidden">
                                        <div className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-bold shadow-2xl group-hover:scale-105 transition-transform flex items-center gap-2">
                                            View {testimonials.length - 8} More Stories →
                                        </div>
                                    </div>
                                    <div className="relative z-10 opacity-70 pointer-events-none h-full">
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
                            Show Less
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
