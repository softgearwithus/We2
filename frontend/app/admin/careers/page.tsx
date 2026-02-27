'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Briefcase, MapPin, Clock, ExternalLink, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { deleteCareer, fetchCareersAdmin, Career, createCareer, updateCareer } from '@/app/lib/careers';
import CareerModal from './CareerModal';

export default function AdminCareers() {
    const [allCareers, setAllCareers] = useState<Career[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loadError, setLoadError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCareer, setEditingCareer] = useState<Career | null>(null);

    useEffect(() => {
        loadCareers();
    }, []);

    const loadCareers = () => {
        const token = localStorage.getItem('accessToken') || '';
        if (!token) {
            setLoadError('Missing admin token.');
            return;
        }
        fetchCareersAdmin(token)
            .then(setAllCareers)
            .catch((error) => setLoadError(error?.message || 'Failed to load careers.'));
    };

    const handleDelete = async (id: string) => {
        const token = localStorage.getItem('accessToken') || '';
        if (!token) {
            setLoadError('Missing admin token.');
            return;
        }
        const confirmed = window.confirm('Delete this career posting? This will remove it from the public page.');
        if (!confirmed) return;
        setIsDeleting(true);
        try {
            await deleteCareer(token, id);
            setAllCareers((prev) => prev.filter((career) => career.id !== id));
        } catch (error: any) {
            setLoadError(error?.message || 'Failed to delete career.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSaveCareer = async (data: any) => {
        const token = localStorage.getItem('accessToken') || '';
        if (!token) {
            setLoadError('Missing admin token.');
            return;
        }

        try {
            if (editingCareer) {
                await updateCareer(token, editingCareer.id, data);
            } else {
                await createCareer(token, data);
            }
            loadCareers(); // Reload the list
            setIsModalOpen(false);
            setEditingCareer(null);
        } catch (error: any) {
            alert(error.message || 'Failed to save career');
        }
    };

    const openEditModal = (career: Career) => {
        setEditingCareer(career);
        setIsModalOpen(true);
    };

    const openCreateModal = () => {
        setEditingCareer(null);
        setIsModalOpen(true);
    };

    const filteredCareers = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return allCareers.filter(c =>
            c.title.toLowerCase().includes(query) ||
            c.location.toLowerCase().includes(query) ||
            c.type.toLowerCase().includes(query)
        );
    }, [allCareers, searchQuery]);

    const activeCount = useMemo(() => allCareers.filter(c => c.isActive).length, [allCareers]);


    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Careers Posting</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage open job positions listed on the website.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={openCreateModal} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20 flex items-center gap-2">
                        <Plus size={16} />
                        Post Job
                    </button>
                </div>
            </div>

            {loadError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                    {loadError}
                </div>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Briefcase size={20} />
                        </div>
                        <h3 className="text-sm font-medium text-slate-600">Total Postings</h3>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{allCareers.length}</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                            <Filter size={20} />
                        </div>
                        <h3 className="text-sm font-medium text-slate-600">Active Postings</h3>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{activeCount}</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <Search size={20} />
                        </div>
                        <h3 className="text-sm font-medium text-slate-600">Search Results</h3>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{filteredCareers.length}</p>
                </div>
            </div>

            {/* List UI */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by title, location, or type..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm bg-white"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Job Title</th>
                                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredCareers.map((career, index) => (
                                <motion.tr
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2, delay: index * 0.02 }}
                                    key={career.id}
                                    className="hover:bg-slate-50/80 transition-colors group"
                                >
                                    <td className="py-4 px-6">
                                        <div className="font-semibold text-slate-900 truncate">{career.title}</div>
                                        <div className="text-xs text-slate-500 mt-0.5 truncate flex items-center gap-1">
                                            <Clock size={12} /> Posted on {new Date(career.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="flex items-center text-sm text-slate-600 gap-1.5 font-medium">
                                            <MapPin size={14} className="text-slate-400" />
                                            {career.location}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="text-sm font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                                            {career.type}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${career.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                                            }`}>
                                            {career.isActive ? 'Active' : 'Hidden'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openEditModal(career)}
                                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(career.id)}
                                                disabled={isDeleting}
                                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                            {filteredCareers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center">
                                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Briefcase size={24} className="text-slate-400" />
                                        </div>
                                        <h3 className="text-sm font-semibold text-slate-900">No careers found</h3>
                                        <p className="text-xs text-slate-500 mt-1">Adjust your search query or create a new job posting.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            <CareerModal
                isOpen={isModalOpen}
                initialData={editingCareer}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveCareer}
            />
        </div>
    );
}
