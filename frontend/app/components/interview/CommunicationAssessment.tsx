'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

// Sub-components (will be implemented in same file for now for cohesion, can separate later)
import ReadingSection from './sections/ReadingSection';
import RepeatSection from './sections/RepeatSection';
import ExtemporeSection from './sections/ExtemporeSection';
import ResultReport from './sections/ResultReport';
import VideoQASection from './sections/VideoQASection';

export interface SectionScore {
    section: string;
    score: number; // 0-100
    feedback: string;
}

interface CommunicationAssessmentProps {
    onBack: () => void;
    onComplete?: (scores: SectionScore[]) => void;
}

export type AssessmentSection = 'intro' | 'reading' | 'repeat' | 'extempore' | 'videoQA' | 'results';


export default function CommunicationAssessment({ onBack, onComplete }: CommunicationAssessmentProps) {
    const [currentSection, setCurrentSection] = useState<AssessmentSection>('intro');
    const [scores, setScores] = useState<SectionScore[]>([]);

    const handleSectionComplete = (scoreData: SectionScore) => {
        const newScores = [...scores, scoreData];
        setScores(newScores);

        // Navigation logic
        if (currentSection === 'reading') setCurrentSection('repeat');
        else if (currentSection === 'repeat') setCurrentSection('extempore');
        else if (currentSection === 'extempore') setCurrentSection('videoQA');
        else if (currentSection === 'videoQA') {
            // If we have an onComplete prop (new flow), use it.
            // Otherwise, fallback to the old internal result screen (legacy flow)
            if (onComplete) {
                onComplete(newScores);
            } else {
                setCurrentSection('results');
            }
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto min-h-[70vh] flex flex-col items-center justify-center p-4">
            {/* Progress Bar or Steps */}
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
                            This comprehensive assessment evaluates your verbal communication skills across three key areas similar to industry standards (like SVAR/SHL).
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                            <Card className="p-4 border-l-4 border-l-indigo-500">
                                <h3 className="font-bold text-indigo-700">1. Reading</h3>
                                <p className="text-xs text-slate-500 mt-1">Test your fluency and pronunciation by reading sentences aloud.</p>
                            </Card>
                            <Card className="p-4 border-l-4 border-l-purple-500">
                                <h3 className="font-bold text-purple-700">2. Listening</h3>
                                <p className="text-xs text-slate-500 mt-1">Listen to phrases and repeat them exactly to test memory and accuracy.</p>
                            </Card>
                            <Card className="p-4 border-l-4 border-l-pink-500">
                                <h3 className="font-bold text-pink-700">3. Extempore</h3>
                                <p className="text-xs text-slate-500 mt-1">Speak spontaneously on a topic for 60 seconds to test coherence.</p>
                            </Card>
                            <Card className="p-4 border-l-4 border-l-emerald-500">
                                <h3 className="font-bold text-emerald-700">4. Video QA</h3>
                                <p className="text-xs text-slate-500 mt-1">Simulated video interview with TTS questions and camera.</p>
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
                    <ReadingSection key="reading" onComplete={handleSectionComplete} />
                )}

                {currentSection === 'repeat' && (
                    <RepeatSection key="repeat" onComplete={handleSectionComplete} />
                )}

                {currentSection === 'extempore' && (
                    <ExtemporeSection key="extempore" onComplete={handleSectionComplete} />
                )}

                {currentSection === 'videoQA' && (
                    <VideoQASection key="videoQA" onComplete={handleSectionComplete} />
                )}

                {currentSection === 'results' && (
                    <ResultReport key="results" scores={scores} onRestart={() => window.location.reload()} onBack={onBack} />
                )}
            </AnimatePresence>
        </div>
    );
}
