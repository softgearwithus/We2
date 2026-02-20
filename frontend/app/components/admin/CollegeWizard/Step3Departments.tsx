'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';

interface Step3Props {
    departments: string[];
    addDepartment: (dept: string) => void;
    removeDepartment: (dept: string) => void;
}

export default function Step3Departments({ departments, addDepartment, removeDepartment }: Step3Props) {
    const [inputValue, setInputValue] = useState('');

    const handleAdd = () => {
        if (inputValue.trim()) {
            addDepartment(inputValue.trim());
            setInputValue('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAdd();
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="pb-4 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900">Step 3 — Departments</h2>
                <p className="text-sm text-slate-500 mt-1">Add departments available in this college.</p>
            </div>

            <div className="flex flex-wrap gap-2 min-h-[50px] p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                {departments.length === 0 ? (
                    <p className="text-slate-400 text-sm italic">No departments added yet...</p>
                ) : (
                    departments.map((dept, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm animate-in zoom-in-95 duration-200"
                        >
                            <span className="text-sm font-bold text-slate-700">{dept}</span>
                            <button
                                onClick={() => removeDepartment(dept)}
                                className="hover:bg-red-50 text-slate-400 hover:text-red-500 p-1 rounded-lg transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            <div className="flex gap-2">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Department name (e.g. Computer Science)"
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium"
                />
                <button
                    onClick={handleAdd}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                >
                    <Plus size={18} />
                    Add
                </button>
            </div>
        </div>
    );
}
