"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Bookmark, Share2, MoreHorizontal, ArrowRight, Zap } from "lucide-react";
import { ContentItem, CATEGORIES } from "@/lib/intelligence-data";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ShortFeedItemProps {
    item: ContentItem;
    onClick: (item: ContentItem) => void;
}

export function ShortFeedItem({ item, onClick }: ShortFeedItemProps) {
    const category = CATEGORIES.find(c => c.id === item.category);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="mb-8"
        >
            <Card
                className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow bg-card/50 backdrop-blur-sm cursor-pointer group"
                onClick={() => onClick(item)}
            >
                <div className="flex flex-col md:flex-row">
                    {/* Image Section - Larger in Feed View */}
                    <div className="md:w-1/3 h-48 md:h-auto relative overflow-hidden">
                        {item.imageUrl ? (
                            <img
                                src={item.imageUrl}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                        ) : (
                            <div className={`w-full h-full ${category?.color} opacity-20 flex items-center justify-center`}>
                                <span className="text-4xl">⚡</span>
                            </div>
                        )}
                        <div className="absolute top-4 left-4">
                            <Badge className={cn("bg-background/90 text-foreground backdrop-blur-md shadow-sm")}>
                                {category?.label}
                            </Badge>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 p-6 flex flex-col justify-between">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center text-xs text-muted-foreground gap-2">
                                    <Clock className="w-3 h-3" />
                                    <span>{item.readTime}</span>
                                    <span>•</span>
                                    <span>{new Date(item.date).toLocaleDateString()}</span>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="w-4 h-4" />
                                </Button>
                            </div>

                            <h3 className="text-2xl font-bold leading-tight group-hover:text-primary transition-colors">
                                {item.title}
                            </h3>

                            <p className="text-muted-foreground line-clamp-2 md:line-clamp-3">
                                {item.summary}
                            </p>

                            {item.deepKnowledge?.keyPoints && (
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {item.deepKnowledge.keyPoints.slice(0, 2).map((point, idx) => (
                                        <Badge key={idx} variant="secondary" className="bg-secondary/50 font-normal">
                                            <Zap className="w-3 h-3 mr-1 text-yellow-500" /> {point}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="pt-6 flex justify-between items-center mt-auto">
                            <div className="flex gap-2">
                                <Badge variant="outline" className="border-primary/20 text-primary">
                                    {item.impactTag}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-4">
                                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); }} className="hover:text-primary">
                                    <Bookmark className="w-5 h-5" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); }} className="hover:text-primary">
                                    <Share2 className="w-5 h-5" />
                                </Button>
                                <Button size="sm" className="gap-2 group-hover:translate-x-1 transition-transform">
                                    Read Full Insight <ArrowRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}
