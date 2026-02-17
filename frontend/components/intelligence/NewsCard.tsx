"use client";

import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Clock, Bookmark, ArrowRight, Sparkles } from "lucide-react";
import { ContentItem, CATEGORIES } from "@/lib/intelligence-data";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface NewsCardProps {
    item: ContentItem;
    onClick: (item: ContentItem) => void;
    className?: string;
}

export function NewsCard({ item, onClick, className }: NewsCardProps) {
    const category = CATEGORIES.find(c => c.id === item.category);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
            transition={{ duration: 0.2 }}
            className={cn(
                "w-full px-8 py-5 flex items-center gap-8 border-b border-slate-100 hover:border-slate-300 transition-all cursor-pointer group rounded-2xl",
                className
            )}
            onClick={() => onClick(item)}
        >
            {/* Sector Indicator - Precise & Professional */}
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-white border border-transparent group-hover:border-slate-200 group-hover:shadow-sm transition-all duration-300">
                <Sparkles className={cn(
                    "w-6 h-6 transition-transform duration-500 group-hover:scale-110",
                    item.category === 'AI_NEWS' ? "text-indigo-500" :
                        item.category === 'PLACEMENT_TRENDS' ? "text-emerald-500" :
                            item.category === 'SKILL_INSIGHTS' ? "text-amber-500" :
                                item.category === 'EDITORIAL' ? "text-blue-500" :
                                    item.category === 'DAILY_GROWTH' ? "text-pink-500" : "text-slate-400"
                )} />
            </div>

            {/* Signal Description - High Density */}
            <div className="flex-grow min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-4 mb-1">
                    <h3 className="font-bold text-[17px] text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                        {item.title}
                    </h3>
                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest px-2.5 h-5 border-slate-200 text-slate-400 bg-white shadow-sm shrink-0">
                        {category?.label}
                    </Badge>
                </div>
                <p className="text-sm text-slate-400 font-medium truncate opacity-70 group-hover:opacity-100 transition-opacity">
                    {item.summary}
                </p>
            </div>

            {/* Impact - LeetCode "Difficulty" Aesthetic */}
            <div className="flex-shrink-0 w-32 hidden md:flex flex-col items-center">
                <span className={cn(
                    "text-[11px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full",
                    item.impactTag?.includes('High') ? "text-red-600 bg-red-50/50" :
                        item.impactTag?.includes('Medium') ? "text-orange-600 bg-orange-50/50" : "text-emerald-600 bg-emerald-50/50"
                )}>
                    {item.impactTag?.split(' ')[0]} IMPACT
                </span>
            </div>

            {/* Metadata Processing - Minimalist */}
            <div className="flex-shrink-0 w-24 hidden sm:flex flex-col items-end justify-center">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Clock className="w-4 h-4 text-slate-300" />
                    <span className="text-[11px] font-black text-slate-900">{item.readTime}</span>
                </div>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">
                    {new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </span>
            </div>

            {/* Quick Link - Precise Interaction */}
            <div className="flex-shrink-0 flex items-center justify-center w-10">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-slate-300 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all duration-300">
                    <ArrowRight className="w-5 h-5 translate-x-0 group-hover:translate-x-1 transition-transform" />
                </div>
            </div>
        </motion.div>
    );
}
