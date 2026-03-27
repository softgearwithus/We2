'use client';

import React, { createContext, useContext } from 'react';

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
    const usage = {
        remainingLabel: 'Unlimited',
        isLimited: false,
        isFreePlan: false,
    };
    return (
        <TestSeriesUsageContext.Provider value={usage}>
            <div className="relative">{children}</div>
        </TestSeriesUsageContext.Provider>
    );
}
