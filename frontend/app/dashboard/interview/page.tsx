'use client';

import { useState } from 'react';
import InterviewLanding from '@/app/components/interview/InterviewLanding';
import InterviewSession from '@/app/components/interview/InterviewSession';
import SubscriptionGuard from '@/app/components/auth/SubscriptionGuard';

export default function InterviewPage() {
    const [hasStarted, setHasStarted] = useState(false);

    if (hasStarted) {
        return (
            <div className="min-h-screen bg-slate-950 p-4">
                <InterviewSession onEnd={() => setHasStarted(false)} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <SubscriptionGuard requiredPlan="placement_plus" featureName="Mock AI Interview">
                <InterviewLanding onStart={() => setHasStarted(true)} />
            </SubscriptionGuard>
        </div>
    );
}
