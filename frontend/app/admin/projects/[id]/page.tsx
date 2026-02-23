'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { fetchProjectLab, updateProjectLab, type ProjectLab, type ProjectLabComplexity } from '@/app/lib/project-labs';
import NewProjectForm from '../new/page';

export default function EditProjectLabPage() {
    const params = useParams();
    const router = useRouter();
    const id = typeof params?.id === 'string' ? params.id : '';
    const [project, setProject] = useState<ProjectLab | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        fetchProjectLab(id)
            .then(setProject)
            .catch((err) => setError(err?.message || 'Failed to load project.'));
    }, [id]);

    if (!id) {
        return (
            <div className="max-w-4xl mx-auto py-10 text-slate-600">Missing project id.</div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto py-10">
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                    {error}
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="max-w-4xl mx-auto py-10 text-slate-600">Loading project...</div>
        );
    }

    const initialData = {
        targetDomain: project.domainId || '',
        title: project.title || '',
        description: project.description || '',
        complexity: (project.complexity || 'Beginner') as ProjectLabComplexity,
        estimatedTime: project.estimatedTime || '',
        skills: project.skills || [],
        tags: project.tags || [],
        details: project.details || {
            frontend: '',
            backend: '',
            database: '',
            architecture: '',
            prerequisites: [],
            tools: [],
            resources: [],
        },
        readme: project.readme || {
            problem: '',
            solution: '',
            features: [],
            outcomes: [],
        },
        tasks: project.tasks || [],
    };

    const handleSubmit = async (payload: {
        domainId: string;
        title: string;
        description: string;
        complexity: ProjectLabComplexity;
        estimatedTime: string;
        skills: string[];
        tags: string[];
        tasks: Array<{ id: string; title: string; status: string }>;
        readme: typeof initialData.readme;
        details: typeof initialData.details;
    }) => {
        const token = localStorage.getItem('accessToken') || '';
        if (!token) {
            throw new Error('Missing admin token.');
        }
        await updateProjectLab(token, project.id, payload);
        router.push('/admin/projects');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div>
                <Link href="/admin/projects" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-4 font-medium">
                    <ChevronLeft size={16} /> Back to Projects
                </Link>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Edit Project</h1>
                <p className="text-slate-500 mt-1.5 font-medium">Update details and publish changes to students.</p>
            </div>

            <NewProjectForm mode="edit" initialData={initialData} onSubmit={handleSubmit} />
        </div>
    );
}
