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
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar />
            <div className="max-w-7xl mx-auto px-6 pt-32 pb-24">
                
                {/* Header & Search Section */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-16">
                    <div>
                        <h1 className="text-[3rem] md:text-[5rem] font-[800] tracking-tighter text-gray-900 leading-[1.0] mb-5">
                            Resources for <br className="hidden md:block" />
                            <span className="font-serif italic font-normal text-gray-500">every interview.</span>
                        </h1>
                        <p className="text-[15px] md:text-[18px] text-gray-500 max-w-lg font-[500] leading-relaxed">
                            Whether you&apos;re hiring engineers or preparing to ace your next technical round — everything you need is here.
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="w-full lg:w-[400px]">
                        <div className="relative flex items-center bg-white border border-gray-200 rounded-full px-5 py-3.5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                            <Search className="w-5 h-5 text-gray-400 mr-3" />
                            <input 
                                type="text"
                                placeholder="Search resources..."
                                className="w-full bg-transparent outline-none font-medium text-[15px] text-gray-900 placeholder:text-gray-400"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-wrap items-center gap-3 mb-12">
                    <div className="flex items-center gap-2 mr-4 text-[13px] font-semibold tracking-wide text-gray-500 uppercase">
                        <Filter className="w-4 h-4" /> Filter By:
                    </div>
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-5 py-2 rounded-full text-[14px] font-medium transition-all ${
                                selectedCategory === category
                                ? 'bg-gray-900 text-white shadow-sm'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Blog Grid (Tiles) */}
                {filteredPosts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredPosts.map((post) => (
                            <Link 
                                key={post.slug} 
                                href={`/blog/${post.slug}`}
                                className="group bg-white border border-gray-100 rounded-3xl flex flex-col p-8 hover:shadow-lg transition-all h-full"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[12px] font-semibold tracking-wide">
                                        {post.category}
                                    </div>
                                    <div className="text-[12px] font-medium text-gray-400 flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" /> {post.readTime}
                                    </div>
                                </div>

                                <h2 className="text-[22px] font-bold text-gray-900 leading-[1.3] mb-4 group-hover:text-indigo-600 transition-colors">
                                    {post.title}
                                </h2>

                                <p className="text-[15px] text-gray-500 font-medium leading-relaxed mb-8 line-clamp-3">
                                    {post.excerpt}
                                </p>

                                <div className="mt-auto flex flex-wrap gap-2 mb-6">
                                    {post.keywords.slice(0, 3).map(kw => (
                                        <span key={kw} className="text-[12px] font-medium text-gray-400 bg-gray-50 border border-gray-100 rounded-md px-2 py-1">
                                            #{kw}
                                        </span>
                                    ))}
                                </div>

                                <div className="pt-5 border-t border-gray-100 flex items-center justify-between group/read mt-auto">
                                    <span className="text-[14px] font-semibold text-gray-900 group-hover/read:text-indigo-600 transition-colors">
                                        Read Article
                                    </span>
                                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover/read:text-indigo-600 group-hover/read:translate-x-1 transition-all" />
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="py-24 text-center border border-gray-200 bg-white rounded-3xl shadow-sm">
                        <div className="bg-gray-50 w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-6">
                            <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Articles Found</h3>
                        <p className="text-gray-500 font-medium">Try searching for different terms or adjust your category filter.</p>
                        <button 
                            onClick={() => {setSearchQuery(''); setSelectedCategory('All');}}
                            className="mt-8 px-8 py-3 bg-gray-900 text-white rounded-full font-semibold text-[15px] hover:bg-gray-800 transition-all"
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
