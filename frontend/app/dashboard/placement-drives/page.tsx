'use client';

import { fetchApi } from '../../lib/apiClient';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';
import DriveCard from '../../components/placements/DriveCard';
import { Building2, Search, Filter } from 'lucide-react';

export default function PlacementDrivesPage() {
    const { token } = useAuth();
    const [drives, setDrives] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<string>('All');

    useEffect(() => {
        const fetchDrives = async () => {
            setIsLoading(true);
            try {
                // Construct query string based on active filter
                let queryParam = '';
                if (activeFilter === 'Internship') queryParam = '?type=Internship';
                else if (activeFilter === 'Remote') queryParam = '?type=Remote';
                else if (activeFilter === 'Active Hiring') queryParam = '?status=Active Hiring';

                const response = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/placements${queryParam}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setDrives(data);
                }
            } catch (error) {
                console.error("Failed to fetch placement drives", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (token) {
            fetchDrives();
        }
    }, [token, activeFilter]);

    // Local Search Filtering
    const filteredDrives = drives.filter(drive =>
        drive.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        drive.companyName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filterOptions = ['All', 'Internship', 'Remote', 'Active Hiring'];

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                            <Building2 size={20} className="text-emerald-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">Placement Drives</h1>
                    </div>
                    <p className="text-slate-600 max-w-2xl text-lg">
                        Discover exclusive hiring opportunities, internships, and remote roles from our partner network.
                    </p>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search drives by role, company..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
                    <div className="flex items-center gap-2 px-3 text-slate-400 shrink-0">
                        <Filter size={16} />
                        <span className="text-sm font-semibold uppercase tracking-wider">Filters:</span>
                    </div>
                    {filterOptions.map(option => (
                        <button
                            key={option}
                            onClick={() => setActiveFilter(option)}
                            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeFilter === option
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                </div>
            ) : filteredDrives.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDrives.map(drive => (
                        <DriveCard key={drive.id} drive={drive} />
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-4xl text-slate-400">work_off</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No active drives found</h3>
                    <p className="text-slate-500 max-w-sm mx-auto">
                        We couldn't find any placement drives matching your current filters. Try an alternate search term.
                    </p>
                </div>
            )}
        </div>
    );
}
