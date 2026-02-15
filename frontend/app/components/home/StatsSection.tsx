'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const stats = [
    { value: 5000, suffix: '+', label: 'DSA Problems', color: 'from-blue-400 to-blue-600' },
    { value: 200, suffix: '+', label: 'Company-Asked Ques', color: 'from-orange-400 to-brand-orange' },
    { value: 24, suffix: '/7', label: 'AI Mentorship', color: 'from-purple-400 to-purple-600' },
    { value: 200, suffix: '+', label: 'Assessment Modules', color: 'from-emerald-400 to-green-600' },
];

function Counter({ value, suffix }: { value: number, suffix: string }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = value;
        const duration = 2000;
        const stepTime = Math.abs(Math.floor(duration / end));

        const timer = setInterval(() => {
            start += Math.ceil(end / 100);
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(start);
            }
        }, 20);

        return () => clearInterval(timer);
    }, [value]);

    return (
        <span>
            {count.toLocaleString()}
            {suffix}
        </span>
    );
}

export default function StatsSection() {
    return (
        <section className="py-24 bg-brand-black text-white relative overflow-hidden">
            {/* Background elements for premium look */}
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                <div className="absolute top-[-50%] left-[-10%] w-[800px] h-[800px] rounded-full bg-brand-orange/10 blur-[120px]"></div>
                <div className="absolute bottom-[-50%] right-[-10%] w-[800px] h-[800px] rounded-full bg-purple-500/10 blur-[120px]"></div>
            </div>

            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:24px_24px]"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 md:gap-20 text-center">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.8, ease: "easeOut" }}
                            className="relative group"
                        >
                            <div className={`text-4xl md:text-6xl font-[1000] tracking-tighter mb-4 transition-transform group-hover:scale-110 duration-500`}>
                                <div className={`bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-gray-500`}>
                                    <Counter value={stat.value} suffix={stat.suffix} />
                                </div>
                            </div>
                            <div className="relative inline-block">
                                <span className={`text-brand-orange font-black text-[10px] md:text-xs uppercase tracking-[0.25em] relative z-10 opacity-90 transition-opacity group-hover:opacity-100`}>
                                    {stat.label}
                                </span>
                                <div className="absolute -bottom-2 left-0 w-full h-0.5 bg-brand-orange/30 scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
