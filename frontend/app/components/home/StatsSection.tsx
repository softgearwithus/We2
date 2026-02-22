'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Users, Star, Zap, Layers } from 'lucide-react';

const stats = [
    { icon: Users, label: 'Active Students', value: 200, suffix: '+', color: 'orange' },
    { icon: Star, label: 'Impact Rating', text: '4.3/5', color: 'blue' },
    { icon: Layers, label: 'Stable Release', text: 'v1.8.2', color: 'purple' },
    { icon: Zap, label: 'Platform Feature', text: 'AI-powered', color: 'emerald' },
];

function Counter({ value, suffix }: { value: number, suffix: string }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = value;
        const duration = 1500;
        const increment = Math.ceil(end / 50);

        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(start);
            }
        }, 30);

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
        <section className="py-16 bg-gray-50/50 border-y border-gray-100 relative overflow-hidden">
            {/* Minimal Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] [background-size:40px_40px]"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
                            className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 group"
                        >
                            <div className="absolute top-6 right-8">
                                <span className="text-[9px] font-black text-brand-orange/40 bg-brand-orange/5 px-2 py-0.5 rounded-full border border-brand-orange/10 uppercase tracking-widest leading-none">
                                    Emble Official
                                </span>
                            </div>
                            <div className="flex items-start justify-between mb-6">
                                <div className={`p-3 rounded-xl bg-orange-50 text-brand-orange group-hover:scale-110 transition-transform duration-300`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="text-3xl font-black text-gray-900 tracking-tight">
                                    {stat.text ? (
                                        stat.text
                                    ) : (
                                        <Counter value={stat.value || 0} suffix={stat.suffix || ''} />
                                    )}
                                </div>
                                <div className="text-sm font-medium text-gray-500 tracking-wide uppercase">
                                    {stat.label}
                                </div>
                            </div>

                            {/* Decorative line */}
                            <div className="mt-6 h-1 w-8 bg-brand-orange/10 rounded-full group-hover:w-full transition-all duration-500"></div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
