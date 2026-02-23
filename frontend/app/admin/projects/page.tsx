'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Code2, Clock, CalendarDays, ExternalLink, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { deleteProjectLab, fetchProjectLabsAdmin, ProjectLab } from '@/app/lib/project-labs';

export default function AdminProjects() {
    const [allProjects, setAllProjects] = useState<ProjectLab[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loadError, setLoadError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('accessToken') || '';
        if (!token) {
            setLoadError('Missing admin token.');
            return;
        }
        fetchProjectLabsAdmin(token)
            .then(setAllProjects)
            .catch((error) => setLoadError(error?.message || 'Failed to load projects.'));
    }, []);

    const handleDelete = async (id: string) => {
        const token = localStorage.getItem('accessToken') || '';
        if (!token) {
            setLoadError('Missing admin token.');
            return;
        }
        const confirmed = window.confirm('Delete this project lab? This will hide it from students.');
        if (!confirmed) return;
        setIsDeleting(true);
        try {
            await deleteProjectLab(token, id);
            setAllProjects((prev) => prev.filter((project) => project.id !== id));
        } catch (error: any) {
            setLoadError(error?.message || 'Failed to delete project.');
        } finally {
            setIsDeleting(false);
        }
    };

    // Simplistic search filter on title or domain
    const filteredProjects = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return allProjects.filter(p =>
            p.title.toLowerCase().includes(query) ||
            (p.domainId || '').toLowerCase().includes(query)
        );
    }, [allProjects, searchQuery]);

    const domainCount = useMemo(() => {
        const set = new Set(allProjects.map((project) => project.domainId));
        return set.size;
    }, [allProjects]);


    return (
            <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Project Labs Library</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage the hands-on project portfolio available to students.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">
                        <Filter size={16} />
                        Filters
                    </button>
                    <Link
                        href="/admin/projects/new"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20 flex items-center gap-2"
                    >
                        <Plus size={16} />
                        Upload Project
                    </Link>
                </div>
            </div>

            {loadError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                    {loadError}
                </div>
            )}

            {/* Stats/Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Code2 size={20} />
                        </div>
                        <h3 className="text-sm font-medium text-slate-600">Total Projects</h3>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{allProjects.length}</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                            <Clock size={20} />
                        </div>
                        <h3 className="text-sm font-medium text-slate-600">Total Hours</h3>
                    </div>
                    {/* Rough estimate calculation */}
                    <p className="text-2xl font-bold text-slate-900">
                        {Math.floor(allProjects.reduce((acc, curr) => acc + parseInt(curr.estimatedTime.split(' ')[0] || '0'), 0))}h+
                    </p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                            <CalendarDays size={20} />
                        </div>
                        <h3 className="text-sm font-medium text-slate-600">Domains</h3>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{domainCount}</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <Search size={20} />
                        </div>
                        <h3 className="text-sm font-medium text-slate-600">Search Results</h3>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{filteredProjects.length}</p>
                </div>
            </div>

            {/* List UI */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search by title or domain..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm bg-white"
                            />
                    </div>
                    {/* Optional: Add Pagination controls here later */}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Project</th>
                                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Domain</th>
                                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Complexity</th>
                                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Est. Time</th>
                                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredProjects.slice(0, 15).map((project, index) => (
                                <motion.tr
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2, delay: index * 0.02 }}
                                    key={project.id}
                                    className="hover:bg-slate-50/80 transition-colors group"
                                >
                                    <td className="py-4 px-6">
                                        <div className="font-semibold text-slate-900 max-w-xs truncate">{project.title}</div>
                                        <div className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">{project.description}</div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="text-xs text-slate-500">{project.domainId}</span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${project.complexity === 'Beginner' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                                project.complexity === 'Intermediate' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                                                    'bg-rose-50 text-rose-700 border border-rose-100'
                                            }`}>
                                            {project.complexity}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="flex items-center text-sm text-slate-600 gap-1.5 font-medium">
                                            <Clock size={14} className="text-slate-400" />
                                            {project.estimatedTime}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link
                                                href={`/admin/projects/${project.id}`}
                                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(project.id)}
                                                disabled={isDeleting}
                                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                            <button className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors" title="View details">
                                                <ExternalLink size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                            {filteredProjects.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center">
                                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Search size={24} className="text-slate-400" />
                                        </div>
                                        <h3 className="text-sm font-semibold text-slate-900">No projects found</h3>
                                        <p className="text-xs text-slate-500 mt-1">Adjust your search query and try again.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-slate-200 bg-slate-50 text-center text-xs text-slate-500">
                    Showing {Math.min(filteredProjects.length, 15)} of {filteredProjects.length} projects. (Pagination Demo)
                </div>
            </div>
        </div>
    );
}
