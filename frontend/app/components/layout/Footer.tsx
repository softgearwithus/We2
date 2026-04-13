'use client';

import React from 'react';
import Link from 'next/link';
import { Terminal, Linkedin, Twitter, Instagram, Mail } from 'lucide-react';
import { getAllSeoPages } from '@/app/lib/seo-pages';

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

            {/* Top Centered CTA / Newsletter Block removed per request */}

            {/* Divider */}
            <div className="w-full max-w-[1400px] border-t border-white/10 mx-auto" />

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
                        The most human AI interviews with free core tools for preparation mastery.
                    </p>
                    <a href="mailto:support@emble.in" className="text-white/70 hover:text-white text-sm mt-4 font-medium inline-flex items-center gap-2 transition-colors">
                        <Mail className="w-4 h-4" /> support@emble.in
                    </a>
                </div>

                {/* Right: Horizontal Links & Socials */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 lg:gap-12">
                    <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-white/70">
                        <Link href="/features" className="hover:text-white transition-colors">Features</Link>
                        <Link href="/reviews" className="hover:text-white transition-colors">Success Stories</Link>
                        <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
                        <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
                        <Link href="/about" className="hover:text-white transition-colors">About Us</Link>
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                        <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
                    </nav>

                    {/* Socials */}
                    <div className="flex items-center gap-4 text-white/50">
                        <Link href="https://www.linkedin.com/company/joinemble/" target="_blank" className="hover:text-white transition-colors" aria-label="LinkedIn">
                            <Linkedin className="w-5 h-5" />
                        </Link>
                        <Link href="https://x.com/joinEmble" target="_blank" className="hover:text-white transition-colors" aria-label="X (Twitter)">
                            <Twitter className="w-5 h-5" />
                        </Link>
                        <Link href="https://www.instagram.com/emble.in/" target="_blank" className="hover:text-white transition-colors" aria-label="Instagram">
                            <Instagram className="w-5 h-5" />
                        </Link>
                        <a href="mailto:support@emble.in" className="hover:text-white transition-colors" aria-label="Email support@emble.in">
                            <Mail className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="w-full max-w-[1400px] border-t border-white/5 mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between items-center text-xs text-white/40 relative z-10 gap-4">
                <p>© 2026 Emble. All rights reserved.</p>
                <div className="flex items-center gap-4">
                    <p className="flex items-center gap-1">Made with <span className="text-red-500">♥</span> for preparation</p>
                </div>
            </div>

            {/* SEO Mega-Footprint (Hidden from UI, visible to crawlers) */}
            <div className="sr-only">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-8">
                    {/* Role Prep */}
                    <div className="flex flex-col gap-1.5">
                        <h3 className="text-white/30 font-semibold text-[10px] uppercase tracking-widest mb-1.5">Role Prep</h3>
                        {getAllSeoPages().filter(p => p.category === 'prep').map(page => (
                            <Link key={page.slug} href={`/prep/${page.slug}`} className="text-white/20 hover:text-white/60 text-[10px] leading-snug transition-colors line-clamp-1">{page.title.split('|')[0].trim()}</Link>
                        ))}
                    </div>
                    {/* Company Rounds */}
                    <div className="flex flex-col gap-1.5">
                        <h3 className="text-white/30 font-semibold text-[10px] uppercase tracking-widest mb-1.5">Company Prep</h3>
                        {getAllSeoPages().filter(p => p.category === 'company').map(page => (
                            <Link key={page.slug} href={`/company/${page.slug}`} className="text-white/20 hover:text-white/60 text-[10px] leading-snug transition-colors line-clamp-1">{page.title.split('|')[0].trim()}</Link>
                        ))}
                    </div>
                    {/* Tech Stacks */}
                    <div className="flex flex-col gap-1.5">
                        <h3 className="text-white/30 font-semibold text-[10px] uppercase tracking-widest mb-1.5">Tech Stacks</h3>
                        {getAllSeoPages().filter(p => p.category === 'stack').map(page => (
                            <Link key={page.slug} href={`/stack/${page.slug}`} className="text-white/20 hover:text-white/60 text-[10px] leading-snug transition-colors line-clamp-1">{page.title.split('|')[0].trim()}</Link>
                        ))}
                    </div>
                    {/* Interview Types */}
                    <div className="flex flex-col gap-1.5">
                        <h3 className="text-white/30 font-semibold text-[10px] uppercase tracking-widest mb-1.5">Interview Types</h3>
                        {getAllSeoPages().filter(p => p.category === 'type').map(page => (
                            <Link key={page.slug} href={`/type/${page.slug}`} className="text-white/20 hover:text-white/60 text-[10px] leading-snug transition-colors line-clamp-1">{page.title.split('|')[0].trim()}</Link>
                        ))}
                    </div>
                    {/* Tools */}
                    <div className="flex flex-col gap-1.5">
                        <h3 className="text-white/30 font-semibold text-[10px] uppercase tracking-widest mb-1.5">Free Tools</h3>
                        {getAllSeoPages().filter(p => p.category === 'tools').map(page => (
                            <Link key={page.slug} href={`/tools/${page.slug}`} className="text-white/20 hover:text-white/60 text-[10px] leading-snug transition-colors line-clamp-1">{page.title.split('|')[0].trim()}</Link>
                        ))}
                    </div>
                    {/* Services */}
                    <div className="flex flex-col gap-1.5">
                        <h3 className="text-white/30 font-semibold text-[10px] uppercase tracking-widest mb-1.5">Services</h3>
                        {getAllSeoPages().filter(p => p.category === 'services').map(page => (
                            <Link key={page.slug} href={`/services/${page.slug}`} className="text-white/20 hover:text-white/60 text-[10px] leading-snug transition-colors line-clamp-1">{page.title.split('|')[0].trim()}</Link>
                        ))}
                    </div>
                    {/* Alternatives */}
                    <div className="flex flex-col gap-1.5">
                        <h3 className="text-white/30 font-semibold text-[10px] uppercase tracking-widest mb-1.5">Alternatives</h3>
                        {getAllSeoPages().filter(p => p.category === 'alternative').map(page => (
                            <Link key={page.slug} href={`/alternative/${page.slug}`} className="text-white/20 hover:text-white/60 text-[10px] leading-snug transition-colors line-clamp-1">{page.title.split('|')[0].trim()}</Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Massive Footer Branding */}
            <div className="w-full overflow-hidden flex justify-end items-center mt-2 pointer-events-none select-none pr-8 md:pr-12">
                <h1 className="text-[15vw] leading-[0.8] font-[1000] text-white/5 tracking-tighter">
                    emble
                </h1>
            </div>
        </footer>
    );
}
