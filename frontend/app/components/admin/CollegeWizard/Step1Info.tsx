'use client';

interface CollegeInfo {
    name: string;
    collegeId: string;
    location: string;
    type: string;
    adminEmail: string;
}

interface Step1Props {
    data: CollegeInfo;
    updateData: (updates: Partial<CollegeInfo>) => void;
}

export default function Step1Info({ data, updateData }: Step1Props) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="pb-4 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900">Step 1 — College Information</h2>
                <p className="text-sm text-slate-500 mt-1">Provide basic identification and contact details for the new institution.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">College Name</label>
                    <input
                        type="text"
                        value={data.name}
                        onChange={(e) => updateData({ name: e.target.value })}
                        placeholder="e.g. MIT Pune"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:bg-white bg-slate-50/50 outline-none transition-all font-medium"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">College ID (Super Admin Assigned)</label>
                    <input
                        type="text"
                        value={data.collegeId}
                        onChange={(e) => updateData({ collegeId: e.target.value })}
                        placeholder="e.g. CLGMIT001"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:bg-white bg-slate-50/50 outline-none transition-all font-medium"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Location / City</label>
                    <input
                        type="text"
                        value={data.location}
                        onChange={(e) => updateData({ location: e.target.value })}
                        placeholder="e.g. Pune, Maharashtra"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:bg-white bg-slate-50/50 outline-none transition-all font-medium"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">College Type</label>
                    <select
                        value={data.type}
                        onChange={(e) => updateData({ type: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:bg-white bg-slate-50/50 outline-none transition-all font-medium appearance-none"
                    >
                        <option value="">Select Type</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Management">Management</option>
                        <option value="Arts & Science">Arts & Science</option>
                        <option value="Medical">Medical</option>
                    </select>
                </div>

                <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">College Admin Email</label>
                    <input
                        type="email"
                        value={data.adminEmail}
                        onChange={(e) => updateData({ adminEmail: e.target.value })}
                        placeholder="e.g. admin@mitpune.edu.in"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:bg-white bg-slate-50/50 outline-none transition-all font-medium"
                    />
                </div>
            </div>
        </div>
    );
}
