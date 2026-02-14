'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Building2, Users, Phone, Mail, User, CheckCircle2 } from 'lucide-react';
import { cn } from '@/app/lib/utils';

interface LeadFormProps {
    type: 'Institute' | 'Company';
}

export default function LeadForm({ type }: LeadFormProps) {
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setSubmitting(false);
            setSubmitted(true);
        }, 1500);
    };

    if (submitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border border-slate-100 shadow-xl shadow-indigo-50/50 p-12 rounded-3xl text-center max-w-lg mx-auto"
            >
                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={40} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Request Received!</h3>
                <p className="text-slate-500 mb-8">
                    Thank you. Our {type === 'Institute' ? 'academic partnership' : 'corporate relations'} team will contact you within 24 hours.
                </p>
                <button
                    onClick={() => setSubmitted(false)}
                    className="text-indigo-600 hover:text-indigo-700 font-bold text-sm bg-indigo-50 px-6 py-3 rounded-xl hover:bg-indigo-100 transition-colors"
                >
                    Submit another request
                </button>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl mx-auto bg-white border border-slate-200 p-8 md:p-10 rounded-3xl shadow-xl shadow-slate-200/50 relative overflow-hidden"
        >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>

            <div className="text-center mb-10">
                <h3 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
                    Partner with Simulator for {type}s
                </h3>
                <p className="text-slate-500 text-lg">
                    {type === 'Institute'
                        ? "Empower your students with industry-standard simulations."
                        : "Build your dream team with verified, pre-trained talent."}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Organization</label>
                        <div className="relative group">
                            <Building2 className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                            <input
                                required
                                type="text"
                                placeholder={type === 'Institute' ? "University Name" : "Company Name"}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">{type === 'Institute' ? 'Scale' : 'Hiring Need'}</label>
                        <div className="relative group">
                            <Users className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                            <select className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none appearance-none cursor-pointer">
                                <option>10 - 50 Students</option>
                                <option>50 - 200 Students</option>
                                <option>200 - 1000 Students</option>
                                <option>1000+ Students</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Contact Name</label>
                    <div className="relative group">
                        <User className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input
                            required
                            type="text"
                            placeholder="Full Name"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Email</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                            <input
                                required
                                type="email"
                                placeholder="name@org.com"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Phone</label>
                        <div className="relative group">
                            <Phone className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                            <input
                                required
                                type="tel"
                                placeholder="+91 98765 43210"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                >
                    {submitting ? (
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                        <>
                            Get Demo Access <Send size={18} />
                        </>
                    )}
                </button>

                <p className="text-center text-xs text-slate-400 font-medium">
                    Trusted by 50+ Institutes. No credit card required for demo.
                </p>
            </form>
        </motion.div>
    );
}
