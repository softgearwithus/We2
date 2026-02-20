'use client';

interface Step2Props {
    selectedYears: string[];
    toggleYear: (year: string) => void;
}

const AVAILABLE_YEARS = [
    { id: 'Y1', label: 'First Year (Y1)' },
    { id: 'Y2', label: 'Second Year (Y2)' },
    { id: 'Y3', label: 'Third Year (Y3)' },
    { id: 'Y4', label: 'Fourth Year (Y4)' },
];

export default function Step2Years({ selectedYears, toggleYear }: Step2Props) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="pb-4 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900">Step 2 — Academic Years</h2>
                <p className="text-sm text-slate-500 mt-1">Select which academic years are part of this college's program.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {AVAILABLE_YEARS.map((year) => {
                    const isSelected = selectedYears.includes(year.id);
                    return (
                        <button
                            key={year.id}
                            onClick={() => toggleYear(year.id)}
                            className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-300 text-left ${isSelected
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20 transform scale-[1.02]'
                                    : 'bg-white border-slate-100 text-slate-600 hover:border-blue-200 hover:bg-blue-50/30'
                                }`}
                        >
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-colors ${isSelected ? 'bg-white border-white text-blue-600' : 'bg-slate-50 border-slate-200 text-transparent'
                                }`}>
                                <span className="material-symbols-outlined text-sm font-bold">check</span>
                            </div>
                            <span className="font-bold tracking-wide">{year.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
