"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, ChevronRight, BookOpen, Clock, CalendarDays, Share2, Target, Zap } from "lucide-react";
import { ContentItem, CATEGORIES } from "@/lib/intelligence-data";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ArticleViewProps {
    article: ContentItem | null;
    isOpen: boolean;
    onClose: () => void;
}

export function ArticleView({ article, isOpen, onClose }: ArticleViewProps) {
    if (!article) return null;

    const category = CATEGORIES.find(c => c.id === article.category);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[90vh] p-0 overflow-hidden flex flex-col bg-white border-none shadow-2xl">
                {/* Clean Typography Header - No Images */}
                <div className="flex-shrink-0 w-full bg-slate-50 border-b border-slate-100 p-10 md:p-12 space-y-8">
                    <div className="flex flex-wrap items-center gap-4">
                        <Badge className={cn(
                            "px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest border-none shadow-sm",
                            "bg-slate-900 text-white"
                        )}>
                            {category?.label}
                        </Badge>
                        <div className="h-1 w-8 bg-indigo-600 rounded-full" />
                        <span className={cn(
                            "text-[10px] font-black uppercase tracking-[0.2em]",
                            article.impactTag?.includes('High') ? "text-red-600" :
                                article.impactTag?.includes('Medium') ? "text-orange-600" : "text-emerald-600"
                        )}>
                            {article.impactTag}
                        </span>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-[1.1] tracking-tight">
                        {article.title}
                    </h2>

                    <div className="flex flex-wrap items-center gap-8 pt-2">
                        <div className="flex items-center gap-2.5">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{article.readTime}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <CalendarDays className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-black text-slate-900 uppercase tracking-widest">
                                {new Date(article.date).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
                            </span>
                        </div>
                        <div className="flex items-center gap-2.5 ml-auto">
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest uppercase">System Signal ID: SYN-{article.id.slice(0, 4)}</span>
                        </div>
                    </div>
                </div>

                <ScrollArea className="flex-grow">
                    <div className="p-6 md:p-10 space-y-8">
                        {/* Section 1: Key Summary */}
                        <section className="bg-muted/30 p-6 rounded-xl border border-border/50">
                            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-primary">
                                <Zap className="w-5 h-5" /> Quick Intelligence
                            </h3>
                            <p className="text-lg leading-relaxed text-muted-foreground">
                                {article.deepKnowledge?.introduction || article.summary}
                            </p>
                        </section>

                        {/* Section 2: Deep Knowledge */}
                        {article.deepKnowledge && (
                            <section className="space-y-4">
                                <h3 className="text-2xl font-bold flex items-center gap-2">
                                    <BookOpen className="w-6 h-6 text-primary" /> Deep Dive
                                </h3>
                                <div className="space-y-3 pl-4 border-l-2 border-primary/20">
                                    {article.deepKnowledge.keyPoints.map((point, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-start gap-3"
                                        >
                                            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                            <p className="text-base">{point}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Section 3: Actionable Steps */}
                        {article.deepKnowledge?.whatNext && (
                            <section className="bg-primary/5 p-6 rounded-xl border border-primary/10">
                                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                                    <Target className="w-5 h-5" /> Your Next Moves
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {article.deepKnowledge.whatNext.map((step, idx) => (
                                        <div key={idx} className="bg-background p-4 rounded-lg shadow-sm border flex items-center gap-3">
                                            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs flex-shrink-0">
                                                {idx + 1}
                                            </span>
                                            <span className="text-sm font-medium">{step}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Relevance Meter */}
                        <section className="flex items-center justify-between p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-orange-700 dark:text-orange-400">Relevance Score</span>
                                <span className="text-xs text-muted-foreground">Based on your tech stack</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-32 bg-orange-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-orange-500" style={{ width: `${article.relevanceScore}%` }} />
                                </div>
                                <span className="font-bold text-orange-600">{article.relevanceScore}%</span>
                            </div>
                        </section>
                    </div>
                </ScrollArea>

                <DialogFooter className="p-6 border-t bg-background/95 backdrop-blur flex justify-between items-center w-full">
                    <Button variant="outline" className="gap-2">
                        <Share2 className="w-4 h-4" /> Share Insight
                    </Button>
                    <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all">
                        Mark as Read <CheckCircle2 className="w-4 h-4" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
