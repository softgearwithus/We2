'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Loader2, Mic, Video, ArrowRight, CheckCircle2, BarChart3, Sparkles } from 'lucide-react';
import CommunicationDrillDashboard from './CommunicationDrillDashboard';
import PreInterviewInstructions from './PreInterviewInstructions';
import InterviewSession from './InterviewSession';
import AssessmentReport, { AssessmentData, SectionScore, VideoMetrics } from './AssessmentReport';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InterviewsService } from '@/app/services/InterviewsService';
import { useCredits } from '@/app/hooks/useCredits';

interface InterviewLandingProps {
    initialMode?: Mode;
}

type Mode = 'landing' | 'audio' | 'instructions' | 'video_session' | 'result' | 'analysis';

export default function InterviewLanding({ initialMode = 'landing' }: InterviewLandingProps) {
    const [mode, setMode] = useState<Mode>(initialMode);
    const [isLoading, setIsLoading] = useState(false);
    const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
    const [latestScore, setLatestScore] = useState<number | null>(null);
    const [latestDuration, setLatestDuration] = useState<number | null>(null);
    const interviewsService = useRef(new InterviewsService());
    const { credits, isLoading: creditsLoading, refetch } = useCredits();

    const isAudioLimited = false;
    const isVideoLimited = false;
    const isFreePlan = false;

    // Sync mode when initialMode prop changes (e.g. navigation)
    useEffect(() => {
        setMode(initialMode);
    }, [initialMode]);

    useEffect(() => {
        if (mode !== 'landing') return;

        const loadLatest = async () => {
            try {
                const sessions = await interviewsService.current.getSessions();
                const latest = sessions.find((s) => typeof s.overallScore === 'number');
                setLatestScore(typeof latest?.overallScore === 'number' ? latest.overallScore : null);
                setLatestDuration(typeof latest?.durationSeconds === 'number' ? latest.durationSeconds : null);
            } catch (err) {
                console.error('Failed to load latest score', err);
            }
        };

        loadLatest();
    }, [mode]);

    const handleStartVideoFlow = () => {
        if (isVideoLimited) return;
        setMode('instructions');
    };

    const handleStartAudioFlow = () => {
        if (isAudioLimited) return;
        setMode('audio');
    };

    const startVideoSession = async (resumeId?: string) => {
        if (isVideoLimited) return;
        setIsLoading(true);
        try {
            const { getActiveToken } = await import('@/app/lib/auth-storage');
            const token = getActiveToken() || '';
            if (!resumeId) {
                throw new Error('Resume required');
            }
            sessionStorage.setItem('emble.ai.resumeId', resumeId);
            setIsLoading(false);
            setMode('video_session');
        } catch (error) {
            console.error('Failed to initialize video session', error);
            setIsLoading(false);
        }
    };

    const handleVideoComplete = (metrics: VideoMetrics, durationSeconds: number) => {
        setAssessmentData({
            type: 'video',
            metrics: metrics,
            date: new Date(),
            duration: durationSeconds
        });
        setMode('result');
        refetch();
    };

    const handleAudioComplete = (scores: SectionScore[], durationSeconds: number) => {
        setAssessmentData({
            type: 'audio',
            scores: scores,
            date: new Date(),
            duration: durationSeconds
        });
        setMode('result');
        refetch();
    };


    if (mode === 'audio') {
        return (
            <CommunicationDrillDashboard
                onBack={() => setMode('landing')}
                initialTab="new"
                onCompleteAssessment={handleAudioComplete}
            />
        );
    }

    if (mode === 'analysis') {
        return <CommunicationDrillDashboard onBack={() => setMode('landing')} initialTab="history" />;
    }

    if (mode === 'instructions') {
        return <PreInterviewInstructions onStart={startVideoSession} onBack={() => setMode('landing')} />;
    }

    if (mode === 'video_session') {
        return (
            <InterviewSession
                onEnd={handleVideoComplete}
                onCancel={() => setMode('landing')}
                initialSeconds={900}
            />
        );
    }

    if (mode === 'result' && assessmentData) {
        return (
            <AssessmentReport
                data={assessmentData}
                onRetry={() => window.location.reload()}
                onHome={() => setMode('landing')}
            />
        );
    }

    return (
        <div className="flex flex-col w-full h-full font-sans selection:bg-violet-200 selection:text-violet-900 pb-8">
            <div className="max-w-7xl mx-auto w-full space-y-6">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-8">
                    <div className="space-y-4 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-bold uppercase tracking-wider border border-violet-200">
                            <Sparkles size={12} className="fill-violet-700" />
                            <span>Placement Mode Ultra Interface</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                            Mock Interview <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">Simulation Lab</span>
                        </h1>
                        <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
                            Refine your communication and behavioral skills with our AI-powered assessment suite. Choose a module to begin.
                        </p>
                        {creditsLoading && (
                            <div className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold border-slate-200 bg-slate-50 text-slate-500">
                                <Loader2 size={12} className="animate-spin" /> Fetching allocations...
                            </div>
                        )}
                    </div>

                    <div className="flex gap-8 text-sm font-medium text-slate-500 bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex flex-col items-center">
                            <span className="text-2xl font-bold text-slate-900">0.8<span className="text-violet-500">s</span></span>
                            <span className="text-[10px] uppercase tracking-wide">Avg Latency</span>
                        </div>
                        <div className="w-px h-10 bg-slate-100"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-2xl font-bold text-slate-900">99.9<span className="text-emerald-500">%</span></span>
                            <span className="text-[10px] uppercase tracking-wide">Uptime</span>
                        </div>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

                    {/* Audio Drill Card (Half Width) */}
                    <div className="md:col-span-6 group relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-200 shadow-xl shadow-slate-200/50 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-200/50 hover:border-violet-200 flex flex-col">
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-fuchsia-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative p-6 md:p-8 flex-1 flex flex-col justify-between h-full">
                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-100 to-slate-50 flex items-center justify-center text-violet-600 shadow-sm border border-violet-100 group-hover:scale-110 transition-transform duration-300">
                                        <Mic size={24} />
                                    </div>
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                                A{i}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-2xl font-bold text-slate-900">Audio Drill</h3>
                                        {!creditsLoading && credits && (
                                            <span className={`inline-flex items-center w-fit gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${isAudioLimited ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
                                                {credits.audioDrills.remaining}/{credits.audioDrills.limit} Left
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-500 leading-relaxed">
                                        Focus on vocal delivery. Rapid-fire questions with instant AI feedback on key parameters.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-100">
                                <Button
                                    onClick={handleStartAudioFlow}
                                    disabled={creditsLoading}
                                    className="w-full bg-slate-900 hover:bg-violet-600 text-white rounded-xl py-6 text-base font-bold shadow-lg shadow-slate-200 hover:shadow-violet-200 transition-all duration-300 flex justify-between items-center px-6 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    Start Drill <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </Button>
                                <div className="flex gap-3 text-xs font-bold text-slate-400 mt-4 justify-center">
                                    <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-emerald-500" /> Reading</span>
                                    <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-emerald-500" /> Listening</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Video Sim Card (Half Width) */}
                    <div className="md:col-span-6 group relative overflow-hidden rounded-[2.5rem] bg-slate-900 text-white shadow-2xl shadow-slate-300 transition-all duration-300 hover:shadow-violet-300/50 flex flex-col">
                        {/* Background Effects */}
                        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                        <div className="absolute -right-20 -top-20 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl pointer-events-none group-hover:bg-violet-600/30 transition-colors" />
                        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-fuchsia-600/20 transition-colors" />

                        <div className="relative z-10 p-6 md:p-8 flex-1 flex flex-col justify-between h-full">
                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                                        <Video size={24} />
                                    </div>
                                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                                        Beta Access
                                    </span>
                                </div>

                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-2xl font-bold text-white">Video Simulation</h3>
                                        {!creditsLoading && credits && (
                                            <span className={`inline-flex items-center w-fit gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${isVideoLimited ? 'border-rose-500/30 bg-rose-500/10 text-rose-300' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'}`}>
                                                {credits.videoSimulations.remaining}/{credits.videoSimulations.limit} Left
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-400 leading-relaxed">
                                        Face our AI avatar in a realistic environment.
                                        Get feedback on body language & confidence.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-800">
                                <Button
                                    onClick={handleStartVideoFlow}
                                    disabled={creditsLoading}
                                    className="w-full bg-white text-slate-900 hover:bg-emerald-400 hover:text-emerald-950 rounded-xl py-6 text-base font-bold shadow-xl hover:shadow-emerald-500/20 transition-all duration-300 flex justify-between items-center px-6 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" /> : (
                                        <>Enter Lobby <Play size={18} fill="currentColor" /></>
                                    )}
                                </Button>
                                <div className="flex gap-3 text-xs font-bold text-slate-500 mt-4 justify-center">
                                    <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-slate-600" /> Camera</span>
                                    <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-slate-600" /> Microphone</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats/Analysis Card (Full Width Banner) */}
                    <div className="md:col-span-12">
                        <div className="group relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white p-1 shadow-xl shadow-violet-200 cursor-pointer" onClick={() => setMode('analysis')}>
                            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
                            <div className="relative bg-slate-900/10 backdrop-blur-[2px] rounded-[1.8rem] p-4 md:px-8 md:py-6 flex flex-col md:flex-row items-center justify-between gap-4 hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                                        <BarChart3 size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">Performance Analytics</h3>
                                        <p className="text-violet-100 opacity-90 text-xs">
                                            Deep dive into your communication history and track improvement over time.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 bg-black/20 rounded-xl p-2 pl-4 border border-white/10">
                                    <div className="text-right">
                                        <div className="text-xs font-medium text-violet-200 uppercase tracking-wider">Latest</div>
                                        <div className="font-bold font-mono text-xl">
                                            {typeof latestScore === 'number' ? `${latestScore} / 100` : '-- / 100'}
                                        </div>
                                        {typeof latestDuration === 'number' && (
                                            <div className="text-[10px] uppercase tracking-wider text-violet-200">
                                                {Math.floor(latestDuration / 60)}m {latestDuration % 60}s
                                            </div>
                                        )}
                                    </div>
                                    <div className="h-10 w-10 bg-white text-violet-600 rounded-lg flex items-center justify-center transform group-hover:translate-x-1 transition-transform">
                                        <ArrowRight size={20} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div >
        </div >
    );
}
