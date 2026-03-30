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
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background pointer-events-none" />
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center max-w-3xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-widest mb-6 border border-primary/20"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            Contact Center
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6 leading-tight"
                        >
                            We're here to <br />
                            <span className="text-primary italic underline decoration-primary/20">help you win.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-foreground/70 font-medium"
                        >
                            Have a question about a plan, a bug to report, or just want to say hi? Our team is always ready to listen.
                        </motion.p>
                    </div>
                </div>
            </section>

            {/* Main Contact Section */}
            <section className="pb-24 bg-background relative">
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
                                        className="p-6 rounded-3xl bg-card border border-border group hover:border-primary/20 hover:bg-secondary hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300"
                                    >
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${channel.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                                            channel.color === 'orange' ? 'bg-primary/20 text-primary' :
                                                'bg-rose-100 text-rose-600'
                                            }`}>
                                            <channel.icon size={24} />
                                        </div>
                                        <h4 className="text-xl font-bold text-foreground mb-2">{channel.title}</h4>
                                        <p className="text-foreground/70 text-sm mb-4 leading-relaxed">{channel.desc}</p>
                                        <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                                            {channel.link ? (
                                                <a href={channel.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
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
                            <div className="inline-flex items-center gap-3 px-6 py-4 rounded-3xl bg-secondary text-foreground shadow-xl shadow-black/5 border border-border">
                                <Clock className="text-primary" size={20} />
                                <div className="text-left">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">Avg. Response Time</p>
                                    <p className="text-sm font-bold">~2 Hours (Support Hours: 9AM - 9PM IST)</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-card p-8 md:p-12 rounded-[40px] border border-border shadow-2xl shadow-black/5 relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-primary" />

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
                                        <h3 className="text-2xl font-black text-foreground mb-4">Message Sent!</h3>
                                        <p className="text-foreground/70 mb-8">We&apos;ve received your request and will get back to you shortly.</p>
                                        <button
                                            onClick={() => setStatus('idle')}
                                            className="px-8 py-3 rounded-xl bg-foreground text-background font-bold hover:scale-105 transition-transform"
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
                                        <h3 className="text-2xl font-black text-foreground mb-8">Send a Message</h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-foreground/50 uppercase tracking-widest ml-1">Name</label>
                                                <input
                                                    required
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    type="text"
                                                    className="w-full h-14 px-6 rounded-2xl bg-secondary border border-transparent focus:border-primary focus:bg-background outline-none transition-all text-foreground font-medium"
                                                    placeholder="Enter your name"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-foreground/50 uppercase tracking-widest ml-1">Email</label>
                                                <input
                                                    required
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    type="email"
                                                    className="w-full h-14 px-6 rounded-2xl bg-secondary border border-transparent focus:border-primary focus:bg-background outline-none transition-all text-foreground font-medium"
                                                    placeholder="Enter your email"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-foreground/50 uppercase tracking-widest ml-1">Subject / Category</label>
                                            <select
                                                name="subject"
                                                value={subject}
                                                onChange={(e) => setSubject(e.target.value)}
                                                className="w-full h-14 px-6 rounded-2xl bg-secondary border border-transparent focus:border-primary focus:bg-background outline-none transition-all text-foreground font-medium appearance-none"
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
                                                    <label className="text-xs font-black text-foreground/50 uppercase tracking-widest ml-1">Company Name</label>
                                                    <input
                                                        required={subject === 'Company Partnership'}
                                                        name="companyName"
                                                        value={formData.companyName}
                                                        onChange={handleChange}
                                                        type="text"
                                                        className="w-full h-14 px-6 rounded-2xl bg-secondary border border-transparent focus:border-emerald-500 focus:bg-background outline-none transition-all text-foreground font-medium"
                                                        placeholder="Enter company name"
                                                    />
                                                </div>
                                            </motion.div>
                                        )}

                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-foreground/50 uppercase tracking-widest ml-1">Message</label>
                                            <textarea
                                                required
                                                name="message"
                                                value={formData.message}
                                                onChange={handleChange}
                                                rows={4}
                                                className="w-full p-6 rounded-2xl bg-secondary border border-transparent focus:border-primary focus:bg-background outline-none transition-all text-foreground font-medium resize-none"
                                                placeholder={subject === 'Company Partnership' ? "Tell us about your hiring needs and scale..." : "How can we help you?"}
                                            />
                                        </div>

                                        <button
                                            disabled={status === 'sending'}
                                            type="submit"
                                            className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black text-sm uppercase tracking-widest hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {status === 'sending' ? 'Sending...' : (
                                                <>Send Message <Send size={18} /></>
                                            )}
                                        </button>

                                        <p className="text-[10px] text-foreground/50 text-center uppercase font-bold tracking-widest">
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
            <section className="py-24 bg-secondary/30">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        <div className="space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center mx-auto text-primary">
                                <MapPin size={24} />
                            </div>
                            <h5 className="font-bold text-foreground uppercase text-xs tracking-widest">Global Support</h5>
                            <p className="text-foreground/70 text-sm">
                                EMBLE Headquarters<br />
                                Mohali,India
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center mx-auto text-emerald-500">
                                <ShieldCheck size={24} />
                            </div>
                            <h5 className="font-bold text-foreground uppercase text-xs tracking-widest">Secure Channels</h5>
                            <p className="text-foreground/70 text-sm">All communications are end-to-end encrypted <br /> for your safety.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center mx-auto text-rose-500">
                                <HelpCircle size={24} />
                            </div>
                            <h5 className="font-bold text-foreground uppercase text-xs tracking-widest">Self-Service Help</h5>
                            <p className="text-foreground/70 text-sm">Check out our <Link href="/faq" className="text-primary underline">FAQ page</Link> for <br /> instant answers.</p>
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
