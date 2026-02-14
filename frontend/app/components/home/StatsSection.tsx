'use client';

import { motion } from 'framer-motion';

const stats = [
    { value: '25K+', label: 'Students Enrolled' },
    { value: '1,200+', label: 'Offers Generated' },
    { value: '₹14 LPA', label: 'Avg. Package' },
    { value: '450+', label: 'Hiring Partners' },
];

export default function StatsSection() {
    return (
        <section className="py-20 bg-brand-black text-white relative overflow-hidden">
            {/* Background Mesh */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:16px_16px]"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                        >
                            <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 mb-2">
                                {stat.value}
                            </div>
                            <div className="text-brand-orange font-bold text-xs uppercase tracking-widest opacity-80">
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
