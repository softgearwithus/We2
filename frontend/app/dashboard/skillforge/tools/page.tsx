'use client';

import React from 'react';
import ToolTemplate from '@/app/components/skillforge/templates/ToolTemplate';

export default function ToolsPage() {
    return (
        <ToolTemplate
            toolName="Git & GitHub"
            description="Version control essentials for every developer."
            steps={[
                { id: '1', title: 'Initialize Repository', description: 'git init' },
                { id: '2', title: 'Stage Changes', description: 'git add .' },
                { id: '3', title: 'Commit', description: 'git commit -m "message"' },
                { id: '4', title: 'Push', description: 'git push origin main' },
            ]}
        />
    );
}
