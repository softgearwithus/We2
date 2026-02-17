"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ContentItem } from "@/lib/intelligence-data";

interface DailyPulseProps {
    nugget: ContentItem;
    onClose?: () => void;
    onView?: () => void;
}

export function DailyPulse({ nugget, onClose, onView }: DailyPulseProps) {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-8"
            >
                <Card className="bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border-violet-500/20 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2">
                        {onClose && (
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={onClose}>
                                <X className="w-3 h-3" />
                            </Button>
                        )}
                    </div>

                    <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
                        <div className="flex-shrink-0 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-2xl p-4 shadow-inner">
                            <Sparkles className="w-8 h-8 text-white animate-pulse" />
                        </div>

                        <div className="flex-grow space-y-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/30 px-2 py-0.5 rounded-full">
                                    Daily Growth Pulse
                                </span>
                                <span className="text-xs text-muted-foreground">• {nugget.readTime}</span>
                            </div>
                            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400">
                                {nugget.title}
                            </h3>
                            <p className="text-sm text-foreground/80 max-w-2xl">
                                {nugget.summary}
                            </p>
                        </div>

                        <div className="flex-shrink-0 mt-4 md:mt-0">
                            <Button onClick={onView} className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-md hover:shadow-lg transition-all">
                                Unlocked Today <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </AnimatePresence>
    );
}
