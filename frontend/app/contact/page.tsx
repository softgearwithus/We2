'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Target,
    ArrowRight,
    Zap,
    ShieldCheck,
    Send,
    CheckCircle2,
    MapPin,
    HelpCircle,
    Clock,
    Mail,
    Building2,
    Users2
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/app/components/layout/Navbar';
import Footer from '@/app/components/layout/Footer';

const supportChannels = [
    {
        title: "General Support",
        desc: "For questions about the Placement Mode dashboard or existing subscriptions.",
        icon: Mail,
        contact: "emblehelpcare@gmail.com",
        color: "emerald"
    },
    {
        title: "Enterprise & Sales",
        desc: "Colleges and companies looking for tailored hiring solutions.",
        icon: Building2,
        contact: "emblehelpcare@gmail.com",
        color: "orange"
    },
    {
        title: "Student Community",
        desc: "Join 10k+ students for peer learning and instant help.",
        icon: Users2,
        contact: "Join Discord",
        link: "https://discord.gg/we2",
        color: "rose"
    }
];

export default function ContactPage() {
    const [mounted, setMounted] = useState(false);
    const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');
    const [subject, setSubject] = useState('General Inquiry');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        companyName: '',
        message: '',
        phone: ''
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');

        try {
            if (subject === 'Company Partnership') {
                // Route directly to the B2B CRM Lead Gen endpoint
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/company-leads`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: formData.name,
                        email: formData.email,
                        companyName: formData.companyName || formData.name, // Fallback if missing
                        phone: formData.phone || undefined
                    })
                });
                if (!res.ok) throw new Error('Failed to send company lead');
            } else {
                // Submit general query to Queries module
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/queries`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: formData.name,
                        email: formData.email,
                        subject: subject,
                        companyName: formData.companyName || undefined,
                        message: formData.message
                    })
                });
                if (!res.ok) throw new Error('Failed to send inquiry');
            }
            setStatus('success');
            setFormData({ name: '', email: '', companyName: '', message: '', phone: '' });
        } catch (error) {
            console.error('Submission error:', error);
            setStatus('idle');
            alert('Failed to send message. Please try again.');
        }
    };

    if (!mounted) return null;

    return (
        <main className="min-h-screen bg-white selection:bg-brand-orange selection:text-white">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-orange-50/50 to-white pointer-events-none" />
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center max-w-3xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/10 text-brand-orange text-[11px] font-bold uppercase tracking-widest mb-6 border border-brand-orange/20"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
                            Contact Center
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl md:text-7xl font-extrabold tracking-tight text-brand-black mb-6 leading-tight"
                        >
                            We're here to <br />
                            <span className="text-brand-orange italic underline decoration-brand-orange/20">help you win.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-gray-500 font-medium"
                        >
                            Have a question about a plan, a bug to report, or just want to say hi? Our team is always ready to listen.
                        </motion.p>
                    </div>
                </div>
            </section>

            {/* Main Contact Section */}
            <section className="pb-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

                        {/* Left Side: Info & Channels */}
                        <div className="space-y-12">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                                {supportChannels.map((channel, idx) => (
                                    <motion.div
                                        key={channel.title}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="p-6 rounded-3xl bg-gray-50 border border-gray-100 group hover:border-brand-orange/20 hover:bg-white hover:shadow-2xl hover:shadow-brand-orange/5 transition-all duration-300"
                                    >
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${channel.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                                            channel.color === 'orange' ? 'bg-orange-100 text-brand-orange' :
                                                'bg-rose-100 text-rose-600'
                                            }`}>
                                            <channel.icon size={24} />
                                        </div>
                                        <h4 className="text-xl font-bold text-brand-black mb-2">{channel.title}</h4>
                                        <p className="text-gray-500 text-sm mb-4 leading-relaxed">{channel.desc}</p>
                                        <div className="flex items-center gap-2 text-brand-black font-bold text-sm">
                                            {channel.link ? (
                                                <a href={channel.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-brand-orange transition-colors">
                                                    {channel.contact} <ArrowRight size={14} />
                                                </a>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    {channel.contact}
                                                </span>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Response Time Badge */}
                            <div className="inline-flex items-center gap-3 px-6 py-4 rounded-3xl bg-brand-black text-white shadow-xl shadow-gray-200">
                                <Clock className="text-brand-orange" size={20} />
                                <div className="text-left">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Avg. Response Time</p>
                                    <p className="text-sm font-bold">~2 Hours (Support Hours: 9AM - 9PM IST)</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-white p-8 md:p-12 rounded-[40px] border border-gray-100 shadow-2xl shadow-gray-100 relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-orange" />

                            <AnimatePresence mode="wait">
                                {status === 'success' ? (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-12"
                                    >
                                        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6">
                                            <CheckCircle2 size={40} />
                                        </div>
                                        <h3 className="text-2xl font-black text-brand-black mb-4">Message Sent!</h3>
                                        <p className="text-gray-500 mb-8">We&apos;ve received your request and will get back to you shortly.</p>
                                        <button
                                            onClick={() => setStatus('idle')}
                                            className="px-8 py-3 rounded-xl bg-brand-black text-white font-bold hover:scale-105 transition-transform"
                                        >
                                            Send another message
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.form
                                        key="form"
                                        onSubmit={handleSubmit}
                                        className="space-y-6"
                                    >
                                        <h3 className="text-2xl font-black text-brand-black mb-8">Send a Message</h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Your Name</label>
                                                <input
                                                    required
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    type="text"
                                                    className="w-full h-14 px-6 rounded-2xl bg-gray-50 border border-gray-100 focus:border-brand-orange focus:bg-white outline-none transition-all text-brand-black font-medium"
                                                    placeholder="e.g. Ayush Gupta"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                                <input
                                                    required
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    type="email"
                                                    className="w-full h-14 px-6 rounded-2xl bg-gray-50 border border-gray-100 focus:border-brand-orange focus:bg-white outline-none transition-all text-brand-black font-medium"
                                                    placeholder="ayush@example.com"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Subject / Category</label>
                                            <select
                                                name="subject"
                                                value={subject}
                                                onChange={(e) => setSubject(e.target.value)}
                                                className="w-full h-14 px-6 rounded-2xl bg-gray-50 border border-gray-100 focus:border-brand-orange focus:bg-white outline-none transition-all text-brand-black font-medium appearance-none"
                                            >
                                                <option value="General Inquiry">General Inquiry</option>
                                                <option value="Placement Mode Dashboard Help">Placement Mode Dashboard Help</option>
                                                <option value="Billing & Payments">Billing & Payments</option>
                                                <option value="Technical Support">Technical Support</option>
                                                <option value="College Partnership">College Partnership</option>
                                                <option value="Company Partnership">Company Partnership</option>
                                            </select>
                                        </div>

                                        {subject === 'Company Partnership' && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="grid grid-cols-1 gap-6"
                                            >
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Company Name</label>
                                                    <input
                                                        required={subject === 'Company Partnership'}
                                                        name="companyName"
                                                        value={formData.companyName}
                                                        onChange={handleChange}
                                                        type="text"
                                                        className="w-full h-14 px-6 rounded-2xl bg-gray-50 border border-emerald-100 focus:border-emerald-500 focus:bg-white outline-none transition-all text-brand-black font-medium"
                                                        placeholder="e.g. Acme Corp"
                                                    />
                                                </div>
                                            </motion.div>
                                        )}

                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Your Message</label>
                                            <textarea
                                                required
                                                name="message"
                                                value={formData.message}
                                                onChange={handleChange}
                                                rows={4}
                                                className="w-full p-6 rounded-2xl bg-gray-50 border border-gray-100 focus:border-brand-orange focus:bg-white outline-none transition-all text-brand-black font-medium resize-none"
                                                placeholder={subject === 'Company Partnership' ? "Tell us about your hiring needs and scale..." : "How can we help you?"}
                                            />
                                        </div>

                                        <button
                                            disabled={status === 'sending'}
                                            type="submit"
                                            className="w-full h-14 rounded-2xl bg-brand-orange text-white font-black text-sm uppercase tracking-widest hover:bg-brand-orange-hover hover:shadow-xl hover:shadow-brand-orange/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {status === 'sending' ? 'Sending...' : (
                                                <>Send Message <Send size={18} /></>
                                            )}
                                        </button>

                                        <p className="text-[10px] text-gray-400 text-center uppercase font-bold tracking-widest">
                                            By sending a message, you agree to our Privacy Policy.
                                        </p>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </motion.div>

                    </div>
                </div>
            </section>

            {/* Global Presence */}
            <section className="py-24 bg-gray-50/50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        <div className="space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center mx-auto text-brand-orange">
                                <MapPin size={24} />
                            </div>
                            <h5 className="font-bold text-brand-black uppercase text-xs tracking-widest">Global Support</h5>
                            <p className="text-gray-500 text-sm">
                                EMBLE Headquarters<br />
                                Mohali,India
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center mx-auto text-emerald-500">
                                <ShieldCheck size={24} />
                            </div>
                            <h5 className="font-bold text-brand-black uppercase text-xs tracking-widest">Secure Channels</h5>
                            <p className="text-gray-500 text-sm">All communications are end-to-end encrypted <br /> for your safety.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center mx-auto text-rose-500">
                                <HelpCircle size={24} />
                            </div>
                            <h5 className="font-bold text-brand-black uppercase text-xs tracking-widest">Self-Service Help</h5>
                            <p className="text-gray-500 text-sm">Check out our <Link href="/faq" className="text-brand-orange underline">FAQ page</Link> for <br /> instant answers.</p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}

function cn(...classes: (string | boolean | undefined | null)[]) {
    return classes.filter(Boolean).join(' ');
}
