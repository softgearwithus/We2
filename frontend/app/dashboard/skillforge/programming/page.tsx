'use client';

import React from 'react';
import ProgrammingLanguageTemplate from '@/app/components/skillforge/templates/ProgrammingLanguageTemplate';

// Mock Data
const pythonChapters = [
    { id: '1', title: 'Python Basics & Syntax', completed: true },
    { id: '2', title: 'Data Structures (Lists, Dicts)', completed: true },
    { id: '3', title: 'Object Oriented Programming', completed: false },
    { id: '4', title: 'File Handling & APIs', completed: false },
    { id: '5', title: 'Advanced Concepts (Decorators)', completed: false },
];

export default function ProgrammingPage() {
    return (
        <ProgrammingLanguageTemplate
            language="Python"
            chapters={pythonChapters}
            currentChapterId="3"
        />
    );
}
