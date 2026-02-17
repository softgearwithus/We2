"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, BrainCircuit } from "lucide-react";
import { MOCK_CONTENT, CATEGORIES } from "@/lib/intelligence-data";
import Link from 'next/link';
import { motion } from "framer-motion";

export default function SynapseWidget() {
    // Get top 3 items, preferably one from AI, one from Trends
    const featuredItems = MOCK_CONTENT.slice(0, 3);

    return (
        <Card className="h-full flex flex-col border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/80 backdrop-blur-sm relative overflow-hidden group">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors duration-500"></div>

            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <BrainCircuit className="w-5 h-5 text-primary" />
                    </div>
                    Synapse Intelligence
                </CardTitle>
                <Link href="/dashboard/intelligence">
                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary gap-1">
                        View Hub <ArrowRight className="w-3 h-3" />
                    </Button>
                </Link>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col gap-4 relative z-10">
                {featuredItems.map((item, index) => {
                    const category = CATEGORIES.find(c => c.id === item.category);
                    return (
                        <Link key={item.id} href="/dashboard/intelligence">
                            <motion.div
                                whileHover={{ x: 4, backgroundColor: "rgba(0,0,0,0.02)" }}
                                className="flex items-start gap-3 p-2 rounded-lg transition-colors cursor-pointer"
                            >
                                <div className="mt-1 min-w-[4px] h-10 rounded-full bg-slate-200 overflow-hidden">
                                    <div className={`h-full w-full ${category?.color}`} />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <Badge variant="outline" className="text-[10px] px-1 py-0 h-5 border-none bg-slate-100 text-slate-600">
                                            {category?.label}
                                        </Badge>
                                        <span className="text-[10px] text-muted-foreground">{item.readTime}</span>
                                    </div>
                                    <h4 className="text-sm font-semibold line-clamp-1 leading-tight group-hover/item:text-primary transition-colors">
                                        {item.title}
                                    </h4>
                                </div>
                            </motion.div>
                        </Link>
                    );
                })}

                <div className="mt-auto pt-2">
                    <div className="bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 rounded-lg p-3 flex items-center gap-3 border border-violet-500/10">
                        <Sparkles className="w-4 h-4 text-violet-600 animate-pulse" />
                        <p className="text-xs font-medium text-violet-700">
                            Daily Tip: <span className="text-foreground/80 font-normal">Optimize your LinkedIn headline for ATS.</span>
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
