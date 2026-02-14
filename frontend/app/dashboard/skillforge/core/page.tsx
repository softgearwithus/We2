'use client';

import React from 'react';
import CoreSubjectTemplate from '@/app/components/skillforge/templates/CoreSubjectTemplate';

export default function CorePage() {
    return (
        <CoreSubjectTemplate
            subjectName="Operating Systems"
            professorName="Dr. Alan Turing"
            units={[
                { id: '1', title: 'Process Management', progress: 80 },
                { id: '2', title: 'Memory Management', progress: 45 },
                { id: '3', title: 'File Systems', progress: 10 },
                { id: '4', title: 'I/O Systems', progress: 0 },
            ]}
        />
    );
}
