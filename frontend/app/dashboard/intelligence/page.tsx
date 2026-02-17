"use client";

import React, { useState, useEffect } from "react";
import { NewsCard } from "@/components/intelligence/NewsCard";
import { CategoryFilter } from "@/components/intelligence/CategoryFilter";
import { ArticleView } from "@/components/intelligence/ArticleView";
import { MOCK_CONTENT, ContentItem, Category } from "@/lib/intelligence-data";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function IntelligencePage() {
    const [selectedCategory, setSelectedCategory] = useState<Category | 'ALL'>('ALL');
    const [selectedArticle, setSelectedArticle] = useState<ContentItem | null>(null);
    const [isArticleOpen, setIsArticleOpen] = useState(false);
    const [filteredContent, setFilteredContent] = useState<ContentItem[]>(MOCK_CONTENT);

    useEffect(() => {
        if (selectedCategory === 'ALL') {
            setFilteredContent(MOCK_CONTENT.filter(c => c.category !== 'DAILY_GROWTH'));
        } else {
            setFilteredContent(MOCK_CONTENT.filter(c => c.category === selectedCategory));
        }
    }, [selectedCategory]);

    const handleArticleClick = (item: ContentItem) => {
        setSelectedArticle(item);
        setIsArticleOpen(true);
    };

    return (
        <div className="max-w-6xl mx-auto min-h-screen pb-32 px-6 flex flex-col gap-8 pt-10 text-slate-900">

            {/* Premium Header Design */}
            <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 border-b border-slate-100/80 pb-8 relative">
                <div className="flex items-center gap-6 group">
                    <div className="relative">
                        <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center shadow-2xl shadow-slate-900/20 group-hover:scale-105 transition-transform duration-500">
                            <TrendingUp className="w-8 h-8 text-white relative z-10" />
                            <div className="absolute inset-0 bg-indigo-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-[2.75rem] font-black tracking-tight text-slate-900 leading-tight">
                            Synapse
                        </h1>
                        <div className="flex items-center gap-3 mt-1">
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
                                Signals Intelligence
                            </p>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                v4.2 Live
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row items-start sm:items-center gap-8 w-full xl:w-auto overflow-hidden">
                    <div className="hidden lg:flex items-center gap-8 pr-8 border-r border-slate-100 min-h-[2.5rem]">
                        <div className="flex flex-col items-end group cursor-pointer">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-600 transition-colors">Daily Streak</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-black text-slate-900">03</span>
                                <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-pulse" />
                            </div>
                        </div>
                        <div className="flex flex-col items-end group cursor-pointer">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-600 transition-colors">Authority</span>
                            <span className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">APEX RANK</span>
                        </div>
                    </div>
                    <div className="min-w-0 overflow-hidden">
                        <CategoryFilter
                            selectedCategory={selectedCategory}
                            onSelect={setSelectedCategory}
                        />
                    </div>
                </div>
            </header>

            {/* Signals Processing Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col">
                {/* Table Logic Headers */}
                <div className="px-10 py-6 bg-slate-50/50 border-b border-slate-100 flex items-center gap-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] select-none">
                    <div className="w-12 text-center">Sector</div>
                    <div className="flex-grow">Signal Intel & Intelligence Description</div>
                    <div className="w-32 text-center hidden md:block">Impact Analysis</div>
                    <div className="w-24 text-right pr-4 hidden sm:block">Processed</div>
                    <div className="w-10"></div>
                </div>

                {/* Vertical Signal Stream */}
                <div className="p-4 flex flex-col min-h-[500px]">
                    <AnimatePresence mode="popLayout" initial={false}>
                        {filteredContent.map((item, idx) => (
                            <NewsCard
                                key={item.id}
                                item={item}
                                onClick={handleArticleClick}
                                className={cn(idx === filteredContent.length - 1 && "border-b-0")}
                            />
                        ))}
                    </AnimatePresence>

                    {filteredContent.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="py-40 flex flex-col items-center gap-6 opacity-30 text-center"
                        >
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                                <Zap className="w-10 h-10 text-slate-300" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-lg font-black text-slate-900 uppercase tracking-widest">No Active Transmissions</p>
                                <p className="text-xs font-medium">Try recalibrating your sector frequency.</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedCategory('ALL')} className="font-bold underline text-xs mt-4 hover:bg-transparent text-slate-500">
                                RESET SYSTEM
                            </Button>
                        </motion.div>
                    )}
                </div>

                {/* System Diagnostics Footer */}
                <div className="px-10 py-5 bg-slate-50/30 border-t border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Neural Link: Active</span>
                    </div>
                    <div className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.4em]">
                        Synapse Intelligence v4.2.1
                    </div>
                </div>
            </div>

            <ArticleView
                article={selectedArticle}
                isOpen={isArticleOpen}
                onClose={() => setIsArticleOpen(false)}
            />
        </div>
    );
}
