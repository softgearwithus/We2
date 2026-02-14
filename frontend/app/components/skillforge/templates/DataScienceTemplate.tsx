'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Database, Table as TableIcon, BarChart, Code, FileSpreadsheet, Terminal, Search, Info, PieChart, Activity, TrendingUp, ChevronDown, ListFilter } from 'lucide-react';

interface Row {
    id: number;
    name: string;
    department: string;
    salary: number;
    experience: number;
}

export default function DataScienceTemplate() {
    const [activeTab, setActiveTab] = useState<'sql' | 'pandas'>('sql');
    const [query, setQuery] = useState('SELECT * FROM employees WHERE department = "Engineering";');
    const [output, setOutput] = useState<Row[] | null>(null);
    const [chartType, setChartType] = useState<'bar' | 'pie' | 'line'>('bar');
    const [isExecuting, setIsExecuting] = useState(false);

    const schema = {
        tableName: 'employees',
        columns: [
            { name: 'id', type: 'INT', primary: true },
            { name: 'name', type: 'VARCHAR(100)' },
            { name: 'department', type: 'VARCHAR(50)' },
            { name: 'salary', type: 'DECIMAL(10,2)' },
            { name: 'experience', type: 'INT' },
        ]
    };

    const mockSQLData: Row[] = [
        { id: 101, name: 'Alice Chen', department: 'Engineering', salary: 85000, experience: 5 },
        { id: 102, name: 'Bob Smith', department: 'Engineering', salary: 92000, experience: 8 },
        { id: 103, name: 'Charlie Day', department: 'HR', salary: 62000, experience: 3 },
        { id: 104, name: 'David Lee', department: 'Engineering', salary: 78000, experience: 4 },
        { id: 105, name: 'Emma Wilson', department: 'Sales', salary: 71000, experience: 6 },
        { id: 106, name: 'Frank Moore', department: 'Engineering', salary: 115000, experience: 12 },
    ];

    const stats = useMemo(() => {
        if (!output || output.length === 0) return null;
        const salaries = output.map(r => r.salary);
        return {
            avg: Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length),
            max: Math.max(...salaries),
            min: Math.min(...salaries),
            count: output.length
        };
    }, [output]);

    const handleRun = () => {
        setIsExecuting(true);
        // Simulate network latency
        setTimeout(() => {
            if (activeTab === 'sql') {
                if (query.toLowerCase().includes('engineering')) {
                    setOutput(mockSQLData.filter(d => d.department === 'Engineering'));
                } else if (query.toLowerCase().includes('*')) {
                    setOutput(mockSQLData);
                } else {
                    setOutput([]);
                }
            } else {
                // Mock pandas output for visualization
                setOutput(mockSQLData);
            }
            setIsExecuting(false);
        }, 600);
    };

    return (
        <div className="h-screen bg-white flex flex-col font-sans overflow-hidden">

            {/* Minimal High-Tech Toolbar */}
            <header className="h-16 bg-slate-900 border-b border-white/5 flex items-center justify-between px-6 shrink-0 z-20">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                            <Activity size={18} />
                        </div>
                        <h1 className="text-white font-black tracking-tighter text-lg uppercase">Analyzer Lab</h1>
                    </div>

                    <div className="h-6 w-px bg-white/10"></div>

                    <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('sql')}
                            className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'sql' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <Database size={14} /> SQL
                        </button>
                        <button
                            onClick={() => setActiveTab('pandas')}
                            className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'pandas' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <FileSpreadsheet size={14} /> PANDAS
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-3 text-emerald-400/80 text-[10px] font-black uppercase tracking-widest mr-4">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                        Kernel Ready
                    </div>
                    <button
                        onClick={handleRun}
                        disabled={isExecuting}
                        className={`flex items-center gap-2 px-6 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white font-black text-sm rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-500/20 ${isExecuting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isExecuting ? <TrendingUp size={16} className="animate-bounce" /> : <Play size={16} fill="currentColor" />}
                        {activeTab === 'sql' ? 'EXECUTE SQL' : 'RUN CELL'}
                    </button>
                </div>
            </header>

            {/* Main Workbench Layout */}
            <div className="flex-1 flex overflow-hidden">

                {/* Left Sidebar: Schema Explorer */}
                <div className="w-72 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
                    <div className="p-5 border-b border-slate-200">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center justify-between">
                            Schema Explorer <Info size={12} className="text-slate-300" />
                        </h2>
                        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm group">
                            <div className="flex items-center gap-2 text-slate-700 font-bold text-sm mb-1">
                                <TableIcon size={14} className="text-indigo-500" /> {schema.tableName}
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium">PostgreSQL Relational Table</p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto p-4 space-y-2">
                        {schema.columns.map(col => (
                            <div key={col.name} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:border-indigo-200 transition-colors cursor-default group">
                                <div className="flex items-center gap-2">
                                    <div className="text-xs font-bold text-slate-700">{col.name}</div>
                                    {col.primary && <span className="text-[9px] bg-amber-100 text-amber-700 px-1 rounded font-black">PK</span>}
                                </div>
                                <div className="text-[10px] font-mono text-slate-400 group-hover:text-indigo-500 transition-colors">{col.type}</div>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 bg-white border-t border-slate-200">
                        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg text-slate-500 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer">
                            <ListFilter size={14} /> Query History
                        </div>
                    </div>
                </div>

                {/* Center: Editor & Output */}
                <div className="flex-1 flex flex-col overflow-hidden bg-slate-900">
                    {/* Top: Query Editor */}
                    <div className="h-1/2 flex flex-col border-b border-white/5">
                        <div className="px-4 py-2 bg-white/5 flex justify-between items-center text-[10px]">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                <span className="font-black text-slate-500 uppercase tracking-widest">Query Buffer</span>
                            </div>
                            <span className="text-slate-600 font-mono">UTF-8 • SQL MODE</span>
                        </div>
                        <textarea
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="flex-1 bg-transparent p-8 text-indigo-300 font-mono text-base leading-relaxed outline-none resize-none selection:bg-indigo-500/30"
                            spellCheck={false}
                        />
                    </div>

                    {/* Bottom: Result Output */}
                    <div className="h-1/2 flex flex-col bg-white">
                        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setChartType('bar')}
                                    className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors ${chartType === 'bar' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <TableIcon size={14} /> Grid
                                </button>
                                <button
                                    onClick={() => setChartType('line')}
                                    className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors ${chartType === 'line' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <BarChart size={14} /> Analytics
                                </button>
                            </div>
                            {output && (
                                <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-2">
                                    <Search size={12} /> Execution: 12ms • {output.length} rows returned
                                </div>
                            )}
                        </div>

                        <div className="flex-1 p-6 overflow-auto bg-slate-50/30">
                            {!output ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4 opacity-50">
                                    <Terminal size={48} strokeWidth={1} className="animate-pulse" />
                                    <p className="font-black text-xs uppercase tracking-widest">Ready for execution</p>
                                </div>
                            ) : chartType === 'bar' ? (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                            <tr>
                                                <th className="px-6 py-4">ID</th>
                                                <th className="px-6 py-4">Employee</th>
                                                <th className="px-6 py-4">Dept</th>
                                                <th className="px-6 py-4 text-right">Compensation</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-slate-700">
                                            {output.map((row: Row) => (
                                                <tr key={row.id} className="hover:bg-indigo-50/30 transition-colors group">
                                                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{row.id}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-black text-sm text-slate-800">{row.name}</div>
                                                        <div className="text-[10px] font-bold text-slate-400">{row.experience}Y Experience</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-wider">{row.department}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-mono font-bold text-indigo-600 tabular-nums">
                                                        ${row.salary.toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </motion.div>
                            ) : (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col gap-6">
                                    {/* Stats HUD */}
                                    <div className="grid grid-cols-4 gap-4">
                                        {[
                                            { label: 'Avg Salary', val: stats?.avg, color: 'text-indigo-600' },
                                            { label: 'Max Salary', val: stats?.max, color: 'text-emerald-600' },
                                            { label: 'Min Salary', val: stats?.min, color: 'text-rose-600' },
                                            { label: 'Sample Population', val: stats?.count, color: 'text-slate-800' }
                                        ].map(item => (
                                            <div key={item.label} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                                                <p className={`text-xl font-black ${item.color}`}>
                                                    {typeof item.val === 'number' && item.val > 100 ? `$${item.val.toLocaleString()}` : item.val}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Visualization Panel */}
                                    <div className="flex-1 bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm flex items-end justify-around gap-4 group">
                                        {output.map((row, i) => (
                                            <div key={row.id} className="flex-1 flex flex-col items-center gap-3">
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${(row.salary / (stats?.max || 1)) * 100}%` }}
                                                    transition={{ delay: i * 0.05, type: 'spring' }}
                                                    className="w-full max-w-[60px] bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-2xl shadow-lg relative cursor-help"
                                                >
                                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                        ${row.salary / 1000}k
                                                    </div>
                                                </motion.div>
                                                <span className="text-[9px] font-black text-slate-400 uppercase rotate-45 mt-4 origin-left whitespace-nowrap">{row.name.split(' ')[0]}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
