'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Shield, Key, ArrowLeft, Save } from 'lucide-react';

export default function SettingsPage() {
    const [isSaving, setIsSaving] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("New passwords do not match!");
            return;
        }

        setIsSaving(true);

        // Simulating API save
        setTimeout(() => {
            setIsSaving(false);
            alert('Security settings updated successfully!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        }, 800);
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-[800px] mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/profile" className="text-slate-400 hover:text-slate-900 transition-colors p-2 -ml-2 rounded-lg hover:bg-slate-50">
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="text-xl font-bold">Account Settings</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-[800px] mx-auto p-6 md:p-8 space-y-8">
                <form onSubmit={handleSave} className="space-y-8">
                    {/* Security Info */}
                    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                        <h2 className="text-lg font-bold mb-6 pb-2 border-b border-slate-100 flex items-center gap-2">
                            <Shield className="text-indigo-500" size={20} /> Security Settings
                        </h2>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Key size={14} /> Current Password</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                    required
                                />
                            </div>

                            <div className="border-t border-slate-100 pt-5 mt-5">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Shield size={14} /> New Password</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium mb-4"
                                    required
                                />

                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Shield size={14} /> Confirm New Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                    required
                                />
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                            <button
                                type="submit"
                                disabled={isSaving || !passwordData.currentPassword || !passwordData.newPassword}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                            >
                                <Save size={16} />
                                {isSaving ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                    </section>
                </form>
            </main>
        </div>
    );
}
