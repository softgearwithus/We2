'use client';

import { useState } from 'react';
import OnboardingModal from '@/app/components/OnboardingModal';
import SubscriptionGuard from '@/app/components/auth/SubscriptionGuard';

export default function SimulationPage() {
    const [showOnboarding, setShowOnboarding] = useState(true);

    return (
        <div className="p-8 h-full bg-[#1e1e1e] flex flex-col items-center justify-center text-center">
            <SubscriptionGuard requiredPlan="pro" featureName="Virtual Workstation">
                {showOnboarding && <OnboardingModal />}

                <div className="max-w-2xl">
                    <div className="w-24 h-24 bg-[#333] rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-lg border border-[#444]">
                        <span className="material-symbols-outlined text-5xl text-gray-500">computer</span>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-4">Workstation Locked</h1>
                    <p className="text-xl text-gray-500 mb-8">
                        Please check your <span className="text-blue-400 font-bold">Inbox</span> for onboarding instructions to unlock your development environment.
                    </p>

                    <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto opacity-50 pointer-events-none filter blur-[1px]">
                        <div className="bg-[#252526] p-4 rounded-xl border border-[#333]">
                            <div className="h-2 w-12 bg-[#444] rounded mb-2"></div>
                            <div className="h-2 w-24 bg-[#333] rounded"></div>
                        </div>
                        <div className="bg-[#252526] p-4 rounded-xl border border-[#333]">
                            <div className="h-2 w-12 bg-[#444] rounded mb-2"></div>
                            <div className="h-2 w-24 bg-[#333] rounded"></div>
                        </div>
                    </div>
                </div>
            </SubscriptionGuard>
        </div>
    );
}
