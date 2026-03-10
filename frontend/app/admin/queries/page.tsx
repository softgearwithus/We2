'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { motion } from 'framer-motion';
import {
    MessageSquare,
    Search,
    Calendar,
    User,
    Building,
    Mail,
    ChevronDown,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';

interface QueryData {
    id: string;
    name: string;
    email: string;
    subject: string;
    companyName?: string;
    message: string;
    status: string;
    createdAt: string;
}

export default function AdminQueriesDashboard() {
    const { token } = useAuth();
    const [queries, setQueries] = useState<QueryData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedQuery, setSelectedQuery] = useState<QueryData | null>(null);

    useEffect(() => {
        const fetchQueries = async () => {
            if (!token) return;
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/queries`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    setQueries(data);
                } else {
                    console.error('Failed to fetch queries');
                }
            } catch (error) {
                console.error('Error fetching queries:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchQueries();
    }, [token]);

    const handleResolveQuery = async (queryId: string) => {
        if (!token) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/queries/${queryId}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'resolved' })
            });

            if (res.ok) {
                setQueries(prev => prev.map(q => q.id === queryId ? { ...q, status: 'resolved' } : q));
                if (selectedQuery?.id === queryId) {
                    setSelectedQuery({ ...selectedQuery, status: 'resolved' });
                }
            } else {
                console.error('Failed to resolve query');
            }
        } catch (error) {
            console.error('Error resolving query:', error);
        }
    };

    const filteredQueries = queries.filter(q =>
        q.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <MessageSquare className="text-blue-600" size={28} />
                        Contact Inquiries
                    </h1>
                    <p className="text-slate-500 mt-1">Manage and respond to support queries form submissions</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search queries..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full md:w-64 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* List View */}
                <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[600px]">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <h3 className="font-semibold text-slate-800">All Queries</h3>
                        <span className="text-xs bg-slate-200 text-slate-600 font-medium px-2 py-0.5 rounded-full">
                            {filteredQueries.length}
                        </span>
                    </div>

                    <div className="overflow-y-auto flex-1 p-2 space-y-2">
                        {filteredQueries.length > 0 ? (
                            filteredQueries.map(query => (
                                <div
                                    key={query.id}
                                    onClick={() => setSelectedQuery(query)}
                                    className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedQuery?.id === query.id
                                        ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                                        : 'border-transparent hover:bg-slate-50 hover:border-slate-200'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2 overflow-hidden pr-2">
                                            {query.status === 'resolved' && <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />}
                                            <h4 className="font-medium text-slate-900 truncate">{query.name}</h4>
                                        </div>
                                        <span className="text-xs text-slate-400 whitespace-nowrap">
                                            {format(new Date(query.createdAt), 'MMM d')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 truncate mb-2">{query.subject}</p>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium tracking-wide">
                                            <Mail size={10} />
                                            {query.email}
                                        </span>
                                        {query.companyName && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-50 text-orange-600/80 text-[10px] font-medium tracking-wide">
                                                <Building size={10} />
                                                {query.companyName}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 px-4">
                                <MessageSquare className="mx-auto h-8 w-8 text-slate-300 mb-3" />
                                <p className="text-slate-500 text-sm">No queries found matching "{searchTerm}"</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Detail View */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm h-[600px] flex flex-col overflow-hidden">
                    {selectedQuery ? (
                        <>
                            <div className="p-6 border-b border-slate-100">
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <h2 className="text-xl font-bold text-slate-900">{selectedQuery.subject}</h2>
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${
                                        selectedQuery.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                        {selectedQuery.status}
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                                    <div className="flex items-center gap-1.5">
                                        <User size={16} className="text-slate-400" />
                                        <span className="font-medium text-slate-800">{selectedQuery.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Mail size={16} className="text-slate-400" />
                                        <a href={`mailto:${selectedQuery.email}`} className="text-blue-600 hover:underline">
                                            {selectedQuery.email}
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={16} className="text-slate-400" />
                                        <span>{format(new Date(selectedQuery.createdAt), 'MMM d, yyyy • h:mm a')}</span>
                                    </div>
                                    {selectedQuery.companyName && (
                                        <div className="flex items-center gap-1.5 text-orange-600">
                                            <Building size={16} />
                                            <span className="font-medium">{selectedQuery.companyName}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 flex-1 overflow-y-auto bg-slate-50/30">
                                <div className="prose prose-slate max-w-none">
                                    <p className="whitespace-pre-wrap text-slate-700 leading-relaxed font-medium">
                                        {selectedQuery.message}
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 border-t border-slate-100 bg-slate-50 mt-auto flex flex-col md:flex-row gap-3">
                                <a
                                    href={`mailto:${selectedQuery.email}?subject=Re: ${selectedQuery.subject}`}
                                    className="inline-flex items-center justify-center gap-2 w-full md:w-auto px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                    <Mail size={18} />
                                    Reply via Email
                                </a>
                                {selectedQuery.status !== 'resolved' && (
                                    <button
                                        onClick={() => handleResolveQuery(selectedQuery.id)}
                                        className="inline-flex items-center justify-center gap-2 w-full md:w-auto px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                                    >
                                        <CheckCircle2 size={18} />
                                        Mark as Resolved
                                    </button>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <MessageSquare size={32} className="text-slate-300" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-700 mb-1">No Query Selected</h3>
                            <p className="text-sm max-w-xs">Select a query from the list to view its complete details and respond to the user.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
