'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingModal() {
    const router = useRouter();
    const [step, setStep] = useState(1);

    const steps = [
        {
            title: 'Welcome to Acme Corp',
            content: 'You have been selected for the Frontend Developer Intern role. Over the next 21 days, you will work on real-world tasks, attend standups, and ship code.',
            image: 'https://api.dicebear.com/7.x/identicon/svg?seed=Acme',
        },
        {
            title: 'Your Toolkit',
            content: 'We use a standard enterprise stack. You have access to:\n- Outlook (Mail)\n- Slack (Chat)\n- Jira (Tasks)\n- GitLab (Code)',
            image: 'https://api.dicebear.com/7.x/icons/svg?seed=Tools',
        },
        {
            title: 'First Task',
            content: 'Your Tech Lead has sent you an email with setup instructions. Check your inbox to get started.',
            action: 'Go to Inbox',
            link: '/simulation/mail',
        },
    ];

    const currentStep = steps[step - 1];

    const handleNext = () => {
        if (step < steps.length) {
            setStep(step + 1);
        } else {
            router.push(currentStep.link!);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-[#252526] w-full max-w-md rounded-2xl border border-[#444] shadow-2xl overflow-hidden p-8 text-center relative">
                <div className="w-20 h-20 bg-[#333] rounded-full mx-auto mb-6 flex items-center justify-center overflow-hidden border-2 border-blue-500">
                    <img src={currentStep.image} alt="Icon" className="w-12 h-12" />
                </div>

                <h2 className="text-2xl font-bold text-white mb-4">{currentStep.title}</h2>
                <p className="text-gray-400 whitespace-pre-line leading-relaxed mb-8">
                    {currentStep.content}
                </p>

                <div className="flex items-center justify-center gap-2 mb-8">
                    {steps.map((_, i) => (
                        <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i + 1 === step ? 'bg-blue-500' : 'bg-[#444]'}`}></div>
                    ))}
                </div>

                <button
                    onClick={handleNext}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-900/20"
                >
                    {currentStep.action || 'Next'}
                </button>
            </div>
        </div>
    );
}
