'use client';

import React from 'react';
import TechnologyTemplate from '@/app/components/skillforge/templates/TechnologyTemplate';
import { Globe, Server, Database } from 'lucide-react';

export default function TechnologyPage() {
    return (
        <TechnologyTemplate
            technology="Full Stack Development"
            description="Master the MERN stack with this comprehensive guide."
            stackItems={[
                { id: '1', title: 'Frontend', description: 'React, Tailwind, Next.js', icon: Globe },
                { id: '2', title: 'Backend', description: 'Node.js, Express', icon: Server },
                { id: '3', title: 'Database', description: 'MongoDB, PostgreSQL', icon: Database },
            ]}
        />
    );
}
