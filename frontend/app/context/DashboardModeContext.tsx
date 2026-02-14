'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type DashboardMode = 'prep' | 'work';

interface DashboardModeContextType {
    mode: DashboardMode;
    toggleMode: () => void;
    setMode: (mode: DashboardMode) => void;
}

const DashboardModeContext = createContext<DashboardModeContextType | undefined>(undefined);

export function DashboardModeProvider({ children }: { children: ReactNode }) {
    const [mode, setModeState] = useState<DashboardMode>('prep');

    useEffect(() => {
        // Load persisted mode
        const savedMode = localStorage.getItem('dashboard_mode') as DashboardMode;
        if (savedMode) {
            setModeState(savedMode);
        }
    }, []);

    const setMode = (newMode: DashboardMode) => {
        setModeState(newMode);
        localStorage.setItem('dashboard_mode', newMode);
    };

    const toggleMode = () => {
        const newMode = mode === 'prep' ? 'work' : 'prep';
        setMode(newMode);
    };

    return (
        <DashboardModeContext.Provider value={{ mode, toggleMode, setMode }}>
            {children}
        </DashboardModeContext.Provider>
    );
}

export function useDashboardMode() {
    const context = useContext(DashboardModeContext);
    return context; // Now returns undefined if not in provider, consumer must handle checks
}
