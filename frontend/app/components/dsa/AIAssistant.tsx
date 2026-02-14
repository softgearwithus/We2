'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Zap, Bug, BookOpen, Loader2 } from 'lucide-react';

interface PredefinedPrompt {
    id: string;
    label: string;
    icon: React.ElementType;
    prompt: string;
}

const QUICK_ACTIONS: PredefinedPrompt[] = [
    { id: 'hint', label: 'Get Hint', icon: Sparkles, prompt: 'Can you give me a hint for this problem without solving it?' },
    { id: 'explain', label: 'Explain Code', icon: BookOpen, prompt: 'Can you explain the current code logic?' },
    { id: 'complexity', label: 'Time Complexity', icon: Zap, prompt: 'What is the time complexity of this solution?' },
    { id: 'debug', label: 'Find Bugs', icon: Bug, prompt: 'Are there any potential bugs or edge cases I missed?' },
];

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export default function AIAssistant() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: "Hi! I'm your AI coding assistant. I can help you with hints, complexity analysis, or debugging. How can I assist you today?",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSendMessage = async (text: string) => {
        if (!text.trim()) return;

        const newUserMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newUserMsg]);
        setInput('');
        setIsTyping(true);

        // Simulate AI Response Delay
        setTimeout(() => {
            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: generateMockResponse(text),
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiResponse]);
            setIsTyping(false);
        }, 1500);
    };

    const generateMockResponse = (text: string): string => {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('hint')) {
            return "Have you considered using a hash map to store the indices of the elements you've already visited? This could allow you to look up the complement in O(1) time.";
        }
        if (lowerText.includes('explain')) {
            return "The current code attempts to iterate through the array. However, it seems to be using a nested loop approach which results in O(n^2) time complexity. We can optimize this.";
        }
        if (lowerText.includes('complexity')) {
            return "The time complexity of the brute force approach is O(n^2) because of the nested loops. The space complexity is O(1). If we use a Hash Map, we can improve Time to O(n) and Space to O(n).";
        }
        if (lowerText.includes('bug')) {
            return "Check line 15. You might be accessing an index out of bounds if the array is empty. Consider adding a check for array length at the beginning.";
        }
        return "I see. That's an interesting approach. Could you elaborate on why you chose this data structure?";
    };

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'assistant'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-300 text-slate-600'
                            }`}>
                            {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
                        </div>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${msg.role === 'assistant'
                            ? 'bg-white border border-slate-200 text-slate-700 shadow-sm rounded-tl-none'
                            : 'bg-indigo-600 text-white shadow-md rounded-tr-none'
                            }`}>
                            {msg.content}
                            <div className={`text-[10px] mt-1 ${msg.role === 'assistant' ? 'text-slate-400' : 'text-indigo-200'
                                }`}>
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                            <Bot size={16} />
                        </div>
                        <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Actions (only show if not typing) */}
            {!isTyping && (
                <div className="px-4 pb-2">
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {QUICK_ACTIONS.map(action => (
                            <button
                                key={action.id}
                                onClick={() => handleSendMessage(action.prompt)}
                                className="flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 bg-white border border-indigo-100 text-indigo-600 rounded-full text-xs font-medium hover:bg-indigo-50 hover:border-indigo-200 transition-colors shadow-sm"
                            >
                                <action.icon size={12} />
                                {action.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-slate-200">
                <div className="relative flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(input)}
                        placeholder="Ask anything about the problem..."
                        className="flex-1 bg-slate-100 border-transparent focus:bg-white border focus:border-indigo-500 rounded-full px-4 py-2.5 text-sm outline-none transition-all placeholder:text-slate-400"
                        disabled={isTyping}
                    />
                    <button
                        onClick={() => handleSendMessage(input)}
                        disabled={!input.trim() || isTyping}
                        className="p-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-200"
                    >
                        {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                </div>
            </div>
        </div>
    );
}
