"use client";

import React from 'react';
import { CATEGORIES, Category } from "@/lib/intelligence-data";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
    Layers,
    Cpu,
    TrendingUp,
    Zap,
    BookOpen,
    Sprout
} from "lucide-react";

interface CategoryFilterProps {
    selectedCategory: Category | 'ALL';
    onSelect: (category: Category | 'ALL') => void;
}

const CATEGORY_ICONS: Record<Category | 'ALL', React.ElementType> = {
    'ALL': Layers,
    'AI_NEWS': Cpu,
    'PLACEMENT_TRENDS': TrendingUp,
    'SKILL_INSIGHTS': Zap,
    'EDITORIAL': BookOpen,
    'DAILY_GROWTH': Sprout,
};

const CATEGORY_COLORS: Record<Category | 'ALL', string> = {
    'ALL': 'text-slate-600 bg-slate-100/50',
    'AI_NEWS': 'text-indigo-600 bg-indigo-50',
    'PLACEMENT_TRENDS': 'text-emerald-600 bg-emerald-50',
    'SKILL_INSIGHTS': 'text-amber-600 bg-amber-50',
    'EDITORIAL': 'text-blue-600 bg-blue-50',
    'DAILY_GROWTH': 'text-pink-600 bg-pink-50',
};

export function CategoryFilter({ selectedCategory, onSelect }: CategoryFilterProps) {
    return (
        <div className="w-full max-w-full overflow-hidden">
            <div className="flex items-center gap-2 pb-2 overflow-x-auto no-scrollbar mask-gradient-right p-1">
                <FilterPill
                    id="ALL"
                    label="All Signals"
                    isSelected={selectedCategory === 'ALL'}
                    onClick={() => onSelect('ALL')}
                />

                {CATEGORIES.map((category) => (
                    <FilterPill
                        key={category.id}
                        id={category.id}
                        label={category.label}
                        isSelected={selectedCategory === category.id}
                        onClick={() => onSelect(category.id)}
                    />
                ))}
            </div>
        </div>
    );
}

function FilterPill({ id, label, isSelected, onClick }: {
    id: Category | 'ALL';
    label: string;
    isSelected: boolean;
    onClick: () => void;
}) {
    const Icon = CATEGORY_ICONS[id];

    return (
        <button
            onClick={onClick}
            className={cn(
                "relative flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 font-bold text-[11px] uppercase tracking-wider whitespace-nowrap border select-none outline-none group",
                isSelected
                    ? `border-transparent ${CATEGORY_COLORS[id]} shadow-sm`
                    : "bg-white border-slate-100 text-slate-400 hover:border-slate-200 hover:text-slate-500 hover:bg-slate-50/50"
            )}
        >
            {isSelected && (
                <motion.div
                    layoutId="activeFilter"
                    className="absolute inset-0 rounded-xl bg-white/50 mix-blend-overlay"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
            )}

            <Icon className={cn(
                "w-3.5 h-3.5 transition-colors",
                isSelected ? "opacity-100" : "opacity-70 group-hover:opacity-100"
            )} />

            <span className="relative z-10">{label}</span>
        </button>
    );
}
