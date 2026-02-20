'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
    {
        q: "Does India's #1 AI-powered platform really prepare me for top-tier MNC rounds?",
        a: "Mastering technical logic is about pattern recognition - not just memorization. We provide 200+ curated patterns frequently asked in high-stakes interviews at top product companies, ensuring you master the logic recruiters actually look for."
    },
    {
        q: "How does the 21-day Industrial Sprint simulate a real engineering job?",
        a: "This is a high-intensity simulation of a modern engineering team. You'll work with real microservices, submit Pull Requests, and undergo rigorous AI code reviews - it's designed to transform you from a student into a production-ready engineer."
    },
    {
        q: "I've practiced on traditional coding platforms - why do I need this AI-Integrated environment?",
        a: "Standard platforms are great for isolated logic, but real jobs happen in large systems. As India's #1 AI-powered platform, we simulate production realities like Docker, AWS, and system-wide debugging - bridging the gap between a simple solution and a real feature."
    },
    {
        q: "Can I practice the Industry SQL 50 questions for real-world data rounds?",
        a: "Yes. Our 'Industry SQL 50' is a vetted dataset of complex database modeling and query optimization challenges - precisely what's required for full-stack and data engineering roles in top product companies today."
    },
    {
        q: "What if I get stuck on a logic bug - does the AI Mentor help 24/7?",
        a: "Our AI Mentor is available around the clock. Instead of just giving you the code, it identifies your logical blind spots and provides progressive hints - helping you learn the 'Why' behind every piece of code you write."
    },
    {
        q: "How do recruiters verify the 'Proof of Work' I build during the simulation?",
        a: "Every industrial project you complete is scored and added to your verified Job Hub profile. Recruiters see your actual engineering capability through production projects - making your profile stand out as someone who is ready to contribute."
    },
    {
        q: "Is the tech stack (Docker, AWS, NestJS) actually used in modern engineering teams?",
        a: "Absolutely. We exclusively focus on the high-demand stack - React, NestJS, PostgreSQL, Docker, and AWS. Mastering these ensures you are competent in the technologies used by the fastest-growing tech companies today."
    },
    {
        q: "Will the Snipes feed help me stay updated with industrial trends for my interviews?",
        a: "Yes. Technical rounds often include discussions on industry trends. Snipes provides a daily briefing of critical AI news and industrial signals - ensuring you always have an informed perspective during your technical discussions."
    },
    {
        q: "How do I prove my 'Placement Readiness' with the Skill Scorecard?",
        a: "Your Scorecard provides a data-driven view of your logic, coding, and communication skills. It's a holistic metric used by our placement partners to identify top talent who are ready for immediate industrial contribution."
    },
    {
        q: "Is India's #1 AI-powered platform designed only for beginners or experienced engineers?",
        a: "Emble is built for anyone looking to reach the next tier of engineering. Whether you're a student learning patterns or a dev wanting to master industrial-scale systems - the platform adapts to push your technical boundaries."
    }
];

function FAQItem({ q, a, i }: { q: string, a: string, i: number }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="border-b border-gray-100 last:border-0"
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-6 flex items-center justify-between text-left group transition-all"
            >
                <span className={`text-lg font-bold transition-colors duration-300 ${isOpen ? 'text-brand-orange' : 'text-gray-900 group-hover:text-brand-orange'}`}>
                    {q}
                </span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    className={`p-2 rounded-full transition-colors ${isOpen ? 'bg-orange-50 text-brand-orange' : 'bg-gray-50 text-gray-400'}`}
                >
                    <ChevronDown size={18} />
                </motion.div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <p className="pb-8 text-gray-500 leading-relaxed max-w-3xl font-medium">
                            {a}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function FAQSection() {
    // Generate JSON-LD Schema
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.q,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.a
            }
        }))
    };

    return (
        <section className="py-24 bg-white relative overflow-hidden">
            {/* JSON-LD injection */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

            <div className="max-w-4xl mx-auto px-6 relative z-10">
                <div className="text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-brand-orange text-[10px] font-black uppercase tracking-widest mb-4 border border-orange-100">
                        <HelpCircle size={14} />
                        Platform Knowledge
                    </div>
                    <h2 className="text-4xl md:text-5xl font-[1000] text-gray-900 tracking-tighter mb-4">
                        Everything you need to <span className="text-brand-orange">succeed.</span>
                    </h2>
                    <p className="text-gray-500 font-medium text-lg">
                        Deep dive into how Emble transforms your career from Preparation to Industrial Mastery.
                    </p>
                </div>

                <div className="bg-gray-50/50 rounded-3xl p-4 md:p-10 border border-gray-100 shadow-sm">
                    {faqs.map((faq, i) => (
                        <FAQItem key={i} q={faq.q} a={faq.a} i={i} />
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <p className="text-gray-400 font-bold text-xs uppercase tracking-widest leading-loose">
                        Still have questions? Our AI Mentor is available 24/7 in the platform workspace.
                    </p>
                </div>
            </div>
        </section>
    );
}
