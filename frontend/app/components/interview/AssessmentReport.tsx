import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, BarChart3, Download, RefreshCcw, Calendar, Clock, Mic, Video, Share2, ArrowLeft, Copy, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Types shared across the module
export interface SectionScore {
    section: string;
    score: number;
    feedback: string;
}

export interface VideoMetrics {
    technical: number;
    communication: number;
    problemSolving: number;
    overall: number;
    feedback: Array<{ type: 'strength' | 'improvement', text: string }>;
    transcript?: string;
    summary?: string;
    logs?: any;
    logUrl?: string;
}

export type AssessmentData =
    | { type: 'audio'; scores: SectionScore[]; date: Date; duration?: number }
    | { type: 'video'; metrics: VideoMetrics; date: Date; duration?: number };

interface AssessmentReportProps {
    data: AssessmentData;
    onRetry: () => void;
    onHome: () => void;
}

export default function AssessmentReport({ data, onRetry, onHome }: AssessmentReportProps) {

    // Calculate Overall Score
    let overallScore = 0;
    if (data.type === 'audio') {
        overallScore = Math.round(data.scores.reduce((acc, curr) => acc + curr.score, 0) / data.scores.length);
    } else {
        overallScore = data.metrics.overall;
    }

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-50 overflow-y-auto font-sans">
            <div className="max-w-5xl mx-auto px-6 py-12">

                {/* Top Nav */}
                <div className="flex justify-between items-center mb-12">
                    <Button variant="ghost" onClick={onHome} className="text-slate-500 hover:text-slate-900 gap-2">
                        <ArrowLeft size={16} /> Back to Dashboard
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-2"> <Download size={14} /> PDF </Button>
                        <Button variant="outline" size="sm" className="gap-2"> <Share2 size={14} /> Share </Button>
                    </div>
                </div>

                {/* Header Section */}
                <header className="text-center mb-12">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-block relative"
                    >
                        <div className="w-20 h-20 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-2xl rotate-3 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/20">
                            {data.type === 'audio' ? <Mic className="text-white w-10 h-10 -rotate-3" /> : <Video className="text-white w-10 h-10 -rotate-3" />}
                        </div>
                        <h1 className="text-4xl font-[900] text-slate-900 tracking-tight mb-2">
                            {data.type === 'audio' ? 'Communication Drill Report' : 'Mock Interview Analysis'}
                        </h1>
                        <div className="flex items-center justify-center gap-4 text-slate-500 text-sm font-medium">
                            <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(data.date)}</span>
                            {data.duration && <span className="flex items-center gap-1"><Clock size={14} /> {Math.floor(data.duration / 60)}m {data.duration % 60}s</span>}
                        </div>
                    </motion.div>
                </header>

                {/* Hero Score Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {/* Overall Score */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="md:col-span-1"
                    >
                        <Card className="h-full p-8 bg-slate-900 text-white flex flex-col items-center justify-center rounded-3xl shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 opacity-50" />
                            <div className="relative z-10 text-center">
                                <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300 block mb-4">Overall Performance</span>
                                <div className="text-7xl font-[900] tracking-tighter mb-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
                                    {overallScore}
                                </div>
                                <div className="text-sm font-medium text-slate-400">out of 100</div>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Breakdown / Insights */}
                    <div className="md:col-span-2 grid grid-cols-1 gap-4">
                        {data.type === 'audio' ? (
                            // AUDIO BREAKDOWN
                            <div className="grid grid-cols-1 gap-4 h-full">
                                {data.scores.map((s, i) => (
                                    <motion.div key={i} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}>
                                        <Card className="p-5 flex items-center justify-between border-l-4 border-l-indigo-500 shadow-sm hover:shadow-md transition-all">
                                            <div>
                                                <h3 className="font-bold text-slate-800">{s.section}</h3>
                                                <p className="text-xs text-slate-500 line-clamp-1">{s.feedback.substring(0, 60)}...</p>
                                            </div>
                                            <div className="text-xl font-black text-slate-900">{s.score}</div>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            // VIDEO METRICS
                            <div className="grid grid-cols-3 gap-4 h-full">
                                {Object.entries(data.metrics)
                                    .filter(([key, val]) => key !== 'overall' && typeof val === 'number')
                                    .map(([key, val], i) => (
                                        <Card key={key} className="p-6 flex flex-col items-center justify-center border-slate-200 shadow-sm hover:border-indigo-200 transition-colors">
                                            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center font-black text-slate-900 mb-3 border border-slate-100">
                                                {val as number}
                                            </div>
                                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                                                {key.replace(/([A-Z])/g, ' $1').trim()}
                                            </div>
                                        </Card>
                                    ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Deep Dive Feedback */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    <div className="lg:col-span-2 space-y-8">
                        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <BarChart3 className="text-indigo-600" /> Analysis & Feedback
                        </h3>

                        {data.type === 'audio' ? (
                            <div className="space-y-6">
                                {data.scores.map((s, i) => (
                                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                        <h4 className="font-bold text-slate-800 mb-2">{s.section} Feedback</h4>
                                        <div className="prose prose-sm text-slate-600">
                                            <ReactMarkdown>{s.feedback}</ReactMarkdown>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {data.metrics.feedback.map((item, i) => (
                                    <div key={i} className={`p-4 rounded-xl border flex gap-4 ${item.type === 'strength' ? 'bg-emerald-50/50 border-emerald-100' : 'bg-amber-50/50 border-amber-100'}`}>
                                        <div className={`mt-1 shrink-0 ${item.type === 'strength' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                            {item.type === 'strength' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                        </div>
                                        <div>
                                            <h5 className={`text-sm font-bold uppercase tracking-wider mb-1 ${item.type === 'strength' ? 'text-emerald-700' : 'text-amber-700'}`}>
                                                {item.type === 'strength' ? 'Key Strength' : 'Area for Improvement'}
                                            </h5>
                                            <p className="text-slate-700 text-sm">{item.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar Actions / Upsell */}
                    <div className="space-y-6">
                        <Card className="p-6 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-600/20 border-none">
                            <h3 className="font-bold text-lg mb-2">Mock Analysis Report</h3>
                            <p className="text-indigo-100 text-sm mb-6">
                                Your personalized AI report is ready below. Review strengths, gaps, and next steps.
                            </p>
                            <Button className="w-full bg-white text-indigo-600 hover:bg-indigo-50 font-bold border-none">
                                Download Summary
                            </Button>
                        </Card>
                    </div>
                </div>

                {data.type === 'video' && (data.metrics.summary || data.metrics.transcript || data.metrics.logs || data.metrics.logUrl) && (
                    <div className="space-y-6 mb-12">
                        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <BarChart3 className="text-indigo-600" /> Session Intelligence
                        </h3>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {data.metrics.summary && (
                                <Card className="p-6 border border-slate-200 rounded-2xl bg-white shadow-sm">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-bold text-slate-700">Executive Summary</h4>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full">Insight</span>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed">{data.metrics.summary}</p>
                                </Card>
                            )}
                            {data.metrics.logUrl && (
                                <Card className="p-6 border border-slate-200 rounded-2xl bg-white shadow-sm">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-bold text-slate-700">Diagnostics</h4>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-full">Emble AI</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mb-4">Open the raw simulation log stream for full telemetry.</p>
                                    <a
                                        className="text-sm text-indigo-600 hover:text-indigo-700 underline break-all"
                                        href={data.metrics.logUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {data.metrics.logUrl}
                                    </a>
                                </Card>
                            )}
                        </div>

                        {data.metrics.transcript && (
                            <Card className="p-6 border border-slate-200 rounded-2xl bg-white shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <FileText size={16} className="text-slate-500" />
                                        <h4 className="text-sm font-bold text-slate-700">Transcript</h4>
                                    </div>
                                    <button
                                        type="button"
                                        className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900"
                                        onClick={() => {
                                            if (typeof navigator === 'undefined') return;
                                            if (navigator.clipboard?.writeText) {
                                                navigator.clipboard.writeText(data.metrics.transcript || '');
                                                return;
                                            }
                                            try {
                                                const textarea = document.createElement('textarea');
                                                textarea.value = data.metrics.transcript || '';
                                                textarea.style.position = 'fixed';
                                                textarea.style.opacity = '0';
                                                document.body.appendChild(textarea);
                                                textarea.focus();
                                                textarea.select();
                                                document.execCommand('copy');
                                                document.body.removeChild(textarea);
                                            } catch (error) {
                                                console.warn('Clipboard copy failed', error);
                                            }
                                        }}
                                    >
                                        <Copy size={12} /> Copy
                                    </button>
                                </div>
                                <div className="max-h-72 overflow-y-auto pr-2 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                                    {data.metrics.transcript}
                                </div>
                            </Card>
                        )}

                        {data.metrics.logs && (
                            <Card className="p-6 border border-slate-200 rounded-2xl bg-white shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <BarChart3 size={16} className="text-slate-500" />
                                        <h4 className="text-sm font-bold text-slate-700">Conversation Timeline</h4>
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 border border-slate-200 px-2 py-1 rounded-full">Raw</span>
                                </div>
                                <div className="max-h-72 overflow-y-auto rounded-xl bg-slate-900 text-slate-100 text-xs p-4">
                                    <pre className="whitespace-pre-wrap">{typeof data.metrics.logs === 'string' ? data.metrics.logs : JSON.stringify(data.metrics.logs, null, 2)}</pre>
                                </div>
                            </Card>
                        )}
                    </div>
                )}

                <div className="flex justify-center">
                    <Button onClick={onRetry} size="lg" className="rounded-full px-8 h-14 bg-slate-900 text-white hover:bg-slate-800 font-bold shadow-xl transition-transform hover:-translate-y-1">
                        <RefreshCcw size={18} className="mr-2" /> Start New Session
                    </Button>
                </div>

            </div>
        </div>
    );
}
