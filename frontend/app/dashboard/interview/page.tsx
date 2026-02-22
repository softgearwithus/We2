'use client';

import { useSearchParams } from 'next/navigation';
import InterviewLanding from '@/app/components/interview/InterviewLanding';
import SubscriptionGuard from '@/app/components/auth/SubscriptionGuard';
import { Suspense } from 'react';

function InterviewContent() {
    const searchParams = useSearchParams();
    const mode = searchParams.get('mode') === 'analysis' ? 'analysis' : 'landing';

    return (
        <SubscriptionGuard requiredPlan="standard_tier" featureName="Mock AI Interview">
            <InterviewLanding initialMode={mode} />
        </SubscriptionGuard>
    );
}

export default function InterviewPage() {
    return (
        <div className="w-full h-full">
            <Suspense fallback={<div>Loading...</div>}>
                <InterviewContent />
            </Suspense>
        </div>
    );
}
