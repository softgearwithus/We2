'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, ArrowLeft, Download, Share2 } from 'lucide-react';
import { SectionScore } from '../CommunicationAssessment';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';

interface ResultReportProps {
    scores: SectionScore[];
    onRestart: () => void;
    onBack: () => void;
}

export default function ResultReport({ scores, onRestart, onBack }: ResultReportProps) {
    const overallScore = Math.round(scores.reduce((acc, curr) => acc + curr.score, 0) / scores.length);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl space-y-8"
        >
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-slate-900">Assessment Report</h1>
                <p className="text-slate-500">Detailed analysis of your communication skills.</p>
            </div>

            {/* Overall Score Card */}
            <Card className="p-8 bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-xl rounded-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Overall Proficiency</h2>
                            <p className="text-indigo-100 max-w-md">
                                Based on your Reading, Listening, and Extempore performance.
                                {overallScore > 80 ? " Excellent command of the language!" : overallScore > 60 ? " Good proficiency with room for polish." : " Needs consistent practice."}
                            </p>
                        </div>

                        {(scores as any).some((s: any) => s.data?.communicationPersona || (Array.isArray(s.data) && s.data[0]?.communicationPersona)) && (
                            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30">
                                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-200">AI Persona</span>
                                <span className="text-sm font-semibold italic text-white">
                                    "{(scores as any).find((s: any) => s.data?.communicationPersona)?.data?.communicationPersona ||
                                        (scores as any).find((s: any) => Array.isArray(s.data) && s.data[0]?.communicationPersona)?.data?.[0]?.communicationPersona || 'Professional'}"
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center justify-center h-40 w-40 rounded-full border-8 border-white/20 bg-white/10 backdrop-blur-sm shadow-2xl">
                        <div className="text-center">
                            <span className="block text-5xl font-bold">{overallScore}</span>
                            <span className="text-xs opacity-70 uppercase tracking-tighter">Proficiency Score</span>
                        </div>
                    </div>
                </div>
            </Card>

            {/* AI Coaching Plan (Global) */}
            {(scores as any).some((s: any) => (Array.isArray(s.data) && s.data.some((d: any) => d.actionableCoaching)) || (s.data?.actionableCoaching)) && (
                <Card className="p-6 border-2 border-indigo-100 bg-indigo-50/30 rounded-2xl shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin-slow" />
                        Professional Improvement Plan
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Array.from(new Set(scores.flatMap(s => {
                            if (Array.isArray(s.data)) return s.data.flatMap((d: any) => d.actionableCoaching || []);
                            return (s.data as any)?.actionableCoaching || [];
                        }))).slice(0, 4).map((coach, i) => (
                            <div key={i} className="flex gap-3 bg-white p-3 rounded-xl border border-indigo-50">
                                <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                                <p className="text-xs text-slate-700 font-medium leading-relaxed">{coach}</p>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 gap-6">
                {scores.map((section, idx) => (
                    <Card key={idx} className="p-6 border-l-4 border-l-indigo-500 shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-slate-800">{section.section}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${section.score >= 80 ? 'bg-emerald-100 text-emerald-700' :
                                section.score >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                }`}>
                                Score: {section.score}
                            </span>
                        </div>

                        {/* Audio Playback for the section */}
                        {section.data && (
                            <div className="mb-4 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">Section Recording</p>
                                {Array.isArray(section.data) ? (
                                    <div className="space-y-2">
                                        {section.data.map((item: any, i: number) => {
                                            const hasBlob = item && item.blob instanceof Blob;
                                            return (
                                                <div key={i} className="flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-100">
                                                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded">Part {i + 1}</span>
                                                    {hasBlob ? (
                                                        <audio controls src={URL.createObjectURL(item.blob)} className="h-8 flex-1" />
                                                    ) : (
                                                        <span className="text-[10px] text-slate-400 italic">Recording not available in history</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    (() => {
                                        const blob = section.data?.blob || section.data;
                                        return blob instanceof Blob ? (
                                            <audio controls src={URL.createObjectURL(blob)} className="w-full h-10" />
                                        ) : (
                                            <span className="text-[10px] text-slate-400 italic px-2">Recording not available in history</span>
                                        );
                                    })()
                                )}
                            </div>
                        )}

                        {/* Content Comparison (if available in history/live analysis data) */}
                        {section.data && Array.isArray(section.data) && section.data[0]?.transcript && (
                            <div className="mb-6 space-y-4">
                                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Content Comparison</p>
                                <div className="space-y-3">
                                    {section.data.map((item: any, i: number) => (
                                        <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                            <div className="space-y-1">
                                                <p className="text-[10px] uppercase font-bold text-slate-400">Target Content (Part {i + 1})</p>
                                                <p className="text-xs text-slate-700 leading-relaxed italic">"{item.targetText || item.targetTopic || '---'}"</p>
                                            </div>
                                            <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-100 pt-2 md:pt-0 md:pl-3">
                                                <p className="text-[10px] uppercase font-bold text-indigo-400">Your Transcription</p>
                                                <p className="text-xs text-indigo-900 leading-relaxed">"{item.transcript || '---'}"</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Extempore Topic/Transcript */}
                        {section.section === 'Extempore' && !Array.isArray(section.data) && section.data?.transcript && (
                            <div className="mb-6 space-y-4">
                                <p className="text-xs font-semibold text-pink-600 uppercase tracking-wider">Topic vs Speech</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                    <div className="space-y-1">
                                        <p className="text-[10px] uppercase font-bold text-slate-400">Target Topic</p>
                                        <p className="text-xs text-slate-700 leading-relaxed italic">"{section.data.targetTopic || '---'}"</p>
                                    </div>
                                    <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-100 pt-2 md:pt-0 md:pl-3">
                                        <p className="text-[10px] uppercase font-bold text-pink-400">Your Transcription</p>
                                        <p className="text-xs text-pink-900 leading-relaxed">"{section.data.transcript || '---'}"</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Detailed Metrics Breakdown */}
                        {(() => {
                            const mainData = Array.isArray(section.data) ? section.data[0] : section.data;
                            if (!mainData?.metrics) return null;
                            const m = mainData.metrics;
                            const r = mainData.metricReasoning || {};

                            const metricList = [
                                { label: 'Fluency', value: m.fluency, reason: r.fluency },
                                { label: 'Pronunciation', value: m.pronunciation, reason: r.pronunciation },
                                { label: 'Confidence', value: m.confidence, reason: r.confidence },
                                { label: 'Grammar', value: m.grammar, reason: r.grammar },
                                { label: 'Vocabulary', value: m.vocabulary, reason: r.vocabulary }
                            ].filter(x => x.value !== undefined);

                            if (metricList.length === 0) return null;

                            return (
                                <div className="mb-6 space-y-4">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Metrics Breakdown</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {metricList.map((metric, i) => (
                                            <div key={i} className="space-y-1.5 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                                                <div className="flex justify-between items-center group relative">
                                                    <span className="text-xs font-bold text-slate-700">{metric.label}</span>
                                                    <span className="text-xs font-black text-indigo-600">{metric.value}%</span>
                                                    {metric.reason && (
                                                        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-20 w-48 p-2 bg-slate-900 text-white text-[10px] rounded shadow-xl">
                                                            {metric.reason}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${metric.value}%` }}
                                                        transition={{ duration: 1, delay: 0.5 }}
                                                        className={`h-full rounded-full ${metric.value >= 80 ? 'bg-emerald-500' :
                                                            metric.value >= 60 ? 'bg-indigo-500' : 'bg-rose-500'
                                                            }`}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}

                        <div className="prose prose-sm max-w-none text-slate-600 bg-slate-50 p-5 rounded-xl border border-slate-100 shadow-inner leading-relaxed">
                            <ReactMarkdown>{section.feedback}</ReactMarkdown>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="flex justify-center gap-4 pt-8 pb-12">
                <Button variant="outline" onClick={onBack} className="gap-2">
                    <ArrowLeft size={16} /> Back to Dashboard
                </Button>
                <Button variant="outline" className="gap-2">
                    <Download size={16} /> Download PDF
                </Button>
                <Button onClick={onRestart} className="bg-indigo-600 hover:bg-indigo-700 gap-2 shadow-lg">
                    <RefreshCw size={16} /> Take New Assessment
                </Button>
            </div>
        </motion.div>
    );
}
