'use client';

import React from 'react';
import HRTemplate from '@/app/components/skillforge/templates/HRTemplate';

export default function HRPage() {
    return (
        <HRTemplate
            title="HR Interview Practice"
            description="Master behavioral questions with AI-driven roleplay."
            initialMessages={[
                { id: '1', sender: 'bot', text: 'Hello! I am your HR interviewer. Tell me about yourself.', suggestions: ['I am a recent grad...', 'I am passionate about...'] }
            ]}
        />
    );
}
