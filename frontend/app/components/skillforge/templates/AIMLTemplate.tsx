'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RefreshCw, Zap, Brain, Activity, Settings2, BarChart2, Database, Layers, Info } from 'lucide-react';

type DatasetType = 'Basic' | 'XOR' | 'Circle' | 'Linear';
type ActivationType = 'ReLU' | 'Sigmoid' | 'Tanh';

export default function AIMLTemplate() {
    const [epochs, setEpochs] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [loss, setLoss] = useState(0.5);
    const [accuracy, setAccuracy] = useState(0.5);
    const [learningRate, setLearningRate] = useState(0.01);
    const [layers, setLayers] = useState([4, 6, 4, 1]); // Input, Hidden 1, Hidden 2, Output
    const [dataset, setDataset] = useState<DatasetType>('Basic');
    const [activation, setActivation] = useState<ActivationType>('ReLU');
    const [activeNeuron, setActiveNeuron] = useState<{ layer: number, index: number } | null>(null);

    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRunning) {
            interval = setInterval(() => {
                setEpochs(e => e + 1);
                // Smarter simulation based on learning rate and dataset
                const convergenceFactor = dataset === 'XOR' ? 0.995 : 0.98;
                const lrMultiplier = 1 + (learningRate * 2);

                setLoss(l => {
                    const nextLoss = Math.max(0.005, l * (convergenceFactor / lrMultiplier));
                    return nextLoss;
                });

                setAccuracy(a => {
                    const nextAcc = Math.min(0.99, a + (1 - a) * (0.02 * lrMultiplier));
                    return nextAcc;
                });

                // Update canvas visualization (simulating data flowing)
                drawNetwork();
            }, 100);
        }
        return () => clearInterval(interval);
    }, [isRunning, learningRate, dataset]);

    const drawNetwork = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Implementation of animated lines or points could go here
        // For now, we'll use Framer Motion for the UI-level neurson
    };

    const handleReset = () => {
        setIsRunning(false);
        setEpochs(0);
        setLoss(0.5);
        setAccuracy(0.5);
    };

    const getNeuronValue = (layer: number) => {
        if (!isRunning) return 0;
        // Mock activation value
        return Math.random() * (1 - loss);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans p-6 lg:p-10 flex flex-col relative overflow-hidden">

            {/* Ambient Background Glow */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-slate-500/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-slate-500/10 rounded-full blur-[100px]"></div>

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-slate-700 via-slate-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200">
                        <Brain size={28} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter">Neural Lab V2</h1>
                        <p className="text-slate-400 text-sm font-medium">Deep Neural Network Architect & Visualizer</p>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-4">
                    <div className="px-5 py-2.5 bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 flex items-center gap-4">
                        <div className="space-y-0.5">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Network Score</p>
                            <p className={`text-lg font-mono font-bold ${accuracy > 0.8 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {(accuracy * 100).toFixed(1)}%
                            </p>
                        </div>
                        <div className="h-8 w-px bg-slate-800"></div>
                        <div className="space-y-0.5">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Convergence</p>
                            <p className="text-lg font-mono font-bold text-slate-400">
                                {loss < 0.1 ? 'High' : 'Medium'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Controls Sidebar */}
                <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800/50 rounded-[2.5rem] p-7 lg:col-span-1 space-y-10 shadow-2xl overflow-y-auto">

                    {/* Hyperparameters */}
                    <section>
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <Settings2 size={14} className="animate-spin-slow" /> Configuration
                        </h2>

                        <div className="space-y-8">
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <label className="text-xs font-bold text-slate-300">Learning Rate</label>
                                    <span className="bg-slate-500/10 text-slate-400 px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border border-slate-400/20">{learningRate.toFixed(3)}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0.001"
                                    max="0.1"
                                    step="0.001"
                                    value={learningRate}
                                    onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                                    className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-slate-500"
                                />
                                <div className="flex justify-between mt-2 text-[9px] font-bold text-slate-600">
                                    <span>Stable</span>
                                    <span>Aggressive</span>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-300 mb-3 block">Activation Function</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['ReLU', 'Sigmoid', 'Tanh'] as ActivationType[]).map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setActivation(type)}
                                            className={`py-2 rounded-xl text-[10px] font-black tracking-wider transition-all border
                                                ${activation === type
                                                    ? 'bg-slate-800 border-slate-400 text-white shadow-lg shadow-slate-200'
                                                    : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:text-slate-300'}
                                            `}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-300 mb-3 block">Training Dataset</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(['Basic', 'XOR', 'Circle', 'Linear'] as DatasetType[]).map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setDataset(type)}
                                            className={`py-2 px-3 rounded-xl text-[10px] font-black tracking-wider transition-all border flex items-center justify-center gap-2
                                                ${dataset === type
                                                    ? 'bg-slate-800 border-slate-500 text-white shadow-lg shadow-slate-600/20'
                                                    : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:text-slate-300'}
                                            `}
                                        >
                                            <Database size={12} /> {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-300 mb-3 block">Architecture</label>
                                <div className="flex flex-col gap-2">
                                    <button onClick={() => setLayers([4, 6, 1])} className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${layers.length === 3 ? 'bg-slate-800 border-slate-400 text-white' : 'bg-slate-800/30 border-slate-800 text-slate-500 hover:bg-slate-800/60'}`}>
                                        <Layers size={14} /> 1 Hidden Layer
                                    </button>
                                    <button onClick={() => setLayers([4, 8, 8, 1])} className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${layers.length === 4 ? 'bg-slate-800 border-slate-400 text-white' : 'bg-slate-800/30 border-slate-800 text-slate-500 hover:bg-slate-800/60'}`}>
                                        <Layers size={14} /> 2 Hidden Layers (Deep)
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="pt-2">
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setIsRunning(!isRunning)}
                                className={`py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-2xl active:scale-95
                                    ${isRunning
                                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30 hover:bg-amber-500/20'
                                        : 'bg-slate-800 text-white hover:bg-slate-500 shadow-slate-200 border-none'}
                                `}
                            >
                                {isRunning ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                                {isRunning ? 'Stop' : 'Run Lab'}
                            </button>
                            <button
                                onClick={handleReset}
                                className="py-4 bg-slate-800/50 hover:bg-slate-800 text-white border border-slate-700 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                            >
                                <RefreshCw size={18} /> Reset
                            </button>
                        </div>
                    </div>
                </div>

                {/* Visualization Area */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-[2.5rem] p-10 lg:col-span-3 relative overflow-hidden flex flex-col shadow-2xl">

                    {/* Stats HUD */}
                    <div className="absolute top-8 right-10 flex gap-8 z-20">
                        <div className="px-4 py-2 bg-slate-950/80 rounded-2xl border border-slate-800/50 backdrop-blur-md">
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Training Epochs</p>
                            <p className="text-2xl font-mono font-black text-slate-400 leading-none">{epochs.toString().padStart(4, '0')}</p>
                        </div>
                        <div className="px-4 py-2 bg-slate-950/80 rounded-2xl border border-slate-800/50 backdrop-blur-md">
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Loss Gradient</p>
                            <p className="text-2xl font-mono font-black text-rose-500 leading-none">{loss.toFixed(6)}</p>
                        </div>
                    </div>

                    <div className="absolute top-8 left-10 flex flex-col gap-2 z-20">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-slate-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]"></div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Activation Flow</span>
                        </div>
                        <AnimatePresence>
                            {activeNeuron && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2"
                                >
                                    <Info size={12} className="text-slate-400" />
                                    <span className="text-[10px] font-bold text-slate-300">Neuron L{activeNeuron.layer} - Weight: {(1 - loss).toFixed(3)}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex-1 flex items-center justify-around gap-12 py-12 relative z-10">
                        {/* Neuron Layers */}
                        {layers.map((neuronCount, layerIndex) => (
                            <div key={layerIndex} className="flex flex-col items-center gap-6 relative">
                                <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.3em] absolute -top-12 whitespace-nowrap bg-slate-900 px-3 py-1 rounded-full border border-slate-800 shadow-sm">
                                    {layerIndex === 0 ? 'Input' : layerIndex === layers.length - 1 ? 'Output' : `Hidden ${layerIndex}`}
                                </p>

                                {Array.from({ length: neuronCount }).map((_, nIndex) => {
                                    const activationVal = getNeuronValue(layerIndex);
                                    return (
                                        <motion.div
                                            key={nIndex}
                                            onHoverStart={() => setActiveNeuron({ layer: layerIndex, index: nIndex })}
                                            onHoverEnd={() => setActiveNeuron(null)}
                                            className={`w-12 h-12 md:w-16 md:h-16 rounded-3xl flex items-center justify-center border-2 shadow-2xl z-10 transition-all duration-500 cursor-help relative group
                                                ${layerIndex === 0
                                                    ? 'bg-slate-900 border-slate-700'
                                                    : layerIndex === layers.length - 1
                                                        ? 'bg-emerald-500/10 border-emerald-500 shadow-emerald-500/20'
                                                        : 'bg-slate-800/10 border-slate-400 shadow-slate-200'}
                                            `}
                                        >
                                            {/* Pulse ring for active training */}
                                            {isRunning && layerIndex !== 0 && (
                                                <motion.div
                                                    className={`absolute inset-0 rounded-3xl border ${layerIndex === layers.length - 1 ? 'border-emerald-500' : 'border-slate-400'}`}
                                                    animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                                                    transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                                                />
                                            )}

                                            <Activity size={20} className={`
                                                ${layerIndex === 0 ? 'text-slate-600' : layerIndex === layers.length - 1 ? 'text-emerald-400' : 'text-slate-400'}
                                                ${isRunning ? 'animate-pulse' : 'opacity-40'}
                                            `} />

                                            {/* Activation Indicator */}
                                            {layerIndex !== 0 && (
                                                <div className="absolute -right-1 -bottom-1 w-5 h-5 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-center">
                                                    <div
                                                        className={`w-2 h-2 rounded-full ${layerIndex === layers.length - 1 ? 'bg-emerald-400' : 'bg-slate-400'}`}
                                                        style={{ opacity: activationVal }}
                                                    ></div>
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}

                                {/* Connection SVG Container */}
                                {layerIndex < layers.length - 1 && (
                                    <svg className="absolute top-1/2 left-[calc(100%+0.5rem)] w-[calc(100%-1rem)] h-[300px] -translate-y-1/2 pointer-events-none overflow-visible z-0 opacity-40">
                                        {Array.from({ length: neuronCount }).map((_, srcI) => (
                                            Array.from({ length: layers[layerIndex + 1] }).map((_, destI) => (
                                                <line
                                                    key={`${srcI}-${destI}`}
                                                    x1="0"
                                                    y1={`${(srcI - (neuronCount - 1) / 2) * 50 + 150}px`}
                                                    x2="100%"
                                                    y2={`${(destI - (layers[layerIndex + 1] - 1) / 2) * 50 + 150}px`}
                                                    stroke={isRunning ? (layerIndex === layers.length - 2 ? "rgba(16, 185, 129, 0.4)" : "rgba(99, 102, 241, 0.4)") : "rgba(51, 65, 85, 0.15)"}
                                                    strokeWidth={isRunning ? Math.max(0.5, (1 - loss) * 2) : "1"}
                                                    className="transition-all duration-300"
                                                />
                                            ))
                                        ))}
                                    </svg>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Integrated mini-chart at bottom */}
                    <div className="h-32 w-full mt-auto flex items-end gap-1 px-4 border-t border-slate-800/30 pt-4">
                        {Array.from({ length: 48 }).map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: 10 }}
                                animate={{ height: isRunning ? Math.max(10, (1 - loss) * 80 + Math.random() * 10) : 10 }}
                                className={`flex-1 rounded-t-sm ${i > 40 ? 'bg-slate-500/40' : 'bg-slate-800/40'}`}
                            ></motion.div>
                        ))}
                        <div className="absolute bottom-4 left-10 text-[9px] font-black text-slate-500 uppercase tracking-widest">Real-time Loss Landscape</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

