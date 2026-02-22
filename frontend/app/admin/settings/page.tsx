'use client';

import React, { useState, useEffect } from 'react';
import { Save, User, Shield, Bell, Key, Globe, LayoutTemplate, AlertCircle, CheckCircle2, Loader2, Database } from 'lucide-react';

// --- Types ---
interface ProfileSettings {
    fullName: string;
    email: string;
    role: string;
    timezone: string;
    avatarUrl: string;
}

interface SecuritySettings {
    twoFactorEnabled: boolean;
    lastPasswordChange: string;
}

interface PlatformSettings {
    maintenanceMode: boolean;
    allowRegistrations: boolean;
    betaFeatures: boolean;
    supportEmail: string;
    maxUploadSizeMB: number;
}

interface NotificationPreference {
    id: string;
    title: string;
    desc: string;
    active: boolean;
}

export default function AdminSettingsPage() {
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'platform' | 'notifications'>('profile');

    // --- Global State ---
    const [isLoadingInitial, setIsLoadingInitial] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // --- Tab States ---
    const [profile, setProfile] = useState<ProfileSettings>({
        fullName: '',
        email: '',
        role: '',
        timezone: 'Asia/Kolkata',
        avatarUrl: ''
    });

    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [security, setSecurity] = useState<SecuritySettings>({ twoFactorEnabled: false, lastPasswordChange: '' });

    const [platform, setPlatform] = useState<PlatformSettings>({
        maintenanceMode: false,
        allowRegistrations: true,
        betaFeatures: false,
        supportEmail: '',
        maxUploadSizeMB: 10
    });

    const [notifications, setNotifications] = useState<NotificationPreference[]>([]);

    // --- Mock API Fetch ---
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                // Simulating an API call to fetch admin settings
                await new Promise(resolve => setTimeout(resolve, 800));

                setProfile({
                    fullName: 'Super Admin',
                    email: 'admin@emble.co.in',
                    role: 'Super Administrator',
                    timezone: 'Asia/Kolkata',
                    avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Admin'
                });

                setSecurity({
                    twoFactorEnabled: false,
                    lastPasswordChange: '2 months ago'
                });

                setPlatform({
                    maintenanceMode: false,
                    allowRegistrations: true,
                    betaFeatures: true,
                    supportEmail: 'support@emble.co.in',
                    maxUploadSizeMB: 50
                });

                setNotifications([
                    { id: 'n1', title: 'New Mentor Applications', desc: 'Get alerted when a mentor applies to join the platform.', active: true },
                    { id: 'n2', title: 'Large Platform Payments', desc: 'Receive emails for transactions above ₹10,000.', active: true },
                    { id: 'n3', title: 'System Errors & Outages', desc: 'Critical alerts related to server downtime or API failures.', active: true },
                    { id: 'n4', title: 'Daily Student Analytics', desc: 'A daily automated email summarizing new signups and activity.', active: false }
                ]);

            } catch (error) {
                console.error("Failed to fetch settings", error);
            } finally {
                setIsLoadingInitial(false);
            }
        };

        fetchSettings();
    }, []);

    // --- Save Handlers ---
    const handleSaveProfile = async () => {
        // Backend Logic: POST/PUT /api/admin/settings/profile
        console.log('Saving Profile Data:', profile);
        return new Promise(resolve => setTimeout(resolve, 1000));
    };

    const handleSaveSecurity = async () => {
        if (passwords.new && passwords.new !== passwords.confirm) {
            throw new Error("New passwords do not match.");
        }
        // Backend Logic: POST /api/admin/settings/security/password
        console.log('Updating Password/Security. 2FA:', security.twoFactorEnabled);
        return new Promise(resolve => setTimeout(resolve, 1000));
    };

    const handleSavePlatform = async () => {
        // Backend Logic: POST/PUT /api/admin/settings/platform
        console.log('Saving Platform Config:', platform);
        return new Promise(resolve => setTimeout(resolve, 1000));
    };

    const handleSaveNotifications = async () => {
        // Backend Logic: POST/PUT /api/admin/settings/notifications
        console.log('Saving Notification Prefs:', notifications);
        return new Promise(resolve => setTimeout(resolve, 1000));
    };

    // --- Main Save Action ---
    const handleSave = async () => {
        setIsSaving(true);
        setSaveMessage(null);

        try {
            // Route the save action based on the active tab context
            if (activeTab === 'profile') await handleSaveProfile();
            if (activeTab === 'security') await handleSaveSecurity();
            if (activeTab === 'platform') await handleSavePlatform();
            if (activeTab === 'notifications') await handleSaveNotifications();

            setSaveMessage({ type: 'success', text: `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} settings updated successfully.` });

            // Clear password fields on success
            if (activeTab === 'security') setPasswords({ current: '', new: '', confirm: '' });

        } catch (error: any) {
            setSaveMessage({ type: 'error', text: error.message || 'Failed to apply settings.' });
        } finally {
            setIsSaving(false);
            // Hide message after 4s
            setTimeout(() => setSaveMessage(null), 4000);
        }
    };


    if (isLoadingInitial) {
        return (
            <div className="p-8 max-w-6xl mx-auto min-h-[calc(100vh-64px)] flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-500" size={40} />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto min-h-[calc(100vh-64px)] font-sans">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Platform Settings</h1>
                <p className="text-slate-500 mt-2 font-medium">Manage your admin preferences, security, and global platform configurations.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Settings Sidebar */}
                <aside className="w-full lg:w-64 shrink-0">
                    <nav className="flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 custom-scrollbar">
                        <button
                            onClick={() => { setActiveTab('profile'); setSaveMessage(null); }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            <User size={18} /> Profile & Account
                        </button>
                        <button
                            onClick={() => { setActiveTab('security'); setSaveMessage(null); }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'security' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            <Shield size={18} /> Security & Access
                        </button>
                        <button
                            onClick={() => { setActiveTab('platform'); setSaveMessage(null); }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'platform' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            <Globe size={18} /> Platform Config
                        </button>
                        <button
                            onClick={() => { setActiveTab('notifications'); setSaveMessage(null); }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'notifications' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            <Bell size={18} /> Notifications
                        </button>
                    </nav>
                </aside>

                {/* Settings Content Area */}
                <div className="flex-1 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col">
                    <div className="flex-1">
                        {/* --- PROFILE TAB --- */}
                        {activeTab === 'profile' && (
                            <div className="space-y-8 animate-in fade-in duration-300">
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 mb-1">Admin Profile</h2>
                                    <p className="text-sm text-slate-500 font-medium pb-6 border-b border-slate-100">Update your personal information and contact details.</p>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-lg overflow-hidden shrink-0">
                                        <img src={profile.avatarUrl} alt="Admin Avatar" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <button className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-blue-600 transition-colors">
                                            Change Avatar
                                        </button>
                                        <p className="text-xs text-slate-500 mt-2 font-medium">Recommended: Square image, max 2MB.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Full Name</label>
                                        <input
                                            type="text"
                                            value={profile.fullName}
                                            onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                                            className="w-full p-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Email Address</label>
                                        <input
                                            type="email"
                                            value={profile.email}
                                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                            className="w-full p-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Role</label>
                                        <input
                                            type="text"
                                            value={profile.role}
                                            disabled
                                            className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed outline-none text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Timezone</label>
                                        <select
                                            value={profile.timezone}
                                            onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                                            className="w-full p-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm transition-all bg-white"
                                        >
                                            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                                            <option value="America/New_York">America/New_York (EST)</option>
                                            <option value="Europe/London">Europe/London (GMT)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- SECURITY TAB --- */}
                        {activeTab === 'security' && (
                            <div className="space-y-8 animate-in fade-in duration-300">
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 mb-1">Security Settings</h2>
                                    <p className="text-sm text-slate-500 font-medium pb-6 border-b border-slate-100">Manage your passwords and two-factor authentication.</p>
                                </div>

                                <div className="space-y-6 max-w-md">
                                    <div className="text-xs text-slate-500 font-medium bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        Last password change: <span className="font-bold text-slate-800">{security.lastPasswordChange}</span>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><Key size={14} /> Current Password</label>
                                        <input
                                            type="password"
                                            value={passwords.current}
                                            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                            placeholder="••••••••"
                                            className="w-full p-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">New Password</label>
                                        <input
                                            type="password"
                                            value={passwords.new}
                                            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                            placeholder="Enter new password"
                                            className="w-full p-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Confirm New Password</label>
                                        <input
                                            type="password"
                                            value={passwords.confirm}
                                            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                            placeholder="Confirm new password"
                                            className={`w-full p-3 rounded-xl border transition-all outline-none text-sm ${passwords.confirm && passwords.new !== passwords.confirm
                                                    ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                                                    : 'border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                                                }`}
                                        />
                                        {passwords.confirm && passwords.new !== passwords.confirm && (
                                            <p className="text-xs text-red-500 font-bold mt-1 tracking-wide">Passwords do not match</p>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                                Two-Factor Authentication (2FA)
                                                {security.twoFactorEnabled && <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-widest">Active</span>}
                                            </h3>
                                            <p className="text-sm text-slate-500 mt-1">Add an extra layer of security to your admin account.</p>
                                        </div>
                                        <button
                                            onClick={() => setSecurity({ ...security, twoFactorEnabled: !security.twoFactorEnabled })}
                                            className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-colors ${security.twoFactorEnabled
                                                    ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                }`}
                                        >
                                            {security.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- PLATFORM CONFIG TAB --- */}
                        {activeTab === 'platform' && (
                            <div className="space-y-8 animate-in fade-in duration-300">
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 mb-1">Platform Configuration</h2>
                                    <p className="text-sm text-slate-500 font-medium pb-6 border-b border-slate-100">Global API routing and toggles for the entire ecosystem.</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2 mb-8">
                                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><Database size={16} /> Contact Support Email</label>
                                        <input
                                            type="email"
                                            value={platform.supportEmail}
                                            onChange={(e) => setPlatform({ ...platform, supportEmail: e.target.value })}
                                            className="w-full max-w-md p-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm transition-all"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-5 border border-slate-200 rounded-2xl bg-slate-50/50">
                                        <div>
                                            <h3 className="font-bold text-slate-900 flex items-center gap-2">Maintenance Mode <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-widest">Danger</span></h3>
                                            <p className="text-sm text-slate-500 mt-1 max-w-lg">Temporarily disable student access to the portal. Returns HTTP 503.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={platform.maintenanceMode} onChange={() => setPlatform({ ...platform, maintenanceMode: !platform.maintenanceMode })} />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-5 border border-slate-200 rounded-2xl bg-slate-50/50">
                                        <div>
                                            <h3 className="font-bold text-slate-900">Allow New Registrations</h3>
                                            <p className="text-sm text-slate-500 mt-1 max-w-lg">Turn off if you want to stop accepting new student and mentor signups directly.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={platform.allowRegistrations} onChange={() => setPlatform({ ...platform, allowRegistrations: !platform.allowRegistrations })} />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-5 border border-slate-200 rounded-2xl bg-slate-50/50">
                                        <div>
                                            <h3 className="font-bold text-slate-900 flex items-center gap-2"><LayoutTemplate size={16} /> Beta Features</h3>
                                            <p className="text-sm text-slate-500 mt-1 max-w-lg">Enable experimental features for student testing (e.g. AI voice simulation tests).</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={platform.betaFeatures} onChange={() => setPlatform({ ...platform, betaFeatures: !platform.betaFeatures })} />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- NOTIFICATIONS TAB --- */}
                        {activeTab === 'notifications' && (
                            <div className="space-y-8 animate-in fade-in duration-300">
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 mb-1">Notification Preferences</h2>
                                    <p className="text-sm text-slate-500 font-medium pb-6 border-b border-slate-100">Control what automated email alerts you receive as an administrator.</p>
                                </div>

                                <div className="space-y-3">
                                    {notifications.map((notif) => (
                                        <div key={notif.id} className="flex items-center justify-between p-4 bg-white hover:bg-slate-50 border border-slate-100 rounded-xl transition-colors shadow-sm">
                                            <div>
                                                <h3 className="font-bold text-slate-800 text-sm">{notif.title}</h3>
                                                <p className="text-xs text-slate-500 mt-0.5">{notif.desc}</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={notif.active}
                                                    onChange={() => {
                                                        const updated = notifications.map(n => n.id === notif.id ? { ...n, active: !n.active } : n);
                                                        setNotifications(updated);
                                                    }}
                                                />
                                                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* --- GLOBAL SAVE BAR --- */}
                    <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="w-full md:w-auto">
                            {saveMessage && (
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold animate-in fade-in duration-300 ${saveMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                    {saveMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                    {saveMessage.text}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={isSaving || (activeTab === 'security' && Boolean(passwords.new && passwords.new !== passwords.confirm))}
                            className="flex items-center justify-center gap-2 px-8 py-3 w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-sm shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <Save size={18} />
                            )}
                            {isSaving ? 'Applying Config...' : `Save ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Settings`}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
