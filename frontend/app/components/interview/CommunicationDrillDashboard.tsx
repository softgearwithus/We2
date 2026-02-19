'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, Loader2, AlertCircle, Sparkles, History, ChevronLeft, ChevronRight, BarChart3, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { InterviewsService, InterviewSession } from '@/app/services/InterviewsService';
import CommunicationAssessment from './CommunicationAssessment';
import ResultReport from './sections/ResultReport';
import AssessmentReport, { AssessmentData } from './AssessmentReport';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from 'recharts';

interface CommunicationDrillDashboardProps {
    onBack?: () => void;
    initialTab?: 'new' | 'history';
}

export default function CommunicationDrillDashboard({ onBack, initialTab = 'new' }: CommunicationDrillDashboardProps) {
    const [activeTab, setActiveTab] = useState<'new' | 'history'>(initialTab);
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentDrill, setCurrentDrill] = useState<any>(null);
    const [sessions, setSessions] = useState<InterviewSession[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedSession, setSelectedSession] = useState<InterviewSession | null>(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState<string | null>(null);
    const [historyFilter, setHistoryFilter] = useState<'all' | 'audio' | 'video'>('all');

    const interviewsService = useRef(new InterviewsService());
    const detailRefreshLock = useRef(false);

    useEffect(() => {
        setActiveTab(initialTab);
        loadHistory();
    }, [initialTab]);

    const showNewTab = initialTab === 'new';
    const showHistoryTab = initialTab === 'history';

    const isVideoSession = (session: InterviewSession) => session.provider === 'vapi' || session.type === 'technical';
    const audioHistory = sessions.filter((session) => session.type === 'behavioral');
    const videoHistory = sessions.filter((session) => isVideoSession(session));
    const filteredSessions = historyFilter === 'all'
        ? sessions
        : historyFilter === 'audio'
            ? audioHistory
            : videoHistory;
    const hasPendingSessions = sessions.some((session) => session.status === 'analyzing');

    const latestAudioScore = audioHistory.find((s) => typeof s.overallScore === 'number')?.overallScore ?? null;
    const latestVideoScore = videoHistory.find((s) => typeof s.overallScore === 'number')?.overallScore ?? null;
    const latestOverallScore = sessions.find((s) => typeof s.overallScore === 'number')?.overallScore ?? null;

    const buildTrend = (data: InterviewSession[]) => data
        .filter((session) => typeof session.overallScore === 'number')
        .slice(0, 8)
        .map((session) => ({
            dateLabel: format(new Date(session.date), 'MMM d'),
            score: session.overallScore as number
        }))
        .reverse();

    const audioTrend = buildTrend(audioHistory);
    const videoTrend = buildTrend(videoHistory);
    const overallTrend = buildTrend(sessions);

    const loadHistory = async () => {
        setIsLoadingHistory(true);
        try {
            const history = await interviewsService.current.getSessions();
            setSessions(history);
        } catch (err) {
            console.error("Failed to load history:", err);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const refreshSelectedSession = async (sessionId: string) => {
        if (detailRefreshLock.current) return;
        detailRefreshLock.current = true;
        try {
            const session = await interviewsService.current.getSessionById(sessionId);
            if (session) {
                setSelectedSession(session);
            }
        } catch (err) {
            console.error('Failed to refresh session details', err);
        } finally {
            detailRefreshLock.current = false;
        }
    };

    useEffect(() => {
        if (activeTab !== 'history' || selectedSession || !hasPendingSessions) return;
        const interval = setInterval(() => {
            if (!isLoadingHistory && !isDetailLoading) {
                loadHistory();
            }
        }, 15000);

        return () => clearInterval(interval);
    }, [activeTab, selectedSession, hasPendingSessions, isLoadingHistory, isDetailLoading]);

    useEffect(() => {
        if (!selectedSession || selectedSession.status !== 'analyzing') return;
        const interval = setInterval(() => {
            refreshSelectedSession(selectedSession.id);
        }, 10000);

        return () => clearInterval(interval);
    }, [selectedSession?.id, selectedSession?.status]);

    const generateDrill = async () => {
        setIsGenerating(true);
        setError(null);

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/interviews/communication/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({})
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to generate drill');
            }

            const drillData = await response.json();
            setCurrentDrill(drillData);
        } catch (err: any) {
            console.error("Error generating drill:", err);
            setError(err.message || "Failed to generate drill. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDrillComplete = async (results: any) => {
        if (currentDrill && results?.id) {
            const newSession: InterviewSession = {
                id: results.id,
                date: results.createdAt ? new Date(results.createdAt) : new Date(),
                topic: currentDrill.theme,
                status: results.status === 'in_progress' ? 'analyzing' : 'completed',
                analysis: results.analysis ? {
                    overallScore: results.overallScore,
                    reading: results.analysis?.reading,
                    listening: results.analysis?.listening,
                    extempore: results.analysis?.extempore
                } : undefined
            };

            await interviewsService.current.saveSession(newSession);
            if (newSession.analysis) {
                setSelectedSession(newSession);
                setCurrentDrill(null);
                return;
            }
        }

        setCurrentDrill(null);
        setActiveTab('history');
        loadHistory();
    };

    const openSessionDetails = async (sessionId: string) => {
        setIsDetailLoading(true);
        setDetailError(null);
        try {
            const session = await interviewsService.current.getSessionById(sessionId);
            if (!session) {
                throw new Error('Session not found');
            }
            setSelectedSession(session);
        } catch (err) {
            console.error('Failed to load session details', err);
            setDetailError('Failed to load analysis. Please try again.');
        } finally {
            setIsDetailLoading(false);
        }
    };

    const closeSessionDetails = () => {
        setSelectedSession(null);
        setDetailError(null);
    };

    const buildAudioScores = (session: InterviewSession) => {
        const reading = session.analysis?.reading || [];
        const listening = session.analysis?.listening || [];
        const extempore = session.analysis?.extempore;

        const avgScore = (items: any[]) => {
            if (!items || items.length === 0) return 0;
            return Math.round(items.reduce((acc, curr) => acc + (curr.overallScore || 0), 0) / items.length);
        };

        return [
            {
                section: 'Reading',
                score: avgScore(reading),
                feedback: (reading || []).map((r: any, i: number) => `### Passage ${i + 1}\n${r.feedback || "Analysis completed."}`).join('\n\n---\n\n'),
                data: reading
            },
            {
                section: 'Listening',
                score: avgScore(listening),
                feedback: (listening || []).map((l: any, i: number) => `### Sentence ${i + 1}\n${l.feedback || "Analysis completed."}`).join('\n\n---\n\n'),
                data: listening
            },
            {
                section: 'Extempore',
                score: typeof extempore?.overallScore === 'number' ? extempore.overallScore : (session.overallScore || 0),
                feedback: extempore?.feedback || session.feedback || session.analysis?.feedback || "",
                data: extempore
            }
        ];
    };


    // If drillContent is present, show assessment (which we will also need to lightly re-theme, but focusing on dashboard first)
    if (currentDrill) {
        return (
            <CommunicationAssessment
                drillContent={currentDrill}
                onComplete={handleDrillComplete}
                onBack={() => setCurrentDrill(null)}
            />
        );
    }

    if (isDetailLoading) {
        return (
            <div className="min-h-screen bg-slate-50/50 p-6 md:p-12 font-sans text-slate-900">
                <div className="max-w-5xl mx-auto flex flex-col items-center justify-center py-24 gap-4">
                    <Loader2 className="animate-spin text-violet-500" size={32} />
                    <p className="text-sm text-slate-500">Loading analysis...</p>
                </div>
            </div>
        );
    }

    if (detailError) {
        return (
            <div className="min-h-screen bg-slate-50/50 p-6 md:p-12 font-sans text-slate-900">
                <div className="max-w-5xl mx-auto flex flex-col items-center justify-center py-24 gap-4">
                    <AlertCircle className="text-rose-500" size={28} />
                    <p className="text-sm text-slate-500">{detailError}</p>
                    <Button onClick={closeSessionDetails} className="mt-2">Back to History</Button>
                </div>
            </div>
        );
    }

    if (selectedSession) {
        if (selectedSession.status === 'analyzing') {
            return (
                <div className="min-h-screen bg-slate-50/50 p-6 md:p-12 font-sans text-slate-900">
                    <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-24 gap-4 text-center">
                        <div className="h-16 w-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                            <Loader2 className="animate-spin" size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Analysis in progress</h3>
                        <p className="text-sm text-slate-500">
                            Vapi is still preparing your report. This page will refresh automatically.
                        </p>
                        <div className="flex items-center gap-3">
                            <Button onClick={() => refreshSelectedSession(selectedSession.id)} className="h-10 px-4 rounded-xl">
                                Check again
                            </Button>
                            <Button variant="outline" onClick={closeSessionDetails} className="h-10 px-4 rounded-xl">
                                Back to History
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        if (selectedSession.provider === 'vapi' || selectedSession.type === 'technical') {
            const metrics = selectedSession.analysis?.metrics || {};
            const feedback = selectedSession.analysis?.feedback || [];
            const assessmentData: AssessmentData = {
                type: 'video',
                metrics: {
                    overall: typeof selectedSession.overallScore === 'number' ? selectedSession.overallScore : 0,
                    technical: typeof metrics.technical === 'number' ? metrics.technical : 0,
                    communication: typeof metrics.communication === 'number' ? metrics.communication : 0,
                    problemSolving: typeof metrics.problemSolving === 'number' ? metrics.problemSolving : 0,
                    feedback,
                    transcript: selectedSession.analysis?.transcript || selectedSession.analysis?.raw?.transcript,
                    summary: selectedSession.analysis?.summary || selectedSession.feedback || selectedSession.analysis?.raw?.summary,
                    logs: selectedSession.analysis?.logs || selectedSession.analysis?.raw?.messages || selectedSession.analysis?.raw?.conversation,
                    logUrl: selectedSession.analysis?.logUrl
                },
                date: selectedSession.date,
            };

            return (
                <AssessmentReport
                    data={assessmentData}
                    onRetry={closeSessionDetails}
                    onHome={closeSessionDetails}
                />
            );
        }

        return (
            <ResultReport
                scores={buildAudioScores(selectedSession) as any}
                onRestart={closeSessionDetails}
                onBack={closeSessionDetails}
            />
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-12 font-sans text-slate-900">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center gap-6 mb-8">
                    <Button
                        variant="ghost"
                        onClick={onBack}
                        className="h-12 w-12 rounded-2xl bg-white border border-slate-200 text-slate-500 hover:text-violet-600 hover:border-violet-200 hover:bg-violet-50 transition-all shadow-sm"
                    >
                        <ChevronLeft size={20} />
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Mock Interview Dashboard</h2>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Sparkles size={14} className="text-violet-500" />
                            <span>AI-Powered Assessment Suite</span>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex p-1 bg-white border border-slate-200 rounded-xl w-fit shadow-sm">
                    {showNewTab && (
                        <button
                            onClick={() => setActiveTab('new')}
                            className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'new'
                                ? 'bg-slate-900 text-white shadow-md'
                                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                }`}
                        >
                            Generative Drill
                        </button>
                    )}
                    {showHistoryTab && (
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'history'
                                ? 'bg-slate-900 text-white shadow-md'
                                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                }`}
                        >
                            History Log
                        </button>
                    )}
                </div>

                {/* Content Area */}
                <div className="min-h-[400px]">
                    {activeTab === 'new' ? (
                        <div className="relative group max-w-2xl">
                            {/* Gradient Glow */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-[2rem] blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>

                            <Card className="relative bg-white border-slate-200 p-12 flex flex-col items-center justify-center text-center space-y-8 rounded-[1.5rem] shadow-xl shadow-slate-200/50">
                                <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white shadow-lg shadow-violet-200 mb-2">
                                    <Sparkles size={40} />
                                </div>

                                <div className="space-y-3 max-w-md">
                                    <h3 className="text-2xl font-bold text-slate-900">
                                        Generate New Scenario
                                    </h3>
                                    <p className="text-slate-500 leading-relaxed">
                                        Our AI will create a unique communication drill tailored to typical interview questions.
                                        <br />
                                        <span className="text-xs font-medium bg-violet-50 text-violet-700 px-2 py-1 rounded-md mt-2 inline-block">Includes: Reading, Listening, Extempore</span>
                                    </p>
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-lg text-sm font-medium">
                                        <AlertCircle size={16} />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <Button
                                    onClick={generateDrill}
                                    disabled={isGenerating}
                                    className="h-14 px-10 bg-slate-900 hover:bg-violet-600 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-violet-200 transition-all duration-300 transform hover:-translate-y-0.5"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                            Designing Scenario...
                                        </>
                                    ) : (
                                        <>
                                            Start Simulation <ArrowRight className="ml-2 h-5 w-5" />
                                        </>
                                    )}
                                </Button>

                                <p className="text-xs text-slate-400 font-medium pt-4">
                                    Powered by Gemini 1.5 Pro • Real-time Speech Analysis
                                </p>
                            </Card>
                        </div>
                    ) : (
                        <div className="space-y-4 max-w-3xl">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { title: 'Audio Drill', score: latestAudioScore, data: audioTrend, gradient: 'audioGradient', stroke: '#8b5cf6' },
                                    { title: 'Video Simulation', score: latestVideoScore, data: videoTrend, gradient: 'videoGradient', stroke: '#10b981' },
                                    { title: 'Overall', score: latestOverallScore, data: overallTrend, gradient: 'overallGradient', stroke: '#f59e0b' }
                                ].map((chart, index) => (
                                    <Card key={index} className="p-5 border border-slate-200 rounded-3xl shadow-sm">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-900">{chart.title}</h3>
                                                <p className="text-[10px] text-slate-500">Last 8 sessions</p>
                                            </div>
                                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                                {typeof chart.score === 'number' ? `${chart.score}%` : '--'}
                                            </div>
                                        </div>
                                        <div className="h-[150px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={chart.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                    <defs>
                                                        <linearGradient id={chart.gradient} x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="0%" stopColor={chart.stroke} stopOpacity={0.3} />
                                                            <stop offset="100%" stopColor={chart.stroke} stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                                    <XAxis dataKey="dateLabel" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                                                    <Tooltip
                                                        cursor={{ stroke: '#cbd5f5', strokeWidth: 1 }}
                                                        contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '8px' }}
                                                    />
                                                    <Area type="monotone" dataKey="score" stroke={chart.stroke} strokeWidth={2} fill={`url(#${chart.gradient})`} />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                {[
                                    { key: 'all', label: 'All Sessions' },
                                    { key: 'audio', label: 'Audio Drill' },
                                    { key: 'video', label: 'AI Video Interview' }
                                ].map((item) => (
                                    <button
                                        key={item.key}
                                        type="button"
                                        onClick={() => setHistoryFilter(item.key as typeof historyFilter)}
                                        className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${historyFilter === item.key
                                            ? 'bg-slate-900 text-white border-slate-900'
                                            : 'bg-white text-slate-500 border-slate-200 hover:border-violet-200 hover:text-violet-600'
                                            }`}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                            {isLoadingHistory ? (
                                <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
                                    <Loader2 className="animate-spin text-violet-500" size={32} />
                                    <span className="text-sm font-medium">Retrieving records...</span>
                                </div>
                            ) : filteredSessions.length === 0 ? (
                                <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-3xl">
                                    <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                        <History size={24} />
                                    </div>
                                    <p className="text-slate-500 font-medium">No interview history found.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {filteredSessions.map((session) => (
                                        <div
                                            key={session.id}
                                            className="bg-white border border-slate-200 hover:border-violet-200 p-5 rounded-2xl flex items-center justify-between group transition-all hover:shadow-lg hover:shadow-violet-100/50 cursor-pointer"
                                            onClick={() => openSessionDetails(session.id)}
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold border transition-transform group-hover:scale-105 ${session.status === 'analyzing'
                                                    ? 'bg-amber-50 text-amber-600 border-amber-100'
                                                    : 'bg-violet-50 text-violet-600 border-violet-100'
                                                    }`}>
                                                    {session.status === 'analyzing' ? <Loader2 size={20} className="animate-spin" /> : <BarChart3 size={20} />}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900 group-hover:text-violet-700 transition-colors">
                                                        {session.topic || 'General Assessment'}
                                                    </h4>
                                                    <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-1">
                                                        <span>{format(new Date(session.date), 'MMMM dd, yyyy')}</span>
                                                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                        <span>{format(new Date(session.date), 'h:mm a')}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    {session.status === 'analyzing' ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                                            Analyzing...
                                                        </span>
                                                    ) : (
                                                        <>
                                                            <span className="block text-xl font-bold text-slate-900">
                                                                {typeof session.overallScore === 'number' ? session.overallScore : '--'}<span className="text-sm text-slate-400">%</span>
                                                            </span>
                                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Overall</span>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-violet-100 group-hover:text-violet-600 transition-colors">
                                                    <ChevronRight size={16} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
