'use client';

import { motion } from 'framer-motion';

const companies = [
    'Google', 'Microsoft', 'Amazon', 'Meta', 'Netflix', 'Uber', 'Airbnb', 'Stripe', 'Coinbase', 'Spotify'
];

export default function TrustedBy() {
    return (
        <section className="py-10 border-b border-gray-100 bg-white/50 backdrop-blur-sm overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 mb-6 text-center">
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
                    Trusted by engineers at
                </p>
            </div>

            <div className="relative flex overflow-x-hidden group">
                <div className="animate-marquee whitespace-nowrap flex gap-16 items-center">
                    {/* First set of logos */}
                    {companies.map((company, index) => (
                        <span
                            key={index}
                            className="text-2xl font-bold text-gray-300 hover:text-brand-black transition-colors duration-300 cursor-default"
                        >
                            {company}
                        </span>
                    ))}
                    {/* Duplicate set for seamless loop */}
                    {companies.map((company, index) => (
                        <span
                            key={`dup-${index}`}
                            className="text-2xl font-bold text-gray-300 hover:text-brand-black transition-colors duration-300 cursor-default"
                        >
                            {company}
                        </span>
                    ))}
                    {/* Triplicate set for seamless loop on wide screens */}
                    {companies.map((company, index) => (
                        <span
                            key={`trip-${index}`}
                            className="text-2xl font-bold text-gray-300 hover:text-brand-black transition-colors duration-300 cursor-default"
                        >
                            {company}
                        </span>
                    ))}
                </div>

                {/* Gradient fades for seamless look */}
                <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
            </div>
        </section>
    );
}
