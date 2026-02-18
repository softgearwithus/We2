'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, Loader2, Sparkles, MoveRight } from 'lucide-react';

// Sub-components
import ReadingSection from './sections/ReadingSection';
import RepeatSection from './sections/RepeatSection';
import ExtemporeSection from './sections/ExtemporeSection';
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
    metadata?: any;
}

interface CommunicationAssessmentProps {
    onBack: () => void;
    onComplete?: (scores: SectionScore[]) => void;
    drillContent: DrillContent;
}

export type AssessmentSection = 'intro' | 'reading' | 'repeat' | 'extempore' | 'results';

export default function CommunicationAssessment({ onBack, onComplete, drillContent }: CommunicationAssessmentProps) {
    const [currentSection, setCurrentSection] = useState<AssessmentSection>('intro');
    const [scores, setScores] = useState<SectionScore[]>([]);

    const [collectedData, setCollectedData] = useState<any>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [finalResult, setFinalResult] = useState<any>(null);

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
            const finalData = { ...collectedData, extempore: scoreData.data };
            setCollectedData(finalData);
            setCurrentSection('results');
            submitAssessment(finalData);
        }
    };

    const submitAssessment = async (fullData: any) => {
        setIsSubmitting(true);
        // setCurrentSection('results'); // Already set in handleSectionComplete

        try {
            const formData = new FormData();

            // Append Reading Files
            // fullData.reading is array of { level, blob, text }
            const readingMeta = fullData.reading.map((item: any, i: number) => {
                formData.append(`reading_${i}`, item.blob, `reading_${i}.webm`);
                return { text: item.text };
            });

            // Append Listening Files
            // fullData.listening is array of { index, blob, text }
            const listeningMeta = fullData.listening.map((item: any, i: number) => {
                formData.append(`listening_${i}`, item.blob, `listening_${i}.webm`);
                return { text: item.text };
            });

            // Append Extempore File
            // fullData.extempore is { topic, blob }
            if (fullData.extempore) {
                formData.append('extempore', fullData.extempore.blob, 'extempore.webm');
            }

            // Append Metadata
            const metadata = {
                reading: readingMeta,
                listening: listeningMeta,
                extempore: { topic: fullData.extempore.topic }
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
            setFinalResult(result);
            if (onComplete) onComplete(scores); // Notify parent (Dashboard) of completion

        } catch (error) {
            console.error("Final submission error", error);
            alert("Failed to generate final report. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="w-full max-w-5xl mx-auto min-h-[70vh] flex flex-col items-center justify-center p-4">
            {/* Progress Bar */}
            <div className="flex items-center gap-4 mb-8 text-sm font-medium text-slate-400">
                {['Reading', 'Listening', 'Extempore'].map((step, idx) => (
                    <div key={step} className={`flex items-center gap-2 ${(currentSection === 'results' ||
                        (currentSection === 'extempore' && idx < 2) ||
                        (currentSection === 'repeat' && idx < 1)) ? 'text-emerald-500' :
                        currentSection.includes(step.toLowerCase()) ? 'text-indigo-600' : ''
                        }`}>
                        <div className={`w-3 h-3 rounded-full ${(currentSection === 'results' ||
                            (currentSection === 'extempore' && idx < 2) ||
                            (currentSection === 'repeat' && idx < 1)) ? 'bg-emerald-500' :
                            step.toLowerCase().includes(currentSection) ? 'bg-indigo-600' : 'bg-slate-300'
                            }`} />
                        {step}
                    </div>
                ))}
            </div>

            <AnimatePresence mode='wait'>
                {currentSection === 'intro' && (
                    <motion.div
                        key="intro"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="text-center space-y-6 max-w-2xl"
                    >
                        <h1 className="text-4xl font-bold text-slate-900">Communication Assessment</h1>
                        <p className="text-lg text-slate-600">
                            Theme: <span className="font-semibold text-indigo-600">{drillContent.theme}</span>
                        </p>
                        <p className="text-slate-500">
                            This comprehensive assessment evaluates your verbal communication skills across three key areas.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                            <Card className="p-4 border-l-4 border-l-indigo-500">
                                <h3 className="font-bold text-indigo-700">1. Reading</h3>
                                <p className="text-xs text-slate-500 mt-1">Read 3 passages aloud to test fluency.</p>
                            </Card>
                            <Card className="p-4 border-l-4 border-l-purple-500">
                                <h3 className="font-bold text-purple-700">2. Listening</h3>
                                <p className="text-xs text-slate-500 mt-1">Listen and repeat 3 phrases exactly.</p>
                            </Card>
                            <Card className="p-4 border-l-4 border-l-pink-500">
                                <h3 className="font-bold text-pink-700">3. Extempore</h3>
                                <p className="text-xs text-slate-500 mt-1">Speak on a topic for 60 seconds.</p>
                            </Card>
                        </div>

                        <div className="pt-8 flex gap-4 justify-center">
                            <Button variant="ghost" onClick={onBack}>Back</Button>
                            <Button onClick={() => setCurrentSection('reading')} size="lg" className="bg-indigo-600 hover:bg-indigo-700 shadow-lg">
                                Start Assessment <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </div>
                    </motion.div>
                )}

                {currentSection === 'reading' && (
                    <ReadingSection key="reading" onComplete={handleSectionComplete} passages={drillContent.reading} />
                )}

                {currentSection === 'repeat' && (
                    <RepeatSection key="repeat" onComplete={handleSectionComplete} sentences={drillContent.listening} />
                )}

                {currentSection === 'extempore' && (
                    <ExtemporeSection
                        key="extempore"
                        onComplete={handleSectionComplete}
                        topicContent={drillContent.extempore}
                        previousRecordings={collectedData}
                    />
                )}

                {currentSection === 'results' && (
                    <div className="w-full">
                        {isSubmitting ? (
                            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
                                <Loader2 className="w-16 h-16 text-indigo-500 animate-spin" />
                                <h2 className="text-2xl font-bold text-slate-800">Uploading Drill...</h2>
                                <p className="text-slate-500">Sending your recordings to Prep0 AI for analysis.</p>
                            </div>
                        ) : finalResult && finalResult.status === 'in_progress' ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center min-h-[400px] space-y-8 bg-white p-12 rounded-3xl border border-indigo-100 shadow-xl text-center"
                            >
                                <div className="relative">
                                    <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 animate-pulse rounded-full" />
                                    <Sparkles className="w-20 h-20 text-indigo-600 relative z-10" />
                                </div>
                                <div className="space-y-4 max-w-md">
                                    <h2 className="text-3xl font-bold text-slate-900">Drill Submitted!</h2>
                                    <p className="text-slate-600">
                                        Your recordings are now being analyzed by our AI Coach. This usually takes about 30-45 seconds.
                                    </p>
                                    <div className="flex items-center justify-center gap-2 text-indigo-600 font-semibold bg-indigo-50 px-4 py-2 rounded-full">
                                        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-ping" />
                                        Live Analysis in Progress
                                    </div>
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <Button onClick={onBack} variant="outline" size="lg" className="rounded-xl px-8">
                                        Home
                                    </Button>
                                    <Button onClick={() => { if (onComplete) onComplete(scores); }} size="lg" className="bg-indigo-600 text-white rounded-xl px-8 shadow-lg shadow-indigo-100 flex items-center gap-2">
                                        Go to Mocks Analysis <ArrowRight size={18} />
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
                                        score: finalResult.overallScore || 0,
                                        feedback: finalResult.analysis?.extempore?.feedback || finalResult.feedback || "",
                                        data: finalResult.analysis?.extempore
                                    }
                                ]}
                                onRestart={() => window.location.reload()}
                                onBack={onBack}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
                                <Sparkles className="w-16 h-16 text-indigo-500 animate-pulse" />
                                <h2 className="text-2xl font-bold text-slate-800">Submission Error</h2>
                                <p className="text-slate-500">Something went wrong during submission.</p>
                                <Button onClick={onBack}>Back to Dashboard</Button>
                            </div>
                        )}
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
