'use client';

import React from 'react';
import Link from 'next/link';
import { Terminal, Linkedin, Twitter, MessageCircle, Mail } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="w-full bg-[#0F2317] text-white pt-24 pb-8 flex flex-col items-center relative overflow-hidden font-sans mt-auto">
            {/* Background Grid */}
            <div 
                className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                style={{ 
                    backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', 
                    backgroundSize: '32px 32px' 
                }} 
            />

            {/* Top Centered CTA / Newsletter Block */}
            <div className="w-full max-w-4xl mx-auto px-6 flex flex-col items-center text-center relative z-10 mb-20 space-y-8">
                <div className="space-y-4">
                    <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white/80 mb-4 tracking-wide">
                        Unlock what's hidden ✨
                    </div>
                    <h2 className="text-4xl md:text-5xl lg:text-[56px] font-bold tracking-tight text-white leading-[1.1]">
                        Master placements with AI.<br />
                        <span className="text-white/80">No black boxes.</span>
                    </h2>
                    <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mt-6">
                        Get early access to exclusive placement resources, AI mock interview scenarios, and resume tips. Stay updated with industry hiring trends.
                    </p>
                </div>

                {/* Newsletter Input */}
                <form className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md mt-4" onSubmit={(e) => e.preventDefault()}>
                    <input 
                        type="email" 
                        placeholder="Enter your email" 
                        required
                        className="w-full h-14 px-6 rounded-full border border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 text-base shadow-sm backdrop-blur-sm transition-all"
                    />
                    <button 
                        type="submit" 
                        className="w-full sm:w-auto h-14 px-8 rounded-full bg-white text-[#0F2317] font-bold hover:bg-white/90 transition-transform active:scale-95 flex items-center justify-center shrink-0"
                    >
                        Subscribe
                    </button>
                </form>
            </div>

            {/* Divider */}
            <div className="w-full max-w-[1400px] border-t border-white/10" />

            {/* Middle Section: Branding & Links */}
            <div className="w-full max-w-[1400px] mx-auto px-6 py-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 lg:gap-6 relative z-10">
                {/* Left: Branding */}
                <div className="flex flex-col justify-start max-w-xs">
                    <Link href="/" className="inline-flex items-center group mb-3">
                        <span className="text-xl font-bold tracking-tight text-white">
                            emble
                        </span>
                    </Link>
                    <p className="text-white/50 text-sm leading-relaxed">
                        The most human AI interviews with free core tools for placement mastery.
                    </p>
                </div>

                {/* Right: Horizontal Links & Socials */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 lg:gap-12">
                    <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-white/70">
                        <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
                        <Link href="/practice" className="hover:text-white transition-colors">Practice</Link>
                        <Link href="/about" className="hover:text-white transition-colors">Company</Link>
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                        <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
                    </nav>

                    {/* Socials */}
                    <div className="flex items-center gap-4 text-white/50">
                        <Link href="https://linkedin.com" target="_blank" className="hover:text-white transition-colors" aria-label="LinkedIn">
                            <Linkedin className="w-5 h-5" />
                        </Link>
                        <Link href="https://twitter.com" target="_blank" className="hover:text-white transition-colors" aria-label="Twitter">
                            <Twitter className="w-5 h-5" />
                        </Link>
                        <Link href="https://discord.com" target="_blank" className="hover:text-white transition-colors" aria-label="Discord">
                            <MessageCircle className="w-5 h-5" />
                        </Link>
                        <Link href="mailto:hello@emble.com" className="hover:text-white transition-colors" aria-label="Email">
                            <Mail className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="w-full max-w-[1400px] border-t border-white/5 mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between items-center text-xs text-white/40 relative z-10 gap-4">
                <p>© 2026 Emble. All rights reserved.</p>
                <div className="flex items-center gap-4">
                    <p className="flex items-center gap-1">Made with <span className="text-red-500">♥</span> for placements</p>
                </div>
            </div>
        </footer>
    );
}
