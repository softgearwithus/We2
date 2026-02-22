'use client';

import React, { useState, useEffect } from 'react';
import { Save, Bell, Code2, Database, Rocket, Radar, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface UpdateState {
    [href: string]: boolean;
}

export default function AdminUpdatesPage() {
    const [updates, setUpdates] = useState<UpdateState>({
        '/dashboard/dsa': false,
        '/dashboard/sql': false,
        '/dashboard/projects': false,
        '/dashboard/market-radar': false,
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        // Load existing state from localStorage (simulating DB fetch)
        const stored = localStorage.getItem('emble_admin_updates');
        if (stored) {
            try {
                setUpdates(prev => ({ ...prev, ...JSON.parse(stored) }));
            } catch (e) {
                console.error("Failed to parse stored updates", e);
            }
        }
        setIsLoading(false);
    }, []);

    const handleToggle = (href: string) => {
        setUpdates(prev => ({ ...prev, [href]: !prev[href] }));
    };

    const handleSave = () => {
        setIsSaving(true);
        setSaveMessage(null);

        // Simulate API delay
        setTimeout(() => {
            try {
                localStorage.setItem('emble_admin_updates', JSON.stringify(updates));
                // Dispatch event so other tabs/windows update immediately
                window.dispatchEvent(new Event('admin_updates_changed'));

                setSaveMessage({ type: 'success', text: 'Dashboard updates indicators synced successfully.' });
            } catch (error) {
                setSaveMessage({ type: 'error', text: 'Failed to save update configuration.' });
            } finally {
                setIsSaving(false);
                setTimeout(() => setSaveMessage(null), 4000);
            }
        }, 600);
    };

    const modules = [
        { id: '/dashboard', label: 'Overview', icon: <div className="text-slate-500 material-symbols-outlined">dashboard</div>, desc: 'Show indicator for general platform announcements.' },
        { id: '/dashboard/preparation', label: 'Placement Preparation', icon: <div className="text-indigo-500 material-symbols-outlined">school</div>, desc: 'Show indicator for new preparation roadmaps.' },
        { id: '/dashboard/test-series', label: 'Test Series', icon: <div className="text-red-500 material-symbols-outlined">quiz</div>, desc: 'Show indicator for new or upcoming mock tests.' },
        { id: '/dashboard/dsa', label: 'DSA Training', icon: <Code2 size={20} className="text-blue-500" />, desc: 'Show indicator for new DSA problems or modules.' },
        { id: '/dashboard/sql', label: 'SQL Training', icon: <Database size={20} className="text-emerald-500" />, desc: 'Show indicator for new SQL challenges.' },
        { id: '/dashboard/projects', label: 'Project Labs', icon: <Rocket size={20} className="text-purple-500" />, desc: 'Show indicator for newly added full-stack project builds.' },
        { id: '/dashboard/interview', label: 'Mock Interview', icon: <div className="text-amber-500 material-symbols-outlined">mic</div>, desc: 'Show indicator for new interview experiences or slots.' },
        { id: '/dashboard/resume', label: 'Resume', icon: <div className="text-sky-500 material-symbols-outlined">description</div>, desc: 'Show indicator for new resume templates or feedback.' },
        { id: '/dashboard/github', label: 'Git Mastery', icon: <div className="text-orange-500 material-symbols-outlined">memory</div>, desc: 'Show indicator for new Git lessons or pipelines.' },
        { id: '/dashboard/market-radar', label: 'Market Radar', icon: <Radar size={20} className="text-rose-500" />, desc: 'Show indicator for updated hiring data and trends.' },
        { id: '/dashboard/intelligence', label: 'Synapse', icon: <div className="text-fuchsia-500 material-symbols-outlined">psychology</div>, desc: 'Show indicator for AI insights or new Synapse features.' },
        { id: '/dashboard/mentors', label: 'Mentors', icon: <div className="text-teal-500 material-symbols-outlined">group</div>, desc: 'Show indicator for new mentors joining the platform.' },
    ];

    if (isLoading) {
        return (
            <div className="p-8 max-w-4xl mx-auto min-h-[calc(100vh-64px)] flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-500" size={40} />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto min-h-[calc(100vh-64px)] font-sans">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <Bell className="text-blue-600" size={32} /> Dashboard Updates
                </h1>
                <p className="text-slate-500 mt-2 font-medium">Control the red notification dots shown to students on their dashboard navigation.</p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                <div className="space-y-4">
                    {modules.map((mod) => (
                        <div key={mod.id} className="flex items-center justify-between p-5 border border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                                    {mod.icon}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">{mod.label}</h3>
                                    <p className="text-sm text-slate-500 mt-1 max-w-lg">{mod.desc}</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={!!updates[mod.id]}
                                    onChange={() => handleToggle(mod.id)}
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    ))}
                </div>

                {/* Save Bar */}
                <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="w-full md:w-auto h-10 flex items-center">
                        {saveMessage && (
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold animate-in fade-in duration-300 ${saveMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                {saveMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                {saveMessage.text}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center justify-center gap-2 px-8 py-3 w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-sm shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            <Save size={18} />
                        )}
                        {isSaving ? 'Syncing...' : 'Sync Indicators to Dashboard'}
                    </button>
                </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <p className="text-sm text-blue-800 font-medium">
                    <strong>Note:</strong> Toggling an switch to ON will immediately display a red notification dot next to the corresponding module in every student's sidebar. Toggling it OFF will remove it.
                </p>
            </div>
        </div>
    );
}
