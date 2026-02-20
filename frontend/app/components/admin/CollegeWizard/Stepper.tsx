'use client';

import { Check } from 'lucide-react';

interface StepperProps {
    currentStep: number;
    totalSteps: number;
    steps: string[];
}

export default function Stepper({ currentStep, totalSteps, steps }: StepperProps) {
    return (
        <div className="w-full py-4 px-2">
            <div className="flex items-center justify-between relative max-w-4xl mx-auto">
                {/* Progress Line Background */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 -z-10"></div>

                {/* Active Progress Line */}
                <div
                    className="absolute top-1/2 left-0 h-0.5 bg-blue-600 -translate-y-1/2 -z-10 transition-all duration-500 ease-in-out"
                    style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
                ></div>

                {steps.map((label, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = currentStep > stepNumber;
                    const isActive = currentStep === stepNumber;

                    return (
                        <div key={index} className="flex flex-col items-center gap-2 relative">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCompleted
                                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                        : isActive
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20 ring-4 ring-blue-100'
                                            : 'bg-white border-slate-200 text-slate-400'
                                    }`}
                            >
                                {isCompleted ? (
                                    <Check size={20} strokeWidth={3} />
                                ) : (
                                    <span className="text-sm font-bold">{stepNumber}</span>
                                )}
                            </div>
                            <span
                                className={`text-xs font-bold whitespace-nowrap absolute top-12 transition-colors duration-300 ${isActive || isCompleted ? 'text-slate-900' : 'text-slate-400'
                                    }`}
                            >
                                {label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
