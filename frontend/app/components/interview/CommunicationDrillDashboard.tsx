'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, AlertCircle, History, PlayCircle, BarChart3, ChevronRight, Calendar, RefreshCcw } from 'lucide-react';
import CommunicationAssessment, { DrillContent, SectionScore } from './CommunicationAssessment';
import ResultReport from './sections/ResultReport';
import { toast } from 'sonner';
import { useAuth } from '@/app/context/AuthContext';
import { format } from 'date-fns';

interface CommunicationDrillDashboardProps {
    onBack?: () => void;
    initialTab?: 'new' | 'history';
}

export default function CommunicationDrillDashboard({ onBack, initialTab = 'new' }: CommunicationDrillDashboardProps) {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [drillContent, setDrillContent] = useState<DrillContent | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'new' | 'history'>(initialTab);
    const [history, setHistory] = useState<any[]>([]);
    const [selectedHistoryItem, setSelectedHistoryItem] = useState<any | null>(null);

    // Fetch history on mount
    useEffect(() => {
        if (activeTab === 'history') {
            fetchHistory();
        }
    }, [activeTab]);


    const fetchHistory = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/interviews/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch history');
            const data = await response.json();

            // Filter for communication drills (using BEHAVIORAL type as proxy per backend logic)
            // Include COMPLETED (with analysis) AND IN_PROGRESS (processing)
            const drills = data.filter((item: any) =>
                item.type === 'behavioral' && (item.analysis || item.status === 'in_progress')
            );
            setHistory(drills.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } catch (err) {
            console.error(err);
            toast.error("Could not load history.");
        } finally {
            setIsLoading(false);
        }
    };

    const generateDrill = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/interviews/communication/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ topic: "" }) // Auto-generate theme
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to generate drill');
            }

            const data = await response.json();
            setDrillContent(data);
            toast.success("New communication drill generated!");
        } catch (err: any) {
            console.error(err);
            setError(err.message);
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDrillComplete = (scores: SectionScore[]) => {
        // Refresh history if we go back
        if (activeTab === 'history') fetchHistory();
        toast.success("Communication Drill Completed!");
    };

    // Render detailed view from history
    if (selectedHistoryItem) {
        // Map backend analysis structure to frontend SectionScore[]
        // Analysis structure from backend: { reading: [...], listening: [...], extempore: {...}, overallScore: number }
        const analysis = selectedHistoryItem.analysis;

        // Safety check if analysis structure matches expected
        if (!analysis || !analysis.reading) {
            return (
                <div className="p-8 text-center">
                    <p className="text-red-500">Invalid analysis data format.</p>
                    <Button onClick={() => setSelectedHistoryItem(null)} className="mt-4">Back</Button>
                </div>
            )
        }

        const scores: SectionScore[] = [
            {
                section: 'Reading',
                score: Math.round(analysis.reading.reduce((acc: any, curr: any) => acc + (curr.overallScore || 0), 0) / (analysis.reading.length || 1)),
                feedback: analysis.reading.length > 0
                    ? analysis.reading.map((r: any, i: number) => `### Passage ${i + 1}\n${r.feedback || "Analysis completed."}`).join('\n\n---\n\n')
                    : "Detailed analysis available.",
                data: analysis.reading
            },
            {
                section: 'Listening',
                score: Math.round(analysis.listening.reduce((acc: any, curr: any) => acc + (curr.overallScore || 0), 0) / (analysis.listening.length || 1)),
                feedback: analysis.listening.length > 0
                    ? analysis.listening.map((l: any, i: number) => `### Sentence ${i + 1}\n${l.feedback || "Analysis completed."}`).join('\n\n---\n\n')
                    : "Detailed analysis available.",
                data: analysis.listening
            },
            {
                section: 'Extempore',
                score: analysis.extempore?.overallScore || 0,
                feedback: analysis.extempore?.feedback || "No feedback available.",
                data: analysis.extempore
            }
        ];

        return (
            <div className="w-full max-w-5xl mx-auto p-4">
                <Button variant="ghost" onClick={() => setSelectedHistoryItem(null)} className="mb-4">
                    &larr; Back to Dashboard
                </Button>
                <ResultReport
                    scores={scores}
                    onRestart={() => setSelectedHistoryItem(null)}
                    onBack={() => setSelectedHistoryItem(null)}
                />
            </div>
        );
    }

    if (isLoading && !drillContent) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
                <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-slate-800">Loading...</h3>
                    <p className="text-slate-500">Fetching your data.</p>
                </div>
            </div>
        );
    }

    if (drillContent) {
        return (
            <CommunicationAssessment
                onBack={() => setDrillContent(null)}
                onComplete={handleDrillComplete}
                drillContent={drillContent}
            />
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-6 space-y-8">
            {onBack && (
                <Button variant="ghost" onClick={onBack} className="mb-2">
                    &larr; Back to Modes
                </Button>
            )}
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold text-slate-900">Communication Drill</h1>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                    Master your verbal skills with a comprehensive 3-part workout: Reading, Listening, and Extempore.
                </p>
            </div>

            {/* Custom Tabs */}
            <div className="flex justify-center mb-8">
                <div className="bg-slate-100 p-1 rounded-full flex gap-1">
                    <button
                        onClick={() => setActiveTab('new')}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'new'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        New Drill
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'history'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Mocks Analysis
                    </button>
                </div>
            </div>

            {activeTab === 'new' ? (
                <Card className="p-12 border-2 border-dashed border-indigo-200 bg-indigo-50/50 flex flex-col items-center justify-center gap-6 text-center hover:bg-indigo-50 transition-colors">
                    <div className="bg-white p-4 rounded-full shadow-lg">
                        <Sparkles className="w-12 h-12 text-indigo-600" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-slate-800">Ready to Start?</h3>
                        <p className="text-slate-500">Generate a new themed drill powered by Gemini AI.</p>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                            <AlertCircle size={16} />
                            <span className="text-sm font-medium">{error}</span>
                        </div>
                    )}

                    <Button onClick={generateDrill} size="lg" className="bg-indigo-600 hover:bg-indigo-700 h-14 px-8 text-lg shadow-xl shadow-indigo-200">
                        Generate New Drill
                    </Button>
                    <p className="text-xs text-slate-400">Counts as 1 Drill towards your monthly limit.</p>
                </Card>
            ) : (
                <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                        <h3 className="text-sm font-medium text-slate-500">Recent Performance</h3>
                        <Button variant="ghost" size="sm" onClick={fetchHistory} disabled={isLoading} className="text-slate-400 hover:text-indigo-600">
                            <RefreshCcw size={14} className={`mr-1 ${isLoading ? "animate-spin" : ""}`} />
                            Refresh
                        </Button>
                    </div>

                    {history.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>No past drills found. Start your first one!</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {history.map((item) => {
                                const isProcessing = item.status === 'in_progress';
                                return (
                                    <Card
                                        key={item.id}
                                        onClick={() => !isProcessing && setSelectedHistoryItem(item)}
                                        className={`p-4 flex items-center justify-between transition-all group ${isProcessing
                                            ? 'bg-indigo-50/50 border-indigo-200 cursor-wait'
                                            : 'hover:bg-slate-50 cursor-pointer'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-full ${isProcessing
                                                ? 'bg-indigo-100 text-indigo-600 animate-pulse'
                                                : item.overallScore >= 80 ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'
                                                }`}>
                                                {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <BarChart3 size={20} />}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-slate-800">
                                                    {isProcessing ? "AI Analysis in Progress..." : "Communication Drill"}
                                                </h4>
                                                <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={12} />
                                                        {format(new Date(item.createdAt), 'MMM d, yyyy • h:mm a')}
                                                    </span>
                                                    {isProcessing ? (
                                                        <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                                                            <Sparkles size={10} /> Generating Report
                                                        </span>
                                                    ) : (
                                                        <span className="bg-slate-100 px-2 py-0.5 rounded-full">
                                                            Score: <span className="font-bold">{item.overallScore}</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {isProcessing ? (
                                            <span className="text-xs text-indigo-400 font-medium px-3 py-1 bg-white rounded-full border border-indigo-100 shadow-sm">
                                                calculating...
                                            </span>
                                        ) : (
                                            <ChevronRight className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                        )}
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
