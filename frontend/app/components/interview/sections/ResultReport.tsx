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
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Overall Proficiency</h2>
                        <p className="text-indigo-100 max-w-md">
                            Based on your Reading, Listening, and Extempore performance.
                            {overallScore > 80 ? " Excellent command of the language!" : overallScore > 60 ? " Good proficiency with room for polish." : " Needs consistent practice."}
                        </p>
                    </div>
                    <div className="flex items-center justify-center h-32 w-32 rounded-full border-8 border-white/20 bg-white/10 backdrop-blur-sm">
                        <span className="text-4xl font-bold">{overallScore}</span>
                        <span className="text-sm opacity-70 ml-1">/100</span>
                    </div>
                </div>
            </Card>

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
                        <div className="prose prose-sm max-w-none text-slate-600 bg-slate-50 p-4 rounded-lg">
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
