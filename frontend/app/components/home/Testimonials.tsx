"use client";

import { CheckCircle2, Star } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';


type Testimonial = {
    name: string;
    role: string;
    image: string;
    package?: string | null;
    text: string;
    verified: boolean;
    gradient: string;
};

const fallbackTestimonials: Testimonial[] = [
    {
        name: "Aditya Verma",
        role: "SDE-1 at Amazon",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
        package: "₹45 LPA",
        text: "Reviewing my resume with Emble was the turning point. The AI caught issues 3 previous mentors missed.",
        verified: true,
        gradient: "from-blue-50 to-blue-100/50"
    },
    {
        name: "Riya Sharma",
        role: "Frontend Engineer at Cred",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
        package: "₹28 LPA",
        text: "The Simulation forced me to write production code. My GitHub turned green, and recruiters started messaging me.",
        verified: true,
        gradient: "from-purple-50 to-purple-100/50"
    },
    {
        name: "Karthik N.",
        role: "Backend Dev at Swiggy",
        image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=200&q=80",
        package: "₹32 LPA",
        text: "The mock interviews are brutal but necessary. By the time I sat for my actual Swiggy interview, I was ready.",
        verified: true,
        gradient: "from-orange-50 to-orange-100/50"
    },
    {
        name: "Sneha Patel",
        role: "SDE-2 at Microsoft",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        package: "₹50 LPA",
        text: "System design simulations were spot on. I used the exact same patterns in my onsite rounds.",
        verified: true,
        gradient: "from-indigo-50 to-indigo-100/50"
    },
    {
        name: "Rahul Mehta",
        role: "Full Stack at Zomato",
        image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
        package: "₹24 LPA",
        text: "Emble's roadmap is the cheat sheet I wish I had in college. Following it blindly got me the offer.",
        verified: true,
        gradient: "from-red-50 to-red-100/50"
    },
    {
        name: "Ananya Gupta",
        role: "Product Engineer at Razorpay",
        image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
        package: "₹30 LPA",
        text: "The JIRA integration in the Simulation is genius. I actually knew what 'Agile' meant before day 1.",
        verified: true,
        gradient: "from-blue-50 to-cyan-100/50"
    }
];

const gradients = [
    'from-blue-50 to-blue-100/50',
    'from-purple-50 to-purple-100/50',
    'from-orange-50 to-orange-100/50',
    'from-indigo-50 to-indigo-100/50',
    'from-red-50 to-red-100/50',
    'from-blue-50 to-cyan-100/50',
];

const Card = ({ t }: { t: Testimonial }) => (
    <div className="w-[320px] md:w-[380px] shrink-0 mx-4 group relative cursor-pointer">
        <div className={`absolute -inset-0.5 bg-gradient-to-b ${t.gradient} rounded-[2rem] opacity-0 group-hover:opacity-100 transition duration-500 blur-xl`}></div>
        <div className="relative h-full bg-white rounded-[1.8rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/40 hover:shadow-2xl hover:shadow-gray-200/60 transition-all duration-300 flex flex-col justify-between hover:-translate-y-1">
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <img
                            src={t.image}
                            alt={t.name}
                            width={48}
                            height={48}
                            loading="lazy"
                            decoding="async"
                            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                        <div>
                            <h4 className="font-bold text-brand-black text-sm">{t.name}</h4>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t.role}</p>
                        </div>
                    </div>
                    {t.verified && <CheckCircle2 size={18} className="text-blue-500 fill-blue-50" />}
                </div>

                <p className="text-gray-600 text-sm leading-relaxed font-medium">"{t.text}"</p>
            </div>

            <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />
                    ))}
                </div>
                <div className="text-emerald-600 font-[900] text-sm">{t.package}</div>
            </div>
        </div>
    </div>
);

export default function Testimonials() {
    const [items, setItems] = useState<Testimonial[]>(fallbackTestimonials);
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    useEffect(() => {
        const load = async () => {
            try {
                const response = await fetch(`${apiBase}/testimonials/active`);
                if (!response.ok) return;
                const data = await response.json();
                if (Array.isArray(data) && data.length) {
                    const mapped = data.map((item: any, index: number) => ({
                        name: item.name,
                        role: item.role,
                        image: item.image,
                        package: item.package,
                        text: item.text,
                        verified: item.verified,
                        gradient: gradients[index % gradients.length],
                    }));
                    setItems(mapped);
                }
            } catch (error) {
                // fallback
            }
        };
        load();
    }, [apiBase]);

    const marqueeTestimonials = useMemo(() => ([...items, ...items]), [items]);

    return (
        <section className="py-24 bg-white relative overflow-hidden">

            {/* Header */}
            <div className="max-w-7xl mx-auto px-6 mb-16 relative z-10 text-center">
                <span className="text-green-600 font-bold text-[11px] uppercase tracking-[0.2em] bg-green-50 px-4 py-2 rounded-full border border-green-100 inline-block mb-6">
                    Wall of Love
                </span>
                <h2 className="text-4xl md:text-6xl font-[1000] text-brand-black tracking-tighter mb-4">
                    Offers dropped. <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-500">Lives changed.</span>
                </h2>
                <p className="text-xl text-gray-400 font-medium">
                    Join the community that's redefining placement prep.
                </p>
            </div>

            {/* Marquee Container */}
            <div className="relative w-full overflow-hidden mask-linear-fade">
                {/* Row 1: Left to Right */}
                <div className="flex mb-8 w-fit animate-marquee-slow hover:[animation-play-state:paused]">
                    {marqueeTestimonials.map((t, i) => (
                        <Card key={`row1-${i}`} t={t} />
                    ))}
                </div>

                {/* Row 2: Right to Left */}
                <div className="flex w-fit animate-marquee-reverse hover:[animation-play-state:paused]">
                    {marqueeTestimonials.map((t, i) => (
                        <Card key={`row2-${i}`} t={t} />
                    ))}
                </div>

                {/* Gradient Masks */}
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
            </div>
        </section>
    );
}
