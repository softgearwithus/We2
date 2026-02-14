import React from 'react';
import { motion } from 'framer-motion';
import { Users, Server, Database, Globe, Share2, ShieldCheck, Zap } from 'lucide-react';

export default function SystemDesignPage() {
    return (
        <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <div className="w-16 h-16 bg-indigo-100 rounded-3xl flex items-center justify-center text-indigo-600 mb-6 mx-auto">
                    <Users size={32} />
                </div>
                <h1 className="text-4xl font-black text-slate-900 mb-2">System Design Lab</h1>
                <p className="text-slate-500 font-medium max-w-lg">Architect scalable, reliable, and high-performance systems.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full">
                {[
                    { title: 'Load Balancing', icon: Zap, desc: 'Distribute incoming traffic across multiple servers.' },
                    { title: 'Database Sharding', icon: Database, desc: 'Horizontal scaling for massive datasets.' },
                    { title: 'Microservices', icon: Server, desc: 'Decoupled architecture for independent scaling.' },
                    { title: 'CDN & Caching', icon: Globe, desc: 'Reducing latency for global users.' },
                    { title: 'Rate Limiting', icon: ShieldCheck, desc: 'Protecting services from abuse.' },
                    { title: 'Messaging Queues', icon: Share2, desc: 'Asynchronous communication between services.' },
                ].map((item, i) => (
                    <motion.div
                        key={item.title}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-100 transition-all cursor-pointer group"
                    >
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <item.icon size={24} />
                        </div>
                        <h3 className="font-black text-lg text-slate-900 mb-2">{item.title}</h3>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                    </motion.div>
                ))}
            </div>

            <div className="mt-16 p-8 bg-slate-900 rounded-[3rem] w-full max-w-4xl text-center text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                    <Share2 size={120} />
                </div>
                <h2 className="text-2xl font-bold mb-4">Interactive System Builder</h2>
                <p className="text-slate-400 mb-8 font-medium">Coming Soon: Drag-and-drop components to build and test your architecture.</p>
                <button className="px-8 py-3 bg-indigo-500 hover:bg-indigo-400 rounded-2xl font-black text-sm transition-all shadow-xl shadow-indigo-500/20">
                    Join Early Access
                </button>
            </div>
        </div>
    );
}
