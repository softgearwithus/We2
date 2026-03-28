'use client';

import { fetchApi } from '../../lib/apiClient';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, XCircle, ArrowRight, Video, UploadCloud } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface PreInterviewInstructionsProps {
    onStart: (resumeId: string) => void;
    onBack: () => void;
}

export default function PreInterviewInstructions({ onStart, onBack }: PreInterviewInstructionsProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleUpload = async () => {
        if (!file) {
            alert('Please upload your resume (PDF/DOCX).');
            return;
        }
        setIsUploading(true);
        try {
            const { getActiveToken } = await import('@/app/lib/auth-storage');
            const token = getActiveToken();
            if (!token) {
                alert('Please login again.');
                return;
            }
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/interview/vapi/resumes`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            if (!res.ok) {
                throw new Error('Resume upload failed');
            }
            const data = await res.json();
            if (!data?.id) {
                throw new Error('Resume upload failed');
            }
            onStart(data.id);
        } catch (err) {
            console.error(err);
            alert('Resume upload failed. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-4xl mx-auto w-full p-6 space-y-8">
            <div className="text-center space-y-4">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center justify-center p-3 bg-slate-50 rounded-full mb-4"
                >
                    <Video className="w-8 h-8 text-slate-800" />
                </motion.div>
                <h1 className="text-3xl font-bold text-slate-900">Before We Begin</h1>
                <p className="text-slate-500 max-w-lg mx-auto">
                    This is a 15-minute technical interview. Upload your resume and treat it like a real interview.
                    Misconduct policy: Warning 1, Warning 2, third warning ends the session (non-refundable).
                </p>
            </div>

            <div className="w-full max-w-xl">
                <Card className="p-6 border border-slate-200 bg-white/80 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <UploadCloud className="text-slate-800" />
                        <div>
                            <div className="font-bold text-slate-900">Upload Resume</div>
                            <div className="text-xs text-slate-500">PDF or DOCX. Used to personalize questions.</div>
                        </div>
                    </div>
                    <input
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="w-full text-sm text-slate-600"
                    />
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                {/* DO's */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="h-full p-6 bg-emerald-50/50 border-emerald-100 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                            <h3 className="text-lg font-bold text-emerald-900">Do Not Forget</h3>
                        </div>
                        <ul className="space-y-4">
                            <li className="flex gap-3 text-emerald-800">
                                <span className="bg-emerald-200/50 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
                                <span>Find a quiet, well-lit environment.</span>
                            </li>
                            <li className="flex gap-3 text-emerald-800">
                                <span className="bg-emerald-200/50 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
                                <span>Speak clearly and at a moderate pace.</span>
                            </li>
                            <li className="flex gap-3 text-emerald-800">
                                <span className="bg-emerald-200/50 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
                                <span>Maintain eye contact with the visualizer.</span>
                            </li>
                            <li className="flex gap-3 text-emerald-800">
                                <span className="bg-emerald-200/50 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">4</span>
                                <span>Dress professionally (Smart Casual).</span>
                            </li>
                        </ul>
                    </Card>
                </motion.div>

                {/* DONT's */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="h-full p-6 bg-red-50/50 border-red-100 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <XCircle className="w-6 h-6 text-red-600" />
                            <h3 className="text-lg font-bold text-red-900">Avoid These</h3>
                        </div>
                        <ul className="space-y-4">
                            <li className="flex gap-3 text-red-800">
                                <span className="bg-red-200/50 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
                                <span>Using filler words (um, uh, like) excessively.</span>
                            </li>
                            <li className="flex gap-3 text-red-800">
                                <span className="bg-red-200/50 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
                                <span>Checking your phone or other tabs.</span>
                            </li>
                            <li className="flex gap-3 text-red-800">
                                <span className="bg-red-200/50 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
                                <span>Interrupting the AI interviewer.</span>
                            </li>
                            <li className="flex gap-3 text-red-800">
                                <span className="bg-red-200/50 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">4</span>
                                <span>Short, one-word answers. Elaborate!</span>
                            </li>
                        </ul>
                    </Card>
                </motion.div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md pt-8">
                <Button
                    variant="ghost"
                    onClick={onBack}
                    className="flex-1 rounded-xl h-12 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                >
                    Back
                </Button>
                <Button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="flex-1 rounded-xl h-12 bg-slate-800 hover:bg-slate-900 text-white font-bold shadow-lg shadow-slate-200 hover:shadow-slate-200 transition-all transform hover:-translate-y-1"
                >
                    {isUploading ? 'Uploading...' : 'I\'m Ready'} <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}
