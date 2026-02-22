'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Key, Mail, Bell, Trash2, Smartphone, MonitorSmartphone, Monitor, ChevronRight, LogOut, AlertTriangle, Save } from 'lucide-react';
import Link from 'next/link';

type Tab = 'account' | 'security' | 'notifications';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<Tab>('account');
    const [isSaving, setIsSaving] = useState(false);

    // Password State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Notification State
    const [notifications, setNotifications] = useState({
        testSeries: true,
        mentorAlerts: true,
        marketRadar: false
    });

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleNotificationToggle = (key: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSavePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("New passwords do not match!");
            return;
        }
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            alert('Security settings updated successfully!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        }, 800);
    };

    const tabs = [
        { id: 'account', label: 'Account', icon: <Mail size={18} /> },
        { id: 'security', label: 'Security', icon: <Shield size={18} /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    ];

    return (
        <div className="min-h-screen bg-[#fafafa] font-sans text-slate-900 pb-20">
            <div className="max-w-[1000px] mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8">

                {/* Left Sidebar Nav */}
                <div className="w-full md:w-64 shrink-0">
                    <h1 className="text-2xl font-black text-slate-900 mb-6">Settings</h1>
                    <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as Tab)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                                        ? 'bg-indigo-50 text-indigo-700'
                                        : 'text-slate-500 hover:bg-slate-100'
                                    }`}
                            >
                                <span className={activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400'}>{tab.icon}</span>
                                {tab.label}
                                {activeTab === tab.id && <ChevronRight size={16} className="ml-auto opacity-50 hidden md:block" />}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0">
                    <AnimatePresence mode="wait">

                        {/* ACCOUNT TAB */}
                        {activeTab === 'account' && (
                            <motion.div
                                key="account"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-6"
                            >
                                <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="p-6 border-b border-slate-100">
                                        <h2 className="text-lg font-bold text-slate-900">Email Address</h2>
                                        <p className="text-sm text-slate-500 mt-1">Manage the email address connected to your account.</p>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-bold text-slate-900">alex@example.com</p>
                                                <p className="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-1">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Verified
                                                </p>
                                            </div>
                                            <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-lg transition-colors">
                                                Change
                                            </button>
                                        </div>
                                    </div>
                                </section>

                                <section className="bg-white rounded-2xl shadow-sm border border-red-200 overflow-hidden">
                                    <div className="p-6 border-b border-red-100 bg-red-50/30">
                                        <h2 className="text-lg font-bold text-red-600 flex items-center gap-2">
                                            <AlertTriangle size={20} /> Danger Zone
                                        </h2>
                                        <p className="text-sm text-red-500/80 mt-1">Permanently delete your account and all data.</p>
                                    </div>
                                    <div className="p-6 flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-slate-900">Delete Account</p>
                                            <p className="text-xs text-slate-500 mt-1 max-w-sm">Once you delete your account, there is no going back. Please be certain.</p>
                                        </div>
                                        <button className="text-sm font-bold text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                                            <Trash2 size={16} /> Delete
                                        </button>
                                    </div>
                                </section>
                            </motion.div>
                        )}

                        {/* SECURITY TAB */}
                        {activeTab === 'security' && (
                            <motion.div
                                key="security"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-6"
                            >
                                <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="p-6 border-b border-slate-100">
                                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                            <Key className="text-indigo-500" size={20} /> Change Password
                                        </h2>
                                        <p className="text-sm text-slate-500 mt-1">Ensure your account is using a long, random password to stay secure.</p>
                                    </div>
                                    <form onSubmit={handleSavePassword} className="p-6 space-y-5">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Current Password</label>
                                            <input
                                                type="password"
                                                name="currentPassword"
                                                value={passwordData.currentPassword}
                                                onChange={handlePasswordChange}
                                                className="w-full max-w-md bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">New Password</label>
                                            <input
                                                type="password"
                                                name="newPassword"
                                                value={passwordData.newPassword}
                                                onChange={handlePasswordChange}
                                                className="w-full max-w-md bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Confirm New Password</label>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={passwordData.confirmPassword}
                                                onChange={handlePasswordChange}
                                                className="w-full max-w-md bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                                required
                                            />
                                        </div>
                                        <div className="pt-2">
                                            <button
                                                type="submit"
                                                disabled={isSaving || !passwordData.currentPassword || !passwordData.newPassword}
                                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                                            >
                                                <Save size={16} />
                                                {isSaving ? 'Updating...' : 'Update Password'}
                                            </button>
                                        </div>
                                    </form>
                                </section>

                                <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="p-6 border-b border-slate-100">
                                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                            <MonitorSmartphone className="text-indigo-500" size={20} /> Browser Sessions
                                        </h2>
                                        <p className="text-sm text-slate-500 mt-1">Manage and log out your active sessions on other browsers and devices.</p>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div className="flex items-start gap-4 p-4 rounded-xl border border-indigo-100 bg-indigo-50/30">
                                            <Monitor className="text-indigo-600 mt-1" size={24} />
                                            <div className="flex-1">
                                                <p className="font-bold text-slate-900 text-sm">Windows • Chrome</p>
                                                <p className="text-xs text-slate-500">192.168.1.1 - This device</p>
                                            </div>
                                            <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded">Active</span>
                                        </div>
                                        <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-100">
                                            <Smartphone className="text-slate-400 mt-1" size={24} />
                                            <div className="flex-1">
                                                <p className="font-bold text-slate-900 text-sm">iOS • Safari</p>
                                                <p className="text-xs text-slate-500">Last active 2 hours ago</p>
                                            </div>
                                            <button className="text-slate-400 hover:text-red-500 transition-colors p-2">
                                                <LogOut size={16} />
                                            </button>
                                        </div>

                                        <div className="pt-2">
                                            <button className="text-sm font-bold text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 px-5 py-2.5 rounded-lg transition-all flex items-center gap-2">
                                                <LogOut size={16} /> Log Out Other Sessions
                                            </button>
                                        </div>
                                    </div>
                                </section>
                            </motion.div>
                        )}

                        {/* NOTIFICATIONS TAB */}
                        {activeTab === 'notifications' && (
                            <motion.div
                                key="notifications"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-6"
                            >
                                <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="p-6 border-b border-slate-100">
                                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                            <Bell className="text-indigo-500" size={20} /> Notification Preferences
                                        </h2>
                                        <p className="text-sm text-slate-500 mt-1">Choose what updates you want to receive.</p>
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                        <div className="p-6 flex items-center justify-between">
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm">Test Series Reminders</p>
                                                <p className="text-xs text-slate-500 mt-1">Get notified when a new company specific test is available.</p>
                                            </div>
                                            <button
                                                onClick={() => handleNotificationToggle('testSeries')}
                                                className={`w-11 h-6 rounded-full transition-colors relative ${notifications.testSeries ? 'bg-indigo-500' : 'bg-slate-200'}`}
                                            >
                                                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${notifications.testSeries ? 'translate-x-5' : 'translate-x-0'}`} />
                                            </button>
                                        </div>

                                        <div className="p-6 flex items-center justify-between">
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm">Mentor Alerts</p>
                                                <p className="text-xs text-slate-500 mt-1">Receive emails when mentors respond to your requests.</p>
                                            </div>
                                            <button
                                                onClick={() => handleNotificationToggle('mentorAlerts')}
                                                className={`w-11 h-6 rounded-full transition-colors relative ${notifications.mentorAlerts ? 'bg-indigo-500' : 'bg-slate-200'}`}
                                            >
                                                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${notifications.mentorAlerts ? 'translate-x-5' : 'translate-x-0'}`} />
                                            </button>
                                        </div>

                                        <div className="p-6 flex items-center justify-between">
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm">Market Radar Updates</p>
                                                <p className="text-xs text-slate-500 mt-1">Weekly digest of hiring trends and top required skills.</p>
                                            </div>
                                            <button
                                                onClick={() => handleNotificationToggle('marketRadar')}
                                                className={`w-11 h-6 rounded-full transition-colors relative ${notifications.marketRadar ? 'bg-indigo-500' : 'bg-slate-200'}`}
                                            >
                                                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${notifications.marketRadar ? 'translate-x-5' : 'translate-x-0'}`} />
                                            </button>
                                        </div>
                                    </div>
                                </section>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>

            </div>
        </div>
    );
}
