'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, Loader2, Sparkles, MoveRight, Camera, Mic, CameraOff, AlertCircle } from 'lucide-react';

// Sub-components
import ReadingSection from './sections/ReadingSection';
import RepeatSection from './sections/RepeatSection';
import ExtemporeSection from './sections/ExtemporeSection';
import TechnicalSection from './sections/TechnicalSection';
import ResultReport from './sections/ResultReport';

export interface SectionScore {
    section: string;
    score: number; // 0-100
    feedback: string;
    data?: any; // Blob or collected data
}

export interface DrillContent {
    theme: string;
    reading: { level: string, text: string }[];
    listening: string[];
    extempore: { topic: string, keyPoints: string[] };
    technical?: { topic: string, role: string };
    metadata?: any;
}

interface CommunicationAssessmentProps {
    onBack: () => void;
    onComplete?: (result: any) => void;
    drillContent: DrillContent;
}

export type AssessmentSection = 'intro' | 'reading' | 'repeat' | 'extempore' | 'technical' | 'results';

export default function CommunicationAssessment({ onBack, onComplete, drillContent }: CommunicationAssessmentProps) {
    const [currentSection, setCurrentSection] = useState<AssessmentSection>('intro');
    const [scores, setScores] = useState<SectionScore[]>([]);

    const [collectedData, setCollectedData] = useState<any>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [finalResult, setFinalResult] = useState<any>(null);

    // Global Media State
    const [globalStream, setGlobalStream] = useState<MediaStream | null>(null);
    const [mediaError, setMediaError] = useState<string | null>(null);
    const [isCameraStarting, setIsCameraStarting] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Initialize Camera manually
    const initCamera = async () => {
        setIsCameraStarting(true);
        setMediaError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setGlobalStream(stream);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err: any) {
            console.error("Camera access denied or failed", err);
            setMediaError("Camera and microphone access is required for EMBLE's AI to deeply analyze your logical structuring and communication. Please allow permissions in your browser.");
        } finally {
            setIsCameraStarting(false);
        }
    };

    const stopGlobalStream = () => {
        if (globalStream) {
            globalStream.getTracks().forEach(track => track.stop());
            setGlobalStream(null);
        }
    };

    // Attach stream to video element when available
    useEffect(() => {
        if (videoRef.current && globalStream) {
            videoRef.current.srcObject = globalStream;
        }
    }, [globalStream, currentSection]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopGlobalStream();
        };
    }, [globalStream]);

    const handleSectionComplete = (scoreData: SectionScore) => {
        const newScores = [...scores, scoreData];
        setScores(newScores);

        if (currentSection === 'reading') {
            const nextData = { ...collectedData, reading: scoreData.data };
            setCollectedData(nextData);
            setCurrentSection('repeat');
        }
        else if (currentSection === 'repeat') {
            const nextData = { ...collectedData, listening: scoreData.data };
            setCollectedData(nextData);
            setCurrentSection('extempore');
        }
        else if (currentSection === 'extempore') {
            const nextData = { ...collectedData, extempore: scoreData.data };
            setCollectedData(nextData);
            // Default Technical Prompt
            if (!drillContent.technical) {
                drillContent.technical = {
                    role: "Software Engineer",
                    topic: "Explain how you would design a scalable URL shortening service like Bitly. Discuss the data structures, APIs, and potential bottlenecks."
                }
            }
            setCurrentSection('technical');
        }
        else if (currentSection === 'technical') {
            const finalData = { ...collectedData, technical: scoreData.data };
            setCollectedData(finalData);
            setCurrentSection('results');

            // Critical Secure Hardware Management: Kill camera/mic light immediately when all 4 steps end
            stopGlobalStream();

            submitAssessment(finalData);
        }
    };

    const submitAssessment = async (fullData: any) => {
        setIsSubmitting(true);

        try {
            const formData = new FormData();

            // Append Reading Files
            const readingMeta = fullData.reading.map((item: any, i: number) => {
                formData.append(`reading_${i}`, item.blob, `reading_${i}.webm`);
                return { text: item.text };
            });

            // Append Listening Files
            const listeningMeta = fullData.listening.map((item: any, i: number) => {
                formData.append(`listening_${i}`, item.blob, `listening_${i}.webm`);
                return { text: item.text };
            });

            // Append Extempore File
            if (fullData.extempore) {
                formData.append('extempore', fullData.extempore.blob, 'extempore.webm');
            }

            // Append Technical Files (is now an array of {topic, blob})
            if (fullData.technical && Array.isArray(fullData.technical)) {
                fullData.technical.forEach((item: any, i: number) => {
                    formData.append(`technical_${i}`, item.blob, `technical_${i}.webm`);
                });
            }

            const metadata = {
                theme: drillContent.theme,
                reading: readingMeta,
                listening: listeningMeta,
                extempore: { topic: fullData.extempore?.topic || '' },
                technical: fullData.technical?.map((t: any) => ({ topic: t.topic, role: drillContent.technical?.role || 'Software Engineer' })) || []
            };
            formData.append('metadata', JSON.stringify(metadata));

            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/interviews/communication/submit`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) throw new Error('Submission failed');

            const result = await response.json();
            if (!result || !result.id) {
                throw new Error('Invalid submission response');
            }
            setFinalResult(result);

        } catch (error) {
            console.error("Final submission error", error);
            alert("Failed to submit drill. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    const fetchSessionDetails = async (sessionId: string) => {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/interviews/${sessionId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch analysis');
        return response.json();
    };

    const fetchWithRetry = async (sessionId: string, attempts: number = 8) => {
        for (let i = 0; i < attempts; i++) {
            const session = await fetchSessionDetails(sessionId);
            if (session?.analysis && (session.analysis.reading || session.analysis.listening || session.analysis.extempore)) {
                return session;
            }
            await new Promise((resolve) => setTimeout(resolve, 2000));
        }
        throw new Error('Analysis still processing');
    };

    return (
        <div className="fixed inset-0 z-[100] bg-[#F8FAFC] flex font-sans overflow-hidden">

            {/* Left Sidebar Progress */}
            {currentSection !== 'intro' && currentSection !== 'results' && (
                <div className="w-64 xl:w-80 border-r border-slate-200 bg-white shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-30 flex flex-col h-full shrink-0">
                    <div className="p-8 border-b border-slate-100 space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse ring-4 ring-indigo-50" />
                            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest leading-none">Active Drill</span>
                        </div>
                        <h2 className="text-xl font-black text-slate-900 leading-tight">{typeof window !== 'undefined' ? drillContent.theme : 'Processing...'}</h2>
                    </div>

                    <div className="flex-1 p-8 overflow-y-auto custom-scrollbar pt-10">
                        <div className="space-y-10">
                            {['Reading', 'Listening', 'Extempore', 'Technical'].map((step, idx) => {
                                const sections = ['reading', 'repeat', 'extempore', 'technical'];
                                const currentIndex = sections.indexOf(currentSection);
                                const isCompleted = currentIndex > idx;
                                const isCurrent = currentIndex === idx;

                                return (
                                    <div key={step} className="relative flex items-start gap-5">
                                        {/* Line connecting nodes */}
                                        {idx !== 3 && (
                                            <div className={`absolute left-4 top-10 bottom-[-3rem] w-0.5 transition-colors duration-500 rounded-full ${isCompleted ? 'bg-emerald-400' : 'bg-slate-100'}`} />
                                        )}

                                        <div className="relative z-10 shrink-0 mt-0.5">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm transition-all duration-300 ${isCompleted ? 'bg-emerald-500 text-white' : isCurrent ? 'bg-indigo-600 text-white ring-8 ring-indigo-50' : 'bg-slate-100 text-slate-400 border-2 border-slate-200'}`}>
                                                {isCompleted ? '✓' : idx + 1}
                                            </div>
                                        </div>

                                        <div className="flex flex-col">
                                            <span className={`text-sm tracking-widest uppercase font-bold transition-colors ${isCurrent ? 'text-indigo-600' : isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                                                {step}
                                            </span>
                                            {isCurrent && (
                                                <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase mt-1 bg-slate-100 w-fit px-2 py-0.5 rounded-md">In Progress</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="p-6 border-t border-slate-100 bg-slate-50/50 mt-auto">
                        <Button variant="ghost" onClick={onBack} className="w-full text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl px-5 transition-colors justify-start h-12 font-bold group">
                            <ArrowRight className="mr-3 h-5 w-5 rotate-180 group-hover:-translate-x-1 transition-transform" /> Exit Drill
                        </Button>
                    </div>
                </div>
            )}

            {/* Main Pane: Active Drill Content */}
            <div className="flex-1 w-full flex flex-col relative bg-white shadow-2xl z-10 overflow-y-auto custom-scrollbar">

                {/* Header (Only show if intro or results, otherwise sidebar handles it) */}
                {(currentSection === 'intro' || currentSection === 'results') && (
                    <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 p-6 xl:px-12 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Active Drill</span>
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">{typeof window !== 'undefined' ? drillContent.theme : 'Processing...'}</h2>
                        </div>
                        {currentSection !== 'results' && (
                            <Button variant="ghost" onClick={onBack} className="text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl px-5 transition-colors">
                                Leave
                            </Button>
                        )}
                    </div>
                )}

                {/* Main Content Area */}
                <div className={`flex-1 flex flex-col items-center p-6 xl:px-12 w-full max-w-5xl mx-auto ${currentSection === 'intro' ? 'justify-center' : 'pt-12 md:pt-20'}`}>

                    <div className="w-full">
                        <AnimatePresence mode='wait'>
                            {currentSection === 'intro' && (
                                <motion.div
                                    key="intro"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
                                    className="space-y-12"
                                >
                                    <div className="space-y-6">
                                        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-2">
                                            <Sparkles size={14} className="text-indigo-600" />
                                            <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest">Powered By Gemini 2.5 AI</span>
                                        </div>
                                        <h1 className="text-4xl xl:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                                            Advanced <br />
                                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-500">
                                                Mock Interview
                                            </span>
                                        </h1>
                                        <p className="text-lg text-slate-600 max-w-xl leading-relaxed">
                                            Prepare to have your critical thinking, system design knowledge, and communication clarity deeply evaluated across 4 modules.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="p-5 border border-slate-100 rounded-3xl bg-slate-50">
                                            <h3 className="font-bold text-slate-900 text-lg mb-1">Passages</h3>
                                            <p className="text-xs text-slate-500 leading-tight">Focus on dictation and articulation clarity.</p>
                                        </div>
                                        <div className="p-5 border border-slate-100 rounded-3xl bg-slate-50">
                                            <h3 className="font-bold text-slate-900 text-lg mb-1">Listening</h3>
                                            <p className="text-xs text-slate-500 leading-tight">Test cognitive retention and repetition.</p>
                                        </div>
                                        <div className="p-5 border border-slate-100 rounded-3xl bg-slate-50">
                                            <h3 className="font-bold text-slate-900 text-lg mb-1">Extempore</h3>
                                            <p className="text-xs text-slate-500 leading-tight">60s spontaneous logical structuring.</p>
                                        </div>
                                        <div className="p-5 border border-emerald-100 rounded-3xl bg-emerald-50">
                                            <h3 className="font-bold text-emerald-900 text-lg mb-1">Technical</h3>
                                            <p className="text-xs text-emerald-700 leading-tight">10m intensive CS software deep dive.</p>
                                        </div>
                                    </div>

                                    {mediaError && (
                                        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-5 rounded-2xl flex items-start gap-3">
                                            <AlertCircle className="shrink-0 mt-0.5 text-rose-500" />
                                            <p className="text-sm font-medium leading-relaxed">{mediaError}</p>
                                        </div>
                                    )}

                                    <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row gap-6 items-center bg-slate-50 p-6 rounded-[2.5rem]">

                                        {!globalStream ? (
                                            <Button
                                                onClick={initCamera}
                                                disabled={isCameraStarting}
                                                className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl px-10 shadow-xl shadow-slate-200 text-lg font-bold transition-all disabled:opacity-50"
                                            >
                                                {isCameraStarting ? <Loader2 size={24} className="animate-spin" /> : "Enable Camera & Microphone"}
                                            </Button>
                                        ) : (
                                            <div className="w-full flex flex-col md:flex-row gap-4 items-center justify-between">
                                                <div className="flex items-center gap-3 bg-emerald-100 text-emerald-700 px-5 py-3 rounded-2xl font-bold w-full md:w-auto justify-center">
                                                    <CheckCircle2 size={20} /> Permissions Granted
                                                </div>
                                                <Button
                                                    onClick={() => setCurrentSection('reading')}
                                                    className="w-full md:w-auto h-16 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-lg rounded-2xl px-12 shadow-xl shadow-indigo-200 transition-all font-bold group"
                                                >
                                                    Start Interview <ArrowRight size={20} className="ml-3 group-hover:translate-x-1.5 transition-transform" />
                                                </Button>
                                            </div>
                                        )}

                                    </div>

                                    {!globalStream && (
                                        <p className="text-center text-xs text-slate-400 font-medium">By enabling these permissions, you allow EMBLE to record your audio strictly for mock interview evaluation.</p>
                                    )}
                                </motion.div>
                            )}

                            {currentSection === 'reading' && globalStream && (
                                <ReadingSection
                                    key="reading"
                                    onComplete={handleSectionComplete}
                                    passages={drillContent.reading}
                                    globalStream={globalStream}
                                />
                            )}

                            {currentSection === 'repeat' && globalStream && (
                                <RepeatSection
                                    key="repeat"
                                    onComplete={handleSectionComplete}
                                    sentences={drillContent.listening}
                                    globalStream={globalStream}
                                />
                            )}

                            {currentSection === 'extempore' && globalStream && (
                                <ExtemporeSection
                                    key="extempore"
                                    onComplete={handleSectionComplete}
                                    topicContent={drillContent.extempore}
                                    globalStream={globalStream}
                                />
                            )}

                            {currentSection === 'technical' && globalStream && (
                                <TechnicalSection
                                    key="technical"
                                    onComplete={handleSectionComplete}
                                    topicContent={(drillContent.technical as any) || []}
                                    globalStream={globalStream}
                                />
                            )}

                            {currentSection === 'results' && (
                                <div className="w-full">
                                    {isSubmitting ? (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-[500px] space-y-6 text-center">
                                            <Loader2 className="w-16 h-16 text-indigo-500 animate-spin" />
                                            <h2 className="text-3xl font-black text-slate-900">Uploading Drill...</h2>
                                            <p className="text-slate-500 text-lg max-w-sm">Sending your recordings to EMBLE's AI engine for precise communication analysis.</p>
                                        </motion.div>
                                    ) : finalResult && finalResult.status === 'in_progress' ? (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="flex flex-col items-center justify-center min-h-[500px] space-y-8 bg-white p-12 text-center"
                                        >
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 animate-pulse rounded-full" />
                                                <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 relative z-10 shadow-xl shadow-indigo-100/50">
                                                    <Sparkles size={48} />
                                                </div>
                                            </div>
                                            <div className="space-y-4 max-w-md">
                                                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Drill Submitted!</h2>
                                                <p className="text-slate-500 text-lg">
                                                    Your recordings are now being analyzed. This usually takes about 30-45 seconds.
                                                </p>
                                                <div className="inline-flex items-center justify-center gap-2 text-indigo-700 font-bold bg-indigo-50 px-5 py-2.5 rounded-full border border-indigo-100 shadow-sm">
                                                    <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-ping" />
                                                    Live Analysis in Progress
                                                </div>
                                            </div>
                                            <div className="flex gap-4 pt-6 w-full justify-center">
                                                <Button onClick={onBack} variant="outline" size="lg" className="rounded-2xl px-8 h-14 border-slate-200 text-slate-600 hover:bg-slate-50 font-bold">
                                                    Back Home
                                                </Button>
                                                <Button
                                                    onClick={async () => {
                                                        try {
                                                            const session = await fetchWithRetry(finalResult.id);
                                                            if (onComplete) onComplete(session);
                                                        } catch (err) {
                                                            console.error(err);
                                                            alert('Analysis is still processing. Please try again shortly.');
                                                        }
                                                    }}
                                                    size="lg"
                                                    className="bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl px-8 h-14 shadow-xl hover:shadow-indigo-200 transition-all font-bold flex items-center gap-2"
                                                >
                                                    View Detailed Report <ArrowRight size={20} />
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ) : (finalResult && finalResult.analysis) ? (
                                        <ResultReport
                                            key="results"
                                            scores={[
                                                {
                                                    section: 'Reading',
                                                    score: Math.round((finalResult.analysis.reading || []).reduce((acc: any, curr: any) => acc + (curr.overallScore || 0), 0) / (finalResult.analysis.reading?.length || 1)),
                                                    feedback: (finalResult.analysis.reading || []).map((r: any, i: number) => `### Passage ${i + 1}\n${r.feedback || "Analysis completed."}`).join('\n\n---\n\n'),
                                                    data: finalResult.analysis.reading
                                                },
                                                {
                                                    section: 'Listening',
                                                    score: Math.round((finalResult.analysis.listening || []).reduce((acc: any, curr: any) => acc + (curr.overallScore || 0), 0) / (finalResult.analysis.listening?.length || 1)),
                                                    feedback: (finalResult.analysis.listening || []).map((l: any, i: number) => `### Sentence ${i + 1}\n${l.feedback || "Analysis completed."}`).join('\n\n---\n\n'),
                                                    data: finalResult.analysis.listening
                                                },
                                                {
                                                    section: 'Extempore',
                                                    score: typeof finalResult.overallScore === 'number' ? finalResult.overallScore : 0,
                                                    feedback: finalResult.analysis?.extempore?.feedback || finalResult.feedback || "",
                                                    data: finalResult.analysis?.extempore
                                                }
                                            ]}
                                            onRestart={() => window.location.reload()}
                                            onBack={onBack}
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6">
                                            <AlertCircle className="w-16 h-16 text-rose-500" />
                                            <h2 className="text-3xl font-bold text-slate-800">Submission Error</h2>
                                            <p className="text-slate-500">Something went wrong during submission.</p>
                                            <Button onClick={onBack} variant="outline" className="rounded-xl h-12 px-6">Back to Dashboard</Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Floating PIP Camera Feed */}
            {globalStream && currentSection !== 'results' && (
                <div className="hidden lg:flex flex-col absolute bottom-8 right-8 w-64 aspect-[3/4] z-50 transition-transform duration-300 hover:scale-105 shadow-2xl rounded-3xl overflow-hidden pointer-events-none">
                    <div className="relative w-full h-full bg-slate-900 ring-4 ring-white/50 flex flex-col justify-center items-center group pointer-events-auto">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
                        />

                        {/* Camera overlay indicators */}
                        <div className="absolute top-4 left-4 bg-slate-900/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2 transition-opacity">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] text-white font-bold tracking-wider uppercase">Live</span>
                        </div>

                        {/* Audio reactive bar (visual only) */}
                        <div className="absolute bottom-4 inset-x-8 h-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-md">
                            <motion.div
                                className="h-full bg-white/70"
                                animate={{
                                    width: ['10%', '40%', '20%', '60%', '30%', '80%', '40%', '10%']
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
