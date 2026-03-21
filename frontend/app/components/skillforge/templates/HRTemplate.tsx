'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Mic, Send, User, Bot, ThumbsUp, Sparkles, Youtube, BarChart3 } from 'lucide-react';

interface Message {
    id: string;
    sender: 'user' | 'bot';
    text: string;
    suggestions?: string[];
}

interface HRTemplateProps {
    title: string;
    description: string;
    initialMessages: Message[];
}

export default function HRTemplate({
    title,
    description,
    initialMessages
}: HRTemplateProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [input, setInput] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;
        const newUserMsg: Message = { id: Date.now().toString(), sender: 'user', text: input };
        setMessages([...messages, newUserMsg]);
        setInput('');

        // Mock Bot Response with realistic delay
        setTimeout(() => {
            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                sender: 'bot',
                text: "That's a great answer! You demonstrated confidence. Try to be more specific about your role in the team project.",
                suggestions: ['Give an example', 'Rephrase response']
            };
            setMessages(prev => [...prev, botMsg]);
        }, 1500);
    };

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col lg:flex-row gap-8 p-6 lg:p-10 max-w-full max-w-[1920px] mx-auto bg-slate-50/50">
            {/* Left Panel: Context & Video Reference */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-full lg:w-full max-w-full max-w-[400px] flex flex-col gap-6 shrink-0"
            >
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                    <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-lg text-xs font-bold uppercase tracking-wider mb-4 inline-block shadow-sm">
                        Behavioral Interview
                    </span>
                    <h1 className="text-3xl font-black text-slate-900 mb-3 leading-tight">{title}</h1>
                    <p className="text-slate-500 leading-relaxed mb-6 font-medium">{description}</p>

                    <div className="flex flex-wrap gap-2 text-xs font-bold">
                        {['Confidence', 'Clarity', 'Structure'].map((tag, i) => (
                            <span key={i} className="px-3 py-1.5 bg-slate-100/80 text-slate-600 rounded-lg border border-slate-200">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Video Resource Card */}
                <div className="bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-900/20 relative aspect-video flex items-center justify-center group cursor-pointer border border-slate-800">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                    <img loading="lazy" decoding="async" src="/api/placeholder/600/400" alt="Video Thumbnail" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-500 transform group-hover:scale-105" />

                    <div className="relative z-20 w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg border border-white/30">
                        <Youtube className="text-white fill-white" size={28} />
                    </div>

                    <div className="absolute bottom-5 left-6 right-6 z-20 text-white">
                        <p className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-1">Recommended Watch</p>
                        <p className="font-bold text-lg leading-tight">Mastering the "{title}" Question</p>
                    </div>
                </div>

                {/* AI Feedback Stats */}
                <div className="bg-gradient-to-br from-slate-600 to-violet-700 rounded-[2rem] p-6 text-white shadow-xl shadow-slate-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                    <div className="relative z-10">
                        <h3 className="font-bold flex items-center gap-2 mb-4 text-lg">
                            <Sparkles size={20} className="text-amber-300" /> AI Feedback Analysis
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs font-bold opacity-80 mb-1">
                                    <span>Pace</span>
                                    <span>Optimal</span>
                                </div>
                                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-400 w-[85%] rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs font-bold opacity-80 mb-1">
                                    <span>Tone</span>
                                    <span>Confident</span>
                                </div>
                                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-400 w-[92%] rounded-full shadow-[0_0_10px_rgba(251,191,36,0.5)]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Right Panel: Premium Chat Interface */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/40 flex flex-col overflow-hidden relative"
            >
                {/* Header */}
                <div className="h-20 border-b border-slate-100 bg-white/80 backdrop-blur-md flex justify-between items-center px-8 shrink-0 z-20 sticky top-0">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-tr from-slate-700 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200">
                                <Bot size={24} className="text-white" />
                            </div>
                            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></span>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg">AI Interviewer</h3>
                            <p className="text-xs text-slate-700 font-bold bg-slate-50 px-2 py-0.5 rounded-full inline-block">HR Manager Persona</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-800 transition-colors">
                            <BarChart3 size={20} />
                        </button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/50 scroll-smooth custom-scrollbar">
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex gap-4 max-w-[85%] lg:max-w-[75%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-md transform transition-transform hover:scale-105
                                    ${msg.sender === 'user'
                                        ? 'bg-white border border-slate-200 text-slate-700'
                                        : 'bg-gradient-to-tr from-slate-700 to-violet-600 text-white'}
                                `}>
                                    {msg.sender === 'user' ? <User size={20} /> : <Bot size={20} />}
                                </div>
                                <div className="space-y-2">
                                    <div className={`p-5 rounded-[1.5rem] text-[15px] leading-relaxed shadow-sm
                                        ${msg.sender === 'user'
                                            ? 'bg-slate-800 text-white rounded-tr-none shadow-slate-200'
                                            : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-slate-200'}
                                    `}>
                                        {msg.text}
                                    </div>
                                    {msg.suggestions && (
                                        <div className="flex gap-2 flex-wrap animate-fadeIn">
                                            {msg.suggestions.map((s, i) => (
                                                <button key={i} className="text-xs font-bold text-slate-800 bg-white border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
                                                    ✨ {s}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 bg-white border-t border-slate-100">
                    <div className="flex items-center gap-3 bg-slate-50/80 p-2 rounded-[1.5rem] border border-slate-200 focus-within:border-slate-400 focus-within:ring-4 focus-within:ring-slate-200 transition-all shadow-inner">
                        <input
                            type="text"
                            className="flex-1 bg-transparent border-none outline-none text-slate-900 px-4 placeholder:text-slate-400 font-medium text-base h-12"
                            placeholder="Type your answer clearly..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <div className="flex items-center gap-2 pr-2">
                            <button
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isRecording ? 'bg-red-50 text-red-500 animate-pulse border border-red-200' : 'hover:bg-white text-slate-400 hover:text-slate-600'}`}
                                onClick={() => setIsRecording(!isRecording)}
                            >
                                <Mic size={20} />
                            </button>
                            <button
                                className="w-12 h-10 bg-slate-800 text-white rounded-xl shadow-lg shadow-slate-200 hover:bg-slate-900 hover:scale-105 transition-all flex items-center justify-center active:scale-95"
                                onClick={handleSend}
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                    <p className="text-center text-xs font-medium text-slate-400 mt-3 flex items-center justify-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> AI is analyzing your response tone and content
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
