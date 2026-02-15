'use client';

import { useState } from 'react';
import InterviewLanding from '@/app/components/interview/InterviewLanding';
import InterviewSession from '@/app/components/interview/InterviewSession';
import SubscriptionGuard from '@/app/components/auth/SubscriptionGuard';

export default function InterviewPage() {
    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <SubscriptionGuard requiredPlan="placement_plus" featureName="Mock AI Interview">
                <InterviewLanding />
            </SubscriptionGuard>
        </div>
    );
}
