'use client';

import React, { createContext, useContext } from 'react';
import UsageUpgradeGate from '@/app/components/shared/UsageUpgradeGate';
import { useSectionUsage } from '@/app/hooks/useSectionUsage';

type TestSeriesUsageContextValue = {
    remainingLabel: string;
    isLimited: boolean;
    isFreePlan: boolean;
};

const TestSeriesUsageContext = createContext<TestSeriesUsageContextValue>({
    remainingLabel: '—',
    isLimited: false,
    isFreePlan: true,
});

export const useTestSeriesUsage = () => useContext(TestSeriesUsageContext);

export default function TestSeriesLayout({ children }: { children: React.ReactNode }) {
    const usage = useSectionUsage('test_series');
    return (
        <TestSeriesUsageContext.Provider value={usage}>
            <div className="relative">
                {usage.isLimited && (
                    <UsageUpgradeGate message="Upgrade to continue your test series." />
                )}
                {children}
            </div>
        </TestSeriesUsageContext.Provider>
    );
}
