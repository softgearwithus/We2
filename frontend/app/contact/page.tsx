'use client';

import { fetchApi } from '../lib/apiClient';

import React, { useState } from 'react';
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
        contact: "support@emble.in",
        color: "emerald"
    },
    {
        title: "Enterprise & Sales",
        desc: "Colleges and companies looking for tailored hiring solutions.",
        icon: Building2,
        contact: "support@emble.in",
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
    const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');
    const [subject, setSubject] = useState('General Inquiry');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        companyName: '',
        message: '',
        phone: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');

        try {
            if (subject === 'Company Partnership') {
                // Route directly to the B2B CRM Lead Gen endpoint
                const res = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/company-leads`, {
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
                const res = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/queries`, {
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

    return (
        <main className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 bg-white pointer-events-none border-b-2 border-[#202b20]" />
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center max-w-3xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-[#ffa116] text-[#202b20] border-2 border-[#202b20] shadow-[2px_2px_0_0_#202b20] text-[11px] font-[800] uppercase tracking-widest mb-6"
                        >
                            <span className="w-1.5 h-1.5 bg-[#202b20] animate-pulse" />
                            Contact Center
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl md:text-7xl font-[800] tracking-tighter text-[#202b20] mb-6 leading-tight uppercase"
                        >
                            We're here to <br />
                            <span className="text-[#ffa116] underline decoration-[#202b20] decoration-4 underline-offset-8">help you win.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-[#202b20]/80 font-[600]"
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
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                                {supportChannels.map((channel, idx) => (
                                    <motion.div
                                        key={channel.title}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="p-6 bg-white border-2 border-[#202b20] shadow-[2px_2px_0_0_#202b20] group hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#ffa116] transition-all duration-300"
                                    >
                                        <div className={`w-12 h-12  flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${channel.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                                            channel.color === 'orange' ? 'bg-primary/20 text-primary' :
                                                'bg-rose-100 text-rose-600'
                                            }`}>
                                            <channel.icon size={24} />
                                        </div>
                                        <h4 className="text-xl font-[800] uppercase text-[#202b20] mb-2">{channel.title}</h4>
                                        <p className="text-[#202b20]/70 text-sm mb-4 font-[600] leading-relaxed">{channel.desc}</p>
                                        <div className="flex items-center gap-2 text-[#202b20] font-[800] text-sm uppercase tracking-wider">
                                            {channel.link ? (
                                                <a href={channel.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-[#ffa116] transition-colors">
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
                            <div className="inline-flex items-center gap-4 p-6 bg-white border-2 border-[#202b20] shadow-[2px_2px_0_0_#202b20]">
                                <Clock className="text-primary" size={20} />
                                <div className="text-left">
                                    <p className="text-[10px] font-[800] uppercase tracking-widest text-[#202b20]/50 mb-1">Avg. Response Time</p>
                                    <p className="text-sm font-[700] text-[#202b20] uppercase tracking-wide">~2 Hours (Support Hours: 9AM - 9PM IST)</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-white p-8 md:p-12 border-2 border-[#202b20] shadow-[4px_4px_0_0_#202b20] relative"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 border-b-2 border-[#202b20] bg-[#ffa116]" />

                            <AnimatePresence mode="wait">
                                {status === 'success' ? (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-12"
                                    >
                                        <div className="w-20 h-20 border-2 border-[#202b20] shadow-[2px_2px_0_0_#202b20] bg-[#34d399] flex items-center justify-center mx-auto mb-6">
                                            <CheckCircle2 size={40} />
                                        </div>
                                        <h3 className="text-2xl font-[800] uppercase text-[#202b20] mb-4">Message Sent!</h3>
                                        <p className="text-[#202b20]/70 font-[600] mb-8">We&apos;ve received your request and will get back to you shortly.</p>
                                        <button
                                            onClick={() => setStatus('idle')}
                                            className="px-8 py-3 bg-white border-2 border-[#202b20] text-[#202b20] font-[800] uppercase tracking-widest text-sm hover:-translate-y-1 hover:shadow-[2px_2px_0_0_#ffa116] transition-all"
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
                                        <h3 className="text-2xl font-[800] uppercase text-[#202b20] mb-8">Send a Message</h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-[800] text-[#202b20]/70 uppercase tracking-widest">Name</label>
                                                <input
                                                    required
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    type="text"
                                                    className="w-full h-12 px-4 bg-white border-2 border-[#202b20] shadow-[2px_2px_0_0_#202b20] focus:shadow-[4px_4px_0_0_#ffa116] focus:-translate-y-0.5 outline-none transition-all text-[#202b20] font-[600] placeholder:text-[#202b20]/40"
                                                    placeholder="Enter your name"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-[800] text-[#202b20]/70 uppercase tracking-widest">Email</label>
                                                <input
                                                    required
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    type="email"
                                                    className="w-full h-12 px-4 bg-white border-2 border-[#202b20] shadow-[2px_2px_0_0_#202b20] focus:shadow-[4px_4px_0_0_#ffa116] focus:-translate-y-0.5 outline-none transition-all text-[#202b20] font-[600] placeholder:text-[#202b20]/40"
                                                    placeholder="Enter your email"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-[800] text-[#202b20]/70 uppercase tracking-widest">Subject / Category</label>
                                            <select
                                                name="subject"
                                                value={subject}
                                                onChange={(e) => setSubject(e.target.value)}
                                                className="w-full h-12 px-4 bg-white border-2 border-[#202b20] shadow-[2px_2px_0_0_#202b20] focus:shadow-[4px_4px_0_0_#ffa116] focus:-translate-y-0.5 outline-none transition-all text-[#202b20] font-[600] appearance-none"
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
                                                    <label className="text-[10px] font-[800] text-[#202b20]/70 uppercase tracking-widest">Company Name</label>
                                                    <input
                                                        required={subject === 'Company Partnership'}
                                                        name="companyName"
                                                        value={formData.companyName}
                                                        onChange={handleChange}
                                                        type="text"
                                                        className="w-full h-12 px-4 bg-white border-2 border-[#202b20] shadow-[2px_2px_0_0_#202b20] focus:shadow-[4px_4px_0_0_#34d399] focus:-translate-y-0.5 outline-none transition-all text-[#202b20] font-[600] placeholder:text-[#202b20]/40"
                                                        placeholder="Enter company name"
                                                    />
                                                </div>
                                            </motion.div>
                                        )}

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-[800] text-[#202b20]/70 uppercase tracking-widest">Message</label>
                                            <textarea
                                                required
                                                name="message"
                                                value={formData.message}
                                                onChange={handleChange}
                                                rows={4}
                                                className="w-full p-4 bg-white border-2 border-[#202b20] shadow-[2px_2px_0_0_#202b20] focus:shadow-[4px_4px_0_0_#ffa116] focus:-translate-y-0.5 outline-none transition-all text-[#202b20] font-[600] resize-none placeholder:text-[#202b20]/40"
                                                placeholder={subject === 'Company Partnership' ? "Tell us about your hiring needs and scale..." : "How can we help you?"}
                                            />
                                        </div>

                                        <button
                                            disabled={status === 'sending'}
                                            type="submit"
                                            className="w-full h-14 bg-[#202b20] text-white border-2 border-[#202b20] shadow-[2px_2px_0_0_#202b20] font-[800] text-sm uppercase tracking-widest hover:bg-[#ffa116] hover:text-[#202b20] hover:shadow-[4px_4px_0_0_#202b20] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                                        >
                                            {status === 'sending' ? 'Sending...' : (
                                                <>Send Message <Send size={18} /></>
                                            )}
                                        </button>

                                        <p className="text-[10px] text-[#202b20]/60 text-center uppercase font-[700] tracking-widest mt-6">
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
            <section className="py-24 bg-white border-t-2 border-[#202b20]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        <div className="space-y-4 flex flex-col items-center">
                            <div className="w-14 h-14 bg-white border-2 border-[#202b20] shadow-[2px_2px_0_0_#202b20] flex items-center justify-center text-[#ffa116] mb-2">
                                <MapPin size={24} />
                            </div>
                            <h5 className="font-[800] text-[#202b20] uppercase tracking-widest">Global Support</h5>
                            <p className="text-[#202b20]/80 font-[600] text-sm text-center">
                                EMBLE Headquarters<br />
                                Mohali,India
                            </p>
                        </div>
                        <div className="space-y-4 flex flex-col items-center">
                            <div className="w-14 h-14 bg-[#34d399] border-2 border-[#202b20] shadow-[2px_2px_0_0_#202b20] flex items-center justify-center text-[#202b20] mb-2">
                                <ShieldCheck size={24} />
                            </div>
                            <h5 className="font-[800] text-[#202b20] uppercase tracking-widest">Secure Channels</h5>
                            <p className="text-[#202b20]/80 font-[600] text-sm text-center">All communications are end-to-end encrypted <br /> for your safety.</p>
                        </div>
                        <div className="space-y-4 flex flex-col items-center">
                            <div className="w-14 h-14 bg-[#fb7185] border-2 border-[#202b20] shadow-[2px_2px_0_0_#202b20] flex items-center justify-center text-[#202b20] mb-2">
                                <HelpCircle size={24} />
                            </div>
                            <h5 className="font-[800] text-[#202b20] uppercase tracking-widest">Self-Service Help</h5>
                            <p className="text-[#202b20]/80 font-[600] text-sm text-center">Check out our <Link href="/faq" className="text-[#ffa116] underline decoration-2 underline-offset-4 decoration-[#202b20] hover:text-[#202b20] transition-colors">FAQ page</Link> for <br /> instant answers.</p>
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
