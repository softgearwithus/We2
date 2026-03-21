'use client';

import React, { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { Server, Database, Smartphone, Globe, Shield, ArrowRight, Save, RotateCcw, Play, CheckCircle2, Info, Layers, Cloud, HardDrive, Wifi } from 'lucide-react';

interface ComponentItem {
    id: string;
    type: string;
    icon: React.ElementType;
    label: string;
}

const availableComponents: ComponentItem[] = [
    { id: 'client', type: 'client', icon: Smartphone, label: 'Client App' },
    { id: 'lb', type: 'lb', icon: Layers, label: 'Load Balancer' },
    { id: 'web', type: 'server', icon: Globe, label: 'Web Server' },
    { id: 'app', type: 'server', icon: Server, label: 'App Server' },
    { id: 'cache', type: 'cache', icon: HardDrive, label: 'Redis Cache' },
    { id: 'db', type: 'db', icon: Database, label: 'SQL DB' },
    { id: 'cdn', type: 'cdn', icon: Cloud, label: 'CDN' },
    { id: 'queue', type: 'queue', icon: Wifi, label: 'Msg Queue' },
];

export default function SystemDesignTemplate() {
    const [canvasItems, setCanvasItems] = useState<ComponentItem[]>([]);
    const [isSimulating, setIsSimulating] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);

    const handleDrop = (item: ComponentItem) => {
        setCanvasItems([...canvasItems, { ...item, id: `${item.id}-${Date.now()}` }]);
    };

    const handleSimulate = () => {
        setIsSimulating(true);
        setFeedback(null);
        setTimeout(() => {
            setIsSimulating(false);
            // Simple logic check for demonstration
            const hasLB = canvasItems.some(i => i.type === 'lb');
            const hasDB = canvasItems.some(i => i.type === 'db');
            const hasServer = canvasItems.some(i => i.type === 'server');

            if (hasLB && hasDB && hasServer) {
                setFeedback('Great Design! You have scalable components.');
            } else {
                setFeedback('Design incomplete. Ensure you have a Server, Database, and Load Balancer.');
            }
        }, 2000);
    };

    const handleReset = () => {
        setCanvasItems([]);
        setFeedback(null);
    };

    return (
        <div className="h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden font-sans">
            {/* Left Sidebar: Component Palette */}
            <div className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 z-10">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="font-bold text-slate-800 flex items-center gap-2">
                        <Layers size={20} className="text-slate-800" />
                        Components
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Drag to build your architecture</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {availableComponents.map((comp) => (
                        <motion.div
                            key={comp.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="p-4 bg-slate-50 border border-slate-200 rounded-xl cursor-grab active:cursor-grabbing flex items-center gap-3 shadow-sm hover:shadow-md transition-all hover:bg-white"
                            onClick={() => handleDrop(comp)}
                        >
                            <div className="p-2 bg-white rounded-lg border border-slate-100 text-slate-600">
                                <comp.icon size={20} />
                            </div>
                            <span className="text-sm font-bold text-slate-700">{comp.label}</span>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Main Canvas Area */}
            <div className="flex-1 flex flex-col bg-slate-50/50 relative">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
                    <div>
                        <h1 className="text-lg font-bold text-slate-800">Design a URL Shortener</h1>
                        <p className="text-xs text-slate-500 font-medium">System Design &gt; Scalability</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleReset}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                        >
                            <RotateCcw size={16} /> Reset
                        </button>
                        <button
                            onClick={handleSimulate}
                            disabled={isSimulating}
                            className={`flex items-center gap-2 px-6 py-2 text-sm font-bold text-white rounded-lg transition-all shadow-lg shadow-slate-200 active:scale-95
                                ${isSimulating ? 'bg-slate-400 cursor-wait' : 'bg-slate-800 hover:bg-slate-500'}
                            `}
                        >
                            {isSimulating ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Play size={16} fill="currentColor" />
                            )}
                            {isSimulating ? 'Simulating...' : 'Run Simulation'}
                        </button>
                    </div>
                </header>

                {/* Canvas */}
                <div className="flex-1 relative overflow-auto p-8 custom-scrollbar">
                    <div className="absolute inset-0 opacity-[0.4] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px]"></div>

                    {canvasItems.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center opacity-40">
                                <Layers size={64} className="mx-auto mb-4 text-slate-400 animate-bounce" />
                                <h3 className="text-xl font-bold text-slate-600">Canvas Empty</h3>
                                <p className="text-slate-500">Add components from the sidebar to start designing.</p>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-8 items-start justify-center relative z-10 min-h-[500px]">
                        <Reorder.Group axis="x" values={canvasItems} onReorder={setCanvasItems} className="flex flex-wrap gap-8 justify-center">
                            {canvasItems.map((item) => (
                                <Reorder.Item key={item.id} value={item}>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="w-32 h-32 bg-white rounded-2xl border-2 border-slate-200 shadow-xl flex flex-col items-center justify-center gap-3 relative group hover:border-slate-400 transition-colors cursor-move"
                                    >
                                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-800">
                                            <item.icon size={24} />
                                        </div>
                                        <span className="text-xs font-bold text-slate-700">{item.label}</span>

                                        {/* Connection Points */}
                                        <div className="absolute -right-1 w-2 h-2 bg-slate-300 rounded-full group-hover:bg-slate-500"></div>
                                        <div className="absolute -left-1 w-2 h-2 bg-slate-300 rounded-full group-hover:bg-slate-500"></div>
                                    </motion.div>
                                </Reorder.Item>
                            ))}
                        </Reorder.Group>
                    </div>
                </div>

                {/* Feedback Overlay */}
                {feedback && (
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className={`absolute bottom-8 left-1/2 -translate-x-1/2 px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 text-white font-bold backdrop-blur-md z-50
                            ${feedback.includes('Great') ? 'bg-emerald-500/90' : 'bg-rose-500/90'}
                        `}
                    >
                        {feedback.includes('Great') ? <CheckCircle2 size={24} /> : <Info size={24} />}
                        {feedback}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
