'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, Bot, ChevronDown, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
    role: 'user' | 'model';
    text: string;
}

export default function GlobalAiAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', text: "Hi there! I'm **Emble AI**. \n\nI can help you with:\n- Choosing the right plan\n- Understanding our Bootcamp vs Simulation\n- Technical doubts or career advice\n\nHow can I help you today?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            // Convert messages to history format for backend
            // Backend expects: { role: "user" | "model", parts: [{ text: string }] }
            const history = messages.map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            }));

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg.text,
                    history: history
                })
            });

            const data = await response.json();

            // Handle simple string response or object response
            const botText = typeof data.response === 'string' ? data.response :
                (data.response?.text || "I'm having trouble thinking right now.");

            setMessages(prev => [...prev, { role: 'model', text: botText }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'model', text: "⚠️ Network error. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] font-sans border-4 border-red-500">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="absolute bottom-20 right-0 w-[90vw] md:w-[400px] h-[600px] max-h-[80vh] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 bg-brand-black text-white flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                                    <Sparkles size={20} className="text-brand-orange" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg leading-tight">Emble Assistant</h3>
                                    <div className="flex items-center gap-1.5 opacity-60 text-xs font-medium">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Online & Ready
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <ChevronDown size={20} />
                            </button>
                        </div>

                        {/* Chat Area */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 scroll-smooth"
                        >
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                            ? 'bg-brand-black text-white rounded-br-none'
                                            : 'bg-white border border-gray-100 text-gray-700 rounded-bl-none'
                                            }`}
                                    >
                                        <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-headings:my-2 prose-ul:my-1">
                                            <ReactMarkdown
                                                components={{
                                                    a: ({ node, ...props }) => <a {...props} className="text-brand-orange underline" target="_blank" rel="noopener noreferrer" />
                                                }}
                                            >
                                                {msg.text}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                                        <Loader2 size={16} className="animate-spin text-brand-orange" />
                                        <span className="text-xs text-gray-400 font-medium">Thinking...</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="flex items-center gap-2"
                            >
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask anything about Emble..."
                                    className="flex-1 h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-brand-orange focus:bg-white focus:ring-2 focus:ring-brand-orange/10 outline-none transition-all text-sm font-medium"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className="h-12 w-12 rounded-xl bg-brand-orange text-white flex items-center justify-center hover:bg-brand-orange-hover active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-orange/20"
                                >
                                    <Send size={20} />
                                </button>
                            </form>
                            <div className="text-center mt-2">
                                <p className="text-[10px] text-gray-400 font-medium">
                                    AI can make mistakes. Check important info.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all ${isOpen
                    ? 'bg-white text-brand-black border border-gray-200'
                    : 'bg-brand-black text-white border-4 border-white/20'
                    }`}
            >
                {isOpen ? <X size={28} /> : <Sparkles size={28} className="text-brand-orange" />}
            </motion.button>
        </div>
    );
}
