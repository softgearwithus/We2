'use client';

import React from 'react';

export default function SkillForgeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50 relative font-sans text-slate-900">
            {/* Shared SkillForge Header or Context can go here */}
            {children}
        </div>
    );
}
