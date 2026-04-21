'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { blogPosts } from '@/app/lib/blog-data';
import { Clock, Tag, Search, Filter, ArrowRight } from 'lucide-react';
import Navbar from '@/app/components/layout/Navbar';
import Footer from '@/app/components/layout/Footer';

// SEO helper to get unique categories
const categories = ['All', 'Technology', 'Industry', 'Product', 'Enterprise'];

export default function BlogPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const filteredPosts = useMemo(() => {
        return blogPosts.filter(post => {
            const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 post.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, selectedCategory]);

    return (
        <div className="min-h-screen bg-[#efeff1] font-sans">
            <Navbar />
            <div className="max-w-7xl mx-auto px-6 pt-32 pb-24">
                
                {/* Header & Search Section */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-16">
                    <div>
                        <h1 className="text-[3rem] md:text-[5rem] font-[300] tracking-tighter text-[#202b20] leading-[1.0] mb-5">
                            Resources for <br className="hidden md:block" />
                            <span className="font-black">every interview.</span>
                        </h1>
                        <p className="text-[15px] md:text-[18px] text-[#202b20]/55 max-w-lg font-[440] leading-relaxed">
                            Whether you&apos;re hiring engineers or preparing to ace your next technical round — everything you need is here.
                        </p>
                    </div>


                    {/* Search Bar */}
                    <div className="w-full lg:w-[400px] relative group">
                        <div className="absolute inset-0 bg-[#202b20] translate-x-2 translate-y-2 group-focus-within:translate-x-3 group-focus-within:translate-y-3 transition-all"></div>
                        <div className="relative flex items-center bg-white border-4 border-[#202b20] px-4 py-3">
                            <Search className="w-6 h-6 text-[#202b20] mr-3" />
                            <input 
                                type="text"
                                placeholder="Search by subject (Python, AI...)"
                                className="w-full bg-transparent outline-none font-black uppercase tracking-widest text-[14px] placeholder:text-[#202b20]/30"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-wrap items-center gap-3 mb-12">
                    <div className="flex items-center gap-2 mr-4 text-[12px] font-black uppercase tracking-widest text-[#202b20]/40">
                        <Filter className="w-4 h-4" /> Filter By:
                    </div>
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-6 py-2 border-2 border-[#202b20] text-[12px] font-black uppercase tracking-widest transition-all ${
                                selectedCategory === category 
                                ? 'bg-[#202b20] text-white shadow-none translate-x-1 translate-y-1' 
                                : 'bg-white text-[#202b20] shadow-[4px_4px_0px_0px_#202b20] hover:translate-x-1 hover:translate-y-1 hover:shadow-none'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Blog Grid (Tiles) */}
                {filteredPosts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredPosts.map((post) => (
                            <Link 
                                key={post.slug} 
                                href={`/blog/${post.slug}`}
                                className="group bg-white border-2 border-[#202b20] shadow-[6px_6px_0px_0px_#202b20] flex flex-col p-6 hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[10px_10px_0px_0px_#ffa116] transition-all h-full"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="px-2 py-0.5 bg-[#ffa116] border-2 border-[#202b20] text-[9px] uppercase font-black tracking-widest text-[#202b20]">
                                        {post.category}
                                    </div>
                                    <div className="text-[9px] font-black uppercase tracking-widest text-[#202b20]/40 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {post.readTime}
                                    </div>
                                </div>

                                <h2 className="text-[20px] font-black text-[#202b20] leading-[1.2] mb-3 group-hover:text-[#ffa116] transition-colors">
                                    {post.title}
                                </h2>

                                <p className="text-[13px] text-[#202b20]/70 font-[500] leading-relaxed mb-6 line-clamp-2">
                                    {post.excerpt}
                                </p>

                                <div className="mt-auto flex flex-wrap gap-1.5 mb-6">
                                    {post.keywords.slice(0, 3).map(kw => (
                                        <span key={kw} className="text-[8px] font-black uppercase tracking-tighter text-[#202b20]/30 border border-[#202b20]/10 px-1.5 py-0.5 bg-[#efeff1]">
                                            #{kw}
                                        </span>
                                    ))}
                                </div>

                                <div className="pt-4 border-t-2 border-[#202b20]/5 flex items-center justify-between group/read">
                                    <span className="text-[11px] font-black uppercase tracking-widest group-hover/read:text-[#ffa116] transition-colors">
                                        Open Article
                                    </span>
                                    <ArrowRight className="w-4 h-4 group-hover/read:translate-x-1 transition-all" />
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="py-32 text-center border-4 border-dashed border-[#202b20]/20 bg-white shadow-[8px_8px_0px_0px_#202b20]/5">
                        <div className="bg-[#ffa116] w-16 h-16 mx-auto flex items-center justify-center border-4 border-[#202b20] shadow-[4px_4px_0_0_#202b20] mb-6">
                            <Search className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-widest text-[#202b20] mb-2">No Articles Found</h3>
                        <p className="text-[#202b20]/50 font-medium">Try searching for subjects like "Python", "Scale", or "Hiring".</p>
                        <button 
                            onClick={() => {setSearchQuery(''); setSelectedCategory('All');}}
                            className="mt-8 px-8 py-3 bg-[#202b20] text-white font-black uppercase tracking-widest text-sm shadow-[4px_4px_0_0_#ffa116] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                        >
                            Reset Search
                        </button>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}
