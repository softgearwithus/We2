'use client';

export default function SimulationDashboard() {
    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Sprint 4 Overview</h2>
                    <p className="text-slate-500">Current Focus: Backend API Integration & Optimization</p>
                </div>
                <button
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">add</span>
                    Create Issue
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Sprint Velocity', value: '24 pts', sub: '+12% vs last sprint', icon: 'speed', color: 'text-indigo-500', bg: 'bg-indigo-50' },
                    { label: 'Active Tickets', value: '8', sub: '3 High Priority', icon: 'confirmation_number', color: 'text-blue-500', bg: 'bg-blue-50' },
                    { label: 'PRs Merged', value: '14', sub: 'Code Quality: A+', icon: 'merge_type', color: 'text-purple-500', bg: 'bg-purple-50' },
                    { label: 'Bugs Sqashed', value: '42', sub: 'Lifetime count', icon: 'bug_report', color: 'text-red-500', bg: 'bg-red-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                                <span className={`material-symbols-outlined ${stat.color} text-2xl`}>{stat.icon}</span>
                            </div>
                            <span className="text-xs font-bold bg-slate-50 text-slate-500 px-2 py-1 rounded-lg">Sprint 4</span>
                        </div>
                        <h3 className="text-3xl font-extrabold text-slate-900 mb-1">{stat.value}</h3>
                        <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                        <p className="text-xs text-slate-400 mt-2">{stat.sub}</p>
                    </div>
                ))}
            </div>

            {/* Kanban Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-900 text-lg">Active Sprint Board</h3>
                        <button className="text-sm text-indigo-600 font-bold hover:underline">View Board</button>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-slate-50 p-3 rounded-xl">
                            <div className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-slate-300"></span> To Do
                            </div>
                            <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 mb-2">
                                <span className="text-xs font-semibold text-slate-500 tracking-wide">SMP-102</span>
                                <p className="text-sm font-medium text-slate-800 mt-1">Design user profile schema</p>
                            </div>
                            <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200">
                                <span className="text-xs font-semibold text-slate-500 tracking-wide">SMP-105</span>
                                <p className="text-sm font-medium text-slate-800 mt-1">Setup Redis caching</p>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl">
                            <div className="text-xs font-bold text-indigo-400 uppercase mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span> In Progress
                            </div>
                            <div className="bg-white p-3 rounded-lg shadow-sm border border-indigo-100 mb-2">
                                <span className="text-xs font-semibold text-indigo-500 tracking-wide">SMP-99</span>
                                <p className="text-sm font-medium text-slate-800 mt-1">Implement Auth0 Login</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">High</span>
                                    <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-[10px] flex items-center justify-center font-bold">AM</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl">
                            <div className="text-xs font-bold text-emerald-400 uppercase mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Done
                            </div>
                            <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 mb-2 opacity-60">
                                <span className="text-xs font-semibold text-slate-500 tracking-wide">SMP-81</span>
                                <p className="text-sm font-medium text-slate-800 mt-1 line-through">Init Next.js Project</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-slate-900 text-lg mb-6">Code Review Requests</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                                    <span className="material-symbols-outlined">code</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">feat: Add payment gateway</p>
                                    <p className="text-xs text-slate-500">Opened 2h ago by @sarah_dev</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 py-3 rounded-xl border-2 border-slate-100 text-sm font-bold text-slate-600 hover:border-indigo-600 hover:text-indigo-600 transition-all">
                        View All PRs
                    </button>
                </div>
            </div>
        </div>
    );
}
