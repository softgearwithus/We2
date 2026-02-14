'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, Lock, Unlock, Hash, Box, RefreshCcw, Server, Users, Zap, Database, Globe, ShieldCheck, AlertCircle, HardDrive } from 'lucide-react';

interface Transaction {
    id: string;
    from: string;
    to: string;
    amount: number;
    timestamp: number;
}

interface Block {
    id: number;
    prevHash: string;
    hash: string;
    transactions: Transaction[];
    nonce: number;
    isMined: boolean;
}

const simulateHash = (id: number, prev: string, txs: Transaction[], nonce: number) => {
    const txRoot = txs.map(t => t.id).join('');
    const str = `${id}${prev}${txRoot}${nonce}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(64, '0');
};

export default function BlockchainTemplate() {
    const [difficulty, setDifficulty] = useState(2); // Number of leading zeros
    const [mempool, setMempool] = useState<Transaction[]>([
        { id: 'tx-001', from: 'Alice', to: 'Bob', amount: 5, timestamp: Date.now() },
        { id: 'tx-002', from: 'Bob', to: 'Charlie', amount: 2, timestamp: Date.now() + 100 },
    ]);

    const [nodes, setNodes] = useState<{ id: string, name: string, color: string }[]>([
        { id: 'n1', name: 'Frankfurt-01', color: 'indigo' },
        { id: 'n2', name: 'Bangalore-Alpha', color: 'emerald' },
        { id: 'n3', name: 'NY-Genesis', color: 'purple' },
    ]);

    const [chains, setChains] = useState<Record<string, Block[]>>({
        n1: [
            { id: 1, prevHash: '0'.repeat(64), hash: '003c...82f', transactions: [{ id: 'tx-g', from: 'GENESIS', to: 'ALL', amount: 100, timestamp: 0 }], nonce: 42, isMined: true }
        ],
        n2: [
            { id: 1, prevHash: '0'.repeat(64), hash: '003c...82f', transactions: [{ id: 'tx-g', from: 'GENESIS', to: 'ALL', amount: 100, timestamp: 0 }], nonce: 42, isMined: true }
        ],
        n3: [
            { id: 1, prevHash: '0'.repeat(64), hash: '003c...82f', transactions: [{ id: 'tx-g', from: 'GENESIS', to: 'ALL', amount: 100, timestamp: 0 }], nonce: 42, isMined: true }
        ]
    });

    const [miningNode, setMiningNode] = useState<string | null>(null);

    const difficultyString = useMemo(() => '0'.repeat(difficulty), [difficulty]);

    const addTransaction = (from: string, to: string, amount: number) => {
        const newTx: Transaction = {
            id: `tx-${Math.random().toString(36).substr(2, 5)}`,
            from,
            to,
            amount,
            timestamp: Date.now()
        };
        setMempool(prev => [...prev, newTx]);
    };

    const mineNextBlock = async (nodeId: string) => {
        if (mempool.length === 0) return;
        setMiningNode(nodeId);

        const currentChain = chains[nodeId];
        const prevBlock = currentChain[currentChain.length - 1];
        const newId = prevBlock.id + 1;
        const txsToInclude = [...mempool];

        // Simple mining simulation
        let nonce = 0;
        let hash = '';

        // Simulating the time it takes to mine
        await new Promise(resolve => setTimeout(resolve, 1500));

        while (true) {
            hash = simulateHash(newId, prevBlock.hash, txsToInclude, nonce);
            if (hash.startsWith(difficultyString)) break;
            nonce++;
            if (nonce > 5000) break; // Safety break for UI
        }

        const newBlock: Block = {
            id: newId,
            prevHash: prevBlock.hash,
            hash,
            transactions: txsToInclude,
            nonce,
            isMined: true
        };

        // Broadcast/Update all nodes (Consensus simulation)
        setChains(prev => {
            const updated = { ...prev };
            Object.keys(updated).forEach(nid => {
                updated[nid] = [...updated[nid], newBlock];
            });
            return updated;
        });

        setMempool([]);
        setMiningNode(null);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col overflow-hidden">

            {/* Glossy Header */}
            <header className="h-20 bg-slate-900 shadow-2xl border-b border-white/5 flex items-center justify-between px-10 z-30">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
                        <Globe size={24} className="text-white animate-pulse-slow" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tighter uppercase">Chain Simulator v4</h1>
                        <p className="text-[10px] font-bold text-slate-500 tracking-[0.2em]">MULTINODE NETWORK CONTEXT</p>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-xl border border-white/5">
                        <span className="text-[10px] font-black text-slate-500 uppercase">Difficulty</span>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4].map(d => (
                                <button
                                    key={d}
                                    onClick={() => setDifficulty(d)}
                                    className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black transition-all ${difficulty === d ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500 hover:text-slate-300'}`}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={() => addTransaction('System', 'Node', Math.floor(Math.random() * 50))}
                        className="px-5 py-2.5 bg-white text-slate-900 rounded-xl font-black text-xs hover:bg-slate-200 transition-all flex items-center gap-2"
                    >
                        <Zap size={14} fill="currentColor" /> INJECT TX
                    </button>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">

                {/* Right Panel: Mempool & Transactions */}
                <div className="w-96 bg-slate-900/50 border-r border-white/5 flex flex-col shrink-0">
                    <div className="p-6 border-b border-white/5">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                <Database size={14} /> Mempool
                            </h2>
                            <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-md text-[10px] font-bold">{mempool.length} Pending</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium">Verified transactions waiting for mining</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        <AnimatePresence>
                            {mempool.map(tx => (
                                <motion.div
                                    key={tx.id}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    className="p-4 bg-slate-800/40 border border-white/5 rounded-2xl flex items-center justify-between group hover:border-indigo-500/30 transition-all"
                                >
                                    <div>
                                        <div className="text-[10px] font-black text-slate-500 uppercase mb-1">TXID: {tx.id}</div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-slate-200">{tx.from}</span>
                                            <Link2 size={12} className="text-slate-600" />
                                            <span className="text-sm font-bold text-slate-200">{tx.to}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-black text-emerald-400">+{tx.amount} BTC</div>
                                        <div className="text-[9px] font-bold text-slate-600">Verified</div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {mempool.length === 0 && (
                            <div className="h-40 flex flex-col items-center justify-center text-slate-600 gap-3 opacity-40">
                                <RefreshCcw size={32} />
                                <p className="text-[10px] font-black uppercase tracking-widest">Waiting for traffic...</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Center: Network Visualizer */}
                <div className="flex-1 flex flex-col bg-slate-950 p-10 overflow-auto">

                    {/* Active Nodes Hub */}
                    <div className="grid grid-cols-1 gap-12 max-w-5xl mx-auto w-full">
                        {nodes.map(node => (
                            <div key={node.id} className="space-y-6">
                                <div className="flex items-center justify-between bg-slate-900/40 p-5 rounded-3xl border border-white/5 backdrop-blur-xl">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 bg-${node.color}-500/20 rounded-2xl flex items-center justify-center text-${node.color}-400 border border-${node.color}-500/20 shadow-xl shadow-${node.color}-500/10`}>
                                            <Server size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-200 text-lg">{node.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`w-1.5 h-1.5 bg-${node.color}-400 rounded-full animate-pulse`}></span>
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Node ID: {node.id.toUpperCase()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Synchronized Height</p>
                                            <p className="text-xl font-mono font-black text-slate-300">#{chains[node.id].length}</p>
                                        </div>
                                        <button
                                            disabled={!!miningNode || mempool.length === 0}
                                            onClick={() => mineNextBlock(node.id)}
                                            className={`px-6 py-3 rounded-2xl font-black text-xs flex items-center gap-2 transition-all active:scale-95
                                                ${miningNode === node.id
                                                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                                                    : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl shadow-indigo-600/20'}
                                                ${(!!miningNode || mempool.length === 0) && miningNode !== node.id ? 'opacity-30 cursor-not-allowed grayscale' : ''}
                                            `}
                                        >
                                            {miningNode === node.id ? (
                                                <><RefreshCcw size={14} className="animate-spin" /> Mining...</>
                                            ) : (
                                                <><Link2 size={14} /> Mine Block</>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Node's Individual Chain */}
                                <div className="flex items-start gap-4 overflow-x-auto pb-4 custom-scrollbar">
                                    {chains[node.id].map((block, idx) => (
                                        <div key={block.id} className="flex shrink-0 items-center">
                                            <motion.div
                                                initial={{ scale: 0.9, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className="w-72 bg-slate-900 border border-white/5 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden group"
                                            >
                                                {/* Block HUD */}
                                                <div className="absolute top-0 right-0 p-4 opacity-50">
                                                    <Box size={48} strokeWidth={1} className="text-slate-700" />
                                                </div>

                                                <h4 className="font-black text-indigo-400 text-sm mb-4 flex items-center gap-2">
                                                    BLOCK #{block.id} <ShieldCheck size={14} className="text-emerald-500" />
                                                </h4>

                                                <div className="space-y-4 relative z-10">
                                                    <div>
                                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Previous Hash</label>
                                                        <div className="font-mono text-[9px] text-slate-400 bg-black/40 p-2 rounded-xl truncate">{block.prevHash}</div>
                                                    </div>

                                                    <div>
                                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Transactions ({block.transactions.length})</label>
                                                        <div className="max-h-24 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                                                            {block.transactions.map((tx, i) => (
                                                                <div key={i} className="text-[10px] text-slate-200 bg-white/5 p-1.5 rounded-lg border border-white/5 flex justify-between">
                                                                    <span>{tx.from} &rarr; {tx.to}</span>
                                                                    <span className="font-bold text-indigo-400">{tx.amount}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="pt-2">
                                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Block Hash</label>
                                                        <div className="font-mono text-[9px] text-emerald-400 bg-emerald-500/5 p-2 rounded-xl border border-emerald-500/10 break-all leading-tight">
                                                            {block.hash}
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-between items-center pt-2">
                                                        <span className="text-[9px] font-black text-slate-600 bg-slate-800 px-2 py-0.5 rounded uppercase tracking-widest">Nonce: {block.nonce}</span>
                                                        <div className="flex items-center gap-1 text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                                                            <Lock size={10} /> Immutable
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>

                                            {idx < chains[node.id].length - 1 && (
                                                <div className="w-10 h-px bg-gradient-to-r from-indigo-500/50 to-transparent"></div>
                                            )}
                                        </div>
                                    ))}

                                    {miningNode === node.id && (
                                        <div className="flex shrink-0 items-center">
                                            <div className="w-10 h-px bg-slate-800 border-dashed border-t"></div>
                                            <div className="w-72 h-64 bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-[2rem] flex flex-col items-center justify-center text-slate-600 gap-4 animate-pulse">
                                                <RefreshCcw size={32} className="animate-spin-slow" />
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Mining next block...</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Network Status Footer */}
            <footer className="h-10 bg-slate-900 border-t border-white/5 flex items-center justify-between px-10 shrink-0">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Network Consensus: 100% (Synched)</span>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                    <span>Protocol: Proof-of-Sim</span>
                    <span className="opacity-30">•</span>
                    <span>Relay Version: 2.0.4-LTS</span>
                </div>
            </footer>
        </div>
    );
}
