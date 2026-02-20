'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const faqs = [
    {
        question: "Is this suitable for beginners?",
        answer: "Absolutely. Emble starts with a baseline assessment. If you're a beginner, we generate a custom roadmap that starts from the very basics of programming before moving to complex DSA topics."
    },
    {
        question: "How does the Job Simulation work?",
        answer: "It's like a flight simulator for coding. You join a virtual company, get assigned a Senior Dev AI Bot, and receive tickets on a Jira-like board. You fix bugs, add features, and merge code just like in a real job."
    },
    {
        question: "Is the certification valid?",
        answer: "Yes. Our certificates are verifiable and recognized by our partner companies. They validate not just course completion, but actual code shipped in a production-like environment."
    },
    {
        question: "Can I upgrade my plan later?",
        answer: "Yes, you can upgrade from Standard to Pro at any time. You'll only pay the difference for the remaining duration of your subscription."
    }
];

export default function FAQ() {
    return (
        <section className="py-24 bg-slate-50">
            <div className="max-w-3xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-brand-black mb-4">Frequently Asked Questions</h2>
                    <p className="text-gray-500">Everything you need to know about the product and billing.</p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <FAQItem key={i} faq={faq} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function FAQItem({ faq }: { faq: { question: string, answer: string } }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-gray-200 rounded-xl bg-white overflow-hidden transition-all duration-300 hover:border-brand-orange/30">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-6 text-left"
            >
                <span className="font-bold text-brand-black text-lg">{faq.question}</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-brand-orange text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                </div>
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="px-6 pb-6 text-gray-500 leading-relaxed">
                            {faq.answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
