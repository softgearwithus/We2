'use client';

import React from 'react';
import Link from 'next/link';
import { Terminal, Linkedin, Twitter, Instagram, Mail } from 'lucide-react';
import { getAllSeoPages } from '@/app/lib/seo-pages';
import { blogPosts } from '@/app/lib/blog-data';

export default function Footer() {
    return (
        <footer className="w-full bg-white border-t border-gray-100 pt-16 pb-0 flex flex-col items-center relative overflow-hidden font-sans mt-auto">
            {/* Divider */}
            <div className="w-full max-w-[1400px] mx-auto mt-8" />

            {/* Middle Section: Branding & Links */}
            <div className="w-full max-w-[1400px] mx-auto px-6 py-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 lg:gap-6 relative z-10">
                {/* Left: Branding */}
                <div className="flex flex-col justify-start max-w-xs">
                    <Link href="/" className="inline-flex items-center group mb-4">
                        <span className="text-3xl font-black tracking-tighter text-gray-900 uppercase">
                            EMBLE
                        </span>
                    </Link>
                    <p className="text-gray-500 text-sm leading-relaxed font-medium mt-2">
                        The most human AI interviews with free core tools for preparation mastery.
                    </p>
                    <a href="mailto:support@emble.in" className="text-gray-600 hover:text-indigo-600 text-sm mt-4 font-semibold inline-flex items-center gap-2 transition-all uppercase">
                        <Mail className="w-4 h-4" /> support@emble.in
                    </a>
                </div>

                {/* Right: Horizontal Links & Socials */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 lg:gap-12">
                    <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-gray-600 tracking-wider">
                        <Link href="/reviews" className="hover:text-indigo-600 transition-colors">Success Stories</Link>
                        <Link href="/pricing" className="hover:text-indigo-600 transition-colors">Pricing</Link>
                        <Link href="/faq" className="hover:text-indigo-600 transition-colors">FAQ</Link>
                        <Link href="/blog" className="hover:text-indigo-600 transition-colors">Blog</Link>
                        <Link href="/about" className="hover:text-indigo-600 transition-colors">About Us</Link>
                        <Link href="/privacy" className="hover:text-indigo-600 transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-indigo-600 transition-colors">Terms</Link>
                        <Link href="/contact" className="hover:text-indigo-600 transition-colors">Contact</Link>
                    </nav>

                    {/* Socials */}
                    <div className="flex items-center gap-4 text-[#202b20]">
                        <Link href="https://www.linkedin.com/company/joinemble/" target="_blank" className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all hover:scale-110" aria-label="LinkedIn">
                            <Linkedin className="w-5 h-5" />
                        </Link>
                        <Link href="https://x.com/joinEmble" target="_blank" className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all hover:scale-110" aria-label="X (Twitter)">
                            <Twitter className="w-5 h-5" />
                        </Link>
                        <Link href="https://www.instagram.com/emble.in/" target="_blank" className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all hover:scale-110" aria-label="Instagram">
                            <Instagram className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="w-full border-t border-gray-100 mt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 font-medium tracking-wide relative z-10 bg-gray-50">
                <div className="max-w-[1400px] mx-auto w-full px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p>© 2026 Emble. All rights reserved.</p>
                    <div className="flex items-center gap-4">
                        <p className="flex items-center gap-1">Made with <span className="text-red-500 font-bold">♥</span> for preparation</p>
                    </div>
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
                    {/* Intelligence Hub (Blogs) */}
                    <div className="flex flex-col gap-1.5">
                        <h3 className="text-white/30 font-semibold text-[10px] uppercase tracking-widest mb-1.5">Intelligence Hub</h3>
                        {blogPosts.slice(0, 15).map(post => (
                            <Link key={post.slug} href={`/blog/${post.slug}`} className="text-white/20 hover:text-white/60 text-[10px] leading-snug transition-colors line-clamp-1">{post.title}</Link>
                        ))}
                        {blogPosts.length > 15 && (
                            <Link href="/blog" className="text-[#ffa116]/40 hover:text-[#ffa116] text-[10px] font-bold uppercase tracking-tighter mt-1">View All Articles →</Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Massive Footer Branding */}
            <div className="w-full overflow-hidden flex justify-end items-center mt-8 pointer-events-none select-none pr-8 md:pr-12 bg-gray-50" aria-hidden="true">
                <div className="text-[15vw] leading-[0.8] font-[1000] text-gray-200/50 tracking-wider uppercase font-sans">
                    emble
                </div>
            </div>
        </footer>
    );
}
