"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { CATEGORIES, Category } from "@/lib/intelligence-data";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CategoryFilterProps {
    selectedCategory: Category | 'ALL';
    onSelect: (category: Category | 'ALL') => void;
}

export function CategoryFilter({ selectedCategory, onSelect }: CategoryFilterProps) {
    return (
        <div className="flex flex-wrap gap-2 pb-4 overflow-x-auto no-scrollbar mask-gradient-right">
            <Button
                variant={selectedCategory === 'ALL' ? "default" : "outline"}
                onClick={() => onSelect('ALL')}
                className={cn(
                    "rounded-full transition-all duration-300",
                    selectedCategory === 'ALL' ? "shadow-md scale-105" : "hover:bg-muted"
                )}
            >
                All Insights
            </Button>

            {CATEGORIES.map((category) => (
                <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    onClick={() => onSelect(category.id)}
                    className={cn(
                        "rounded-full transition-all duration-300 border-opacity-50",
                        selectedCategory === category.id
                            ? `shadow-md scale-105 bg-opacity-90 hover:bg-opacity-100`
                            : "hover:bg-muted text-muted-foreground",
                        // Dynamic color application if selected could go here, but using default variant for consistency for now
                        // or we can use the category.color for a subtle border/text effect
                    )}
                >
                    {category.label}
                </Button>
            ))}
        </div>
    );
}
