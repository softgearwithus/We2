'use client';

import React from 'react';
import Link from 'next/link';
import { Terminal, Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="relative z-10 py-16 bg-white text-brand-black border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-10">
                    <div className="space-y-6 lg:col-span-2">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-8 h-8 bg-brand-black rounded flex items-center justify-center group-hover:bg-brand-orange transition-colors duration-300">
                                <Terminal size={18} className="text-white" strokeWidth={3} />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-brand-black">
                                EMBLE
                            </span>
                        </Link>
                        <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                            The complete <strong className="text-brand-black">Full-Stack Bootcamp</strong>. Bridge the gap between academic learning and industry expectations in one unified platform.
                        </p>
                    </div>

                    {/* Footer Links */}
                    {[
                        {
                            title: 'Product',
                            links: [
                                { label: 'Bootcamp Curriculum', href: '/curriculum' },
                                { label: 'How it Works', href: '/how-it-works' },
                                { label: 'Pricing', href: '/pricing' },
                                { label: 'AI Mentors', href: '/ai-mentors' }
                            ]
                        },
                        {
                            title: 'Company',
                            links: [
                                { label: 'Our Mission', href: '/about' },
                                { label: 'Success Stories', href: '/stories' },
                                { label: 'Careers', href: '/careers' },
                                { label: 'Contact', href: '/contact' }
                            ]
                        },
                        {
                            title: 'Resources',
                            links: [
                                { label: 'Documentation', href: '/docs' },
                                { label: 'Terms of Service', href: '/terms' },
                                { label: 'Privacy Policy', href: '/privacy' },
                                { label: 'System Status', href: '/status' }
                            ]
                        }
                    ].map((col) => (
                        <div key={col.title}>
                            <h6 className="text-brand-black font-bold mb-6 text-sm uppercase tracking-wider">{col.title}</h6>
                            <ul className="space-y-4 text-sm text-gray-500">
                                {col.links.map((link) => (
                                    <li key={link.label}>
                                        <Link href={link.href} className="hover:text-brand-orange transition-colors">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Contact Info Column */}
                    <div>
                        <h6 className="text-brand-black font-bold mb-6 text-sm uppercase tracking-wider">Contact Us</h6>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li>
                                <a href="mailto:emblehelpcare@gmail.com" className="hover:text-brand-orange transition-colors">
                                    emblehelpcare@gmail.com
                                </a>
                            </li>
                            <li>
                                <span className="cursor-default">
                                    +91 1xxxxx
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-medium text-gray-400 uppercase tracking-widest">
                    <Link href="/copyright" className="hover:text-brand-orange transition-colors group">
                        © 2026 EMBLE Technologies. <span className="group-hover:underline normal-case tracking-normal ml-2">View Copyright & Policies</span>
                    </Link>
                    <div className="flex gap-8">
                        <Link href="#" className="hover:text-brand-black transition-colors"><Linkedin size={18} /></Link>
                        <Link href="#" className="hover:text-brand-black transition-colors"><Twitter size={18} /></Link>
                        <Link href="#" className="hover:text-brand-black transition-colors"><Github size={18} /></Link>
                    </div>
                </div>
            </div>
        </footer >
    );
}
