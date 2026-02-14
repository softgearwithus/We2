'use client';

import { motion } from 'framer-motion';
import { Quote, Linkedin, CheckCircle2 } from 'lucide-react';

const testimonials = [
    {
        name: "Aditya Verma",
        role: "SDE-1 at Amazon",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
        package: "₹45 LPA",
        text: "Reviewing my resume with Prep0 was the turning point. The AI caught issues 3 previous mentors missed. We2Hub's simulation gave me the system design confidence I needed for the bar raiser.",
        companyLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/2560px-Amazon_logo.svg.png",
        verified: true
    },
    {
        name: "Riya Sharma",
        role: "Frontend Engineer at Cred",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
        package: "₹28 LPA",
        text: "I was stuck in tutorial hell for 2 years. We2Hub forced me to write production code. My GitHub turned green, and recruiters started messaging me instead of me chasing them.",
        companyLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Cred_logo.svg/1200px-Cred_logo.svg.png",
        // Note: In a real app, use local assets or reliable CDNs for logos. 
        // Using placeholders/text if image fails in production logic (not handled here for simplicity)
        verified: true
    },
    {
        name: "Karthik N.",
        role: "Backend Dev at Swiggy",
        image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=200&q=80",
        package: "₹32 LPA",
        text: "The mock interviews are brutal but necessary. By the time I sat for my actual Swiggy interview, I was so used to the pressure that it felt like just another practice session.",
        verified: true
    }
];

export default function Testimonials() {
    return (
        <section className="py-24 bg-gray-50/50 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 text-[11px] font-bold uppercase tracking-widest mb-4 border border-green-100">
                        <CheckCircle2 size={12} /> Real Results
                    </div>
                    <h2 className="text-4xl font-bold text-brand-black tracking-tight mb-4">
                        Offers dropped. <br /> <span className="text-brand-orange">Lives changed.</span>
                    </h2>
                    <p className="text-xl text-gray-500">
                        See how We2 graduates are cracking top product companies.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-premium hover:-translate-y-1 transition-all duration-300 relative flex flex-col h-full"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full object-cover border border-gray-100" />
                                    <div>
                                        <h4 className="font-bold text-brand-black text-sm flex items-center gap-1">
                                            {t.name}
                                            {t.verified && <CheckCircle2 size={14} className="text-blue-500 fill-blue-50" />}
                                        </h4>
                                        <p className="text-xs text-brand-orange font-bold uppercase tracking-tight">{t.package}</p>
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                    <Linkedin size={16} />
                                </div>
                            </div>

                            {/* Body */}
                            <div className="flex-1 mb-6">
                                <p className="text-gray-600 text-[15px] leading-relaxed">
                                    "{t.text}"
                                </p>
                            </div>

                            {/* Footer */}
                            <div className="pt-4 border-t border-gray-50 mt-auto flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Placed At</p>
                                    <p className="text-sm font-bold text-gray-700">{t.role.split(' at ')[1]}</p>
                                </div>
                                {/* Visual indicator of "Placed" */}
                                <div className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100">
                                    Verified Offer
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
