'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Code2, Terminal, Cpu, ArrowRight, Loader2, Globe, Zap } from 'lucide-react';

interface Language {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    bg: string;
}

export default function ProgrammingPage() {
    const [languages, setLanguages] = useState<Language[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLanguages = async () => {
            try {
                // Fetch the 'programming-languages' topic which contains our metadata
                const response = await fetch('http://localhost:3001/course-content/programming-languages');
                if (response.ok) {
                    const text = await response.text();
                    if (text) {
                        const data = JSON.parse(text);
                        if (data && data.content) {
                            setLanguages(JSON.parse(data.content));
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch languages", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLanguages();
    }, []);

    const getIcon = (iconName: string) => {
        switch (iconName) {
            case 'python': return <Terminal size={32} />;
            case 'javascript': return <Globe size={32} />;
            case 'java': return <Code2 size={32} />;
            case 'cpp': return <Cpu size={32} />;
            case 'go': return <Zap size={32} />;
            default: return <Code2 size={32} />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-indigo-600" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 lg:p-10 max-w-[1600px] mx-auto">
            <div className="mb-12">
                <Link href="/dashboard/skillforge" className="text-sm font-bold text-slate-500 hover:text-indigo-600 mb-4 inline-block transition-colors">
                    ← Back to Skill Forge
                </Link>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">
                    Programming Tracks
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl">
                    Select a language to begin your journey. Our rigorous curriculum is designed to take you from basics to advanced concepts.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {languages.map((lang, index) => (
                    <motion.div
                        key={lang.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Link href={`/dashboard/skillforge/programming/${lang.id}`} className="block h-full group">
                            <div className="bg-white h-full p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 relative overflow-hidden">
                                <div className={`absolute top-0 right-0 p-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${lang.bg.replace('/10', '/30')}`}></div>

                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${lang.bg} ${lang.color} mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                                    {getIcon(lang.icon)}
                                </div>

                                <h2 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                                    {lang.name}
                                </h2>
                                <p className="text-slate-500 font-medium leading-relaxed mb-8">
                                    {lang.description}
                                </p>

                                <div className="flex items-center gap-2 text-sm font-bold text-slate-400 group-hover:text-indigo-600 transition-colors mt-auto">
                                    Start Track <ArrowRight size={16} />
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
