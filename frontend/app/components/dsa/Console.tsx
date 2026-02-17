import { ExecutionResult } from '@/app/lib/executor';
import { Terminal, CheckCircle2, XCircle, AlertCircle, Play, Send } from 'lucide-react';

interface ConsoleProps {
    onRun: () => void;
    onSubmit: () => void;
    isRunning: boolean;
    isSubmitting?: boolean;
    submitLabel?: string;
    submitDisabled?: boolean;
    runDisabled?: boolean;
    result: ExecutionResult | null;
}

export default function Console({ onRun, onSubmit, isRunning, isSubmitting = false, submitLabel, submitDisabled = false, runDisabled = false, result }: ConsoleProps) {
    const isBusy = isRunning || isSubmitting;
    const isRunDisabled = isBusy || runDisabled;
    const isSubmitDisabled = isBusy || submitDisabled;
    const submitText = isSubmitting ? 'Submitting...' : submitLabel || 'Submit';

    return (
        <div className="h-full flex flex-col bg-slate-50 border-t border-slate-200">
            {/* Console Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-100 border-b border-slate-200">
                <button className="flex items-center gap-2 text-xs font-bold text-slate-600 px-3 py-1.5 rounded hover:bg-slate-200 transition-colors">
                    <Terminal size={14} />
                    Console
                </button>
                <div className="flex gap-2">
                    <button
                        onClick={onRun}
                        disabled={isRunDisabled}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                    >
                        <Play size={14} className="fill-slate-700" />
                        Run
                    </button>
                    <button
                        onClick={onSubmit}
                        disabled={isSubmitDisabled}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 shadow-sm shadow-green-600/20"
                    >
                        {isSubmitting ? (
                            <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Send size={14} />
                        )}
                        {submitText}
                    </button>
                </div>
            </div>

            {/* Console Output */}
            <div className="flex-1 p-4 overflow-y-auto font-mono text-sm">
                {!result && !isRunning && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                        <Terminal size={32} className="opacity-20" />
                        <p>Run your code to compare against test cases.</p>
                    </div>
                )}

                {isRunning && (
                    <div className="h-full flex flex-col items-center justify-center gap-3">
                        <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
                        <p className="text-slate-500 text-xs font-bold animate-pulse">Running Test Cases...</p>
                    </div>
                )}

                {result && !isRunning && (
                    <div className="space-y-4">
                        {/* Result Header */}
                        <div className={`flex items-center gap-2 text-lg font-bold ${result.status === 'Accepted' ? 'text-green-600' :
                                result.status === 'Wrong Answer' ? 'text-red-500' : 'text-amber-500'
                            }`}>
                            {result.status === 'Accepted' && <CheckCircle2 size={24} />}
                            {result.status === 'Wrong Answer' && <XCircle size={24} />}
                            {result.status === 'Runtime Error' && <AlertCircle size={24} />}
                            {result.status}
                        </div>

                        {/* Metrics */}
                        <div className="flex gap-6 text-xs text-slate-500">
                            <div>Runtime: <span className="font-bold text-slate-900">{result.runtime}</span></div>
                            <div>Memory: <span className="font-bold text-slate-900">{result.memory}</span></div>
                            <div>Passed: <span className="font-bold text-slate-900">{result.passedTests}/{result.totalTests}</span></div>
                        </div>

                        {/* Error Details */}
                        {result.error && (
                            <div className="bg-red-50 text-red-700 p-3 rounded-lg border border-red-100 whitespace-pre-wrap">
                                {result.error}
                            </div>
                        )}

                        {/* Failed Case Diff */}
                        {result.failedCase && (
                            <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                                <h4 className="text-xs font-bold text-red-700 uppercase mb-3">Failed Test Case</h4>
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Input</div>
                                        <div className="bg-white p-2 rounded border border-red-200 text-slate-800">{result.failedCase.input}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Output</div>
                                        <div className="bg-white p-2 rounded border border-red-200 text-red-600">{result.failedCase.actual}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Expected</div>
                                        <div className="bg-white p-2 rounded border border-red-200 text-green-600">{result.failedCase.expected}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
