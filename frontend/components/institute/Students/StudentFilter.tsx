"use client";

import { SlidersHorizontal } from "lucide-react";

interface FilterProps {
    filters: {
        year: number | null;
        department: string | null;
        status: string | null;
    };
    setFilters: (filters: any) => void;
}

export function StudentFilter({ filters, setFilters }: FilterProps) {
    const departments = ['Computer Science', 'Mechanical', 'Electronics', 'Civil'];
    const statusOptions = ['Placed', 'Looking', 'Higher Studies', 'At Risk'];
    const years = [1, 2, 3, 4];

    const toggleFilter = (key: string, value: any) => {
        setFilters((prev: any) => ({
            ...prev,
            [key]: prev[key] === value ? null : value,
        }));
    };

    return (
        <div className="rounded-3xl bg-white border border-gray-100 p-8 h-fit sticky top-6 shadow-[0_2px_20px_rgb(0,0,0,0.04)]">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
                <div className="p-2.5 rounded-xl bg-orange-50 text-brand-orange shadow-sm border border-orange-100">
                    <SlidersHorizontal className="w-5 h-5" />
                </div>
                <h3 className="font-[900] text-xl text-gray-900 tracking-tight">Filters</h3>
            </div>

            <div className="space-y-8">
                {/* Year Filter */}
                <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Academic Year</h4>
                    <div className="grid grid-cols-4 gap-2">
                        {years.map((year) => (
                            <button
                                key={year}
                                onClick={() => toggleFilter("year", year)}
                                className={`py-3 rounded-xl text-sm font-bold transition-all ${filters.year === year
                                        ? "bg-brand-black text-white shadow-lg"
                                        : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                                    }`}
                            >
                                {year}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Department Filter */}
                <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Department</h4>
                    <div className="space-y-2">
                        {departments.map((dept) => (
                            <button
                                key={dept}
                                onClick={() => toggleFilter("department", dept)}
                                className={`w-full text-left px-5 py-3 rounded-xl text-sm font-semibold transition-all ${filters.department === dept
                                        ? "bg-orange-50 text-brand-orange border border-orange-200"
                                        : "bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-transparent"
                                    }`}
                            >
                                {dept}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Status Filter */}
                <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Placement Status</h4>
                    <div className="flex flex-wrap gap-2">
                        {statusOptions.map((status) => (
                            <button
                                key={status}
                                onClick={() => toggleFilter("status", status)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${filters.status === status
                                        ? "bg-brand-black text-white border-brand-black"
                                        : "bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-900"
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <button
                onClick={() => setFilters({ year: null, department: null, status: null })}
                className="w-full mt-10 py-4 rounded-xl border border-dashed border-gray-300 text-gray-400 text-sm font-bold hover:bg-gray-50 hover:text-gray-900 transition-all hover:border-gray-400"
            >
                Reset Filters
            </button>
        </div>
    );
}
