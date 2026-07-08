'use client';

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    User, Users, CreditCard, Building2, Key, FileText,
    Mail, Shield, LogOut, Trash2, Edit2, RefreshCw, CheckCircle2
} from 'lucide-react';
import CompanySettingsPage from '../settings/CompanySettingsPage';

const tabs = [
    { id: 'individual', label: 'Individual', icon: User },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'profile', label: 'Profile', icon: Building2 },
    { id: 'api-keys', label: 'API Keys', icon: Key },
    { id: 'audit-log', label: 'Audit Log', icon: FileText },
];

export default function SettingsPage() {
    return <CompanySettingsPage />;

    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('individual');

    const ActiveIcon = tabs.find(t => t.id === activeTab)?.icon || FileText;

    return (
        <div className="mx-auto w-full max-w-6xl text-neutral-950">
            <h1 className="text-2xl font-bold font-mono">Settings</h1>

            {/* Tabs Bar */}
            <div className="flex items-center gap-2 mt-6 border-b border-neutral-200 pb-4 overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                            activeTab === tab.id
                                ? 'bg-white text-black shadow-sm border border-neutral-200'
                                : 'text-neutral-500 hover:text-black hover:bg-neutral-100'
                        }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            {activeTab === 'individual' && <IndividualSettings user={user} />}
            {activeTab === 'team' && <TeamSettings />}
            {activeTab === 'profile' && <ProfileSettings />}

            {/* Placeholders for other tabs */}
            {(activeTab === 'billing' || activeTab === 'api-keys' || activeTab === 'audit-log') && (
                <div className="mt-8 p-12 text-center rounded-xl border border-neutral-200 border-dashed text-neutral-500">
                    <ActiveIcon size={32} className="mx-auto mb-3 opacity-50" />
                    <p>This section is under development.</p>
                </div>
            )}
        </div>
    );
}

function IndividualSettings({ user }: { user: any }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="rounded-xl border border-neutral-200 bg-white">
                <div className="p-5 border-b border-neutral-100">
                    <h2 className="font-mono text-lg font-bold">Profile</h2>
                </div>
                <div className="p-5 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-[#5967c5] text-white flex items-center justify-center text-xl font-bold">
                            {user?.firstName?.[0] || 'Y'}
                        </div>
                        <div>
                            <div className="font-bold text-sm uppercase">{(user?.firstName || 'Y') + ' ' + (user?.lastName || 'COMBINATOR')}</div>
                            <div className="text-xs text-neutral-500">{user?.email || 'yctestemble@gmail.com'}</div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-neutral-900 block mb-1">First Name</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-neutral-200 rounded-md text-sm outline-none focus:border-black"
                                defaultValue={user?.firstName || 'Y'}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-neutral-900 block mb-1">Last Name</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-neutral-200 rounded-md text-sm outline-none focus:border-black"
                                defaultValue={user?.lastName || 'COMBINATOR'}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-neutral-900 block mb-1">Contact Email</label>
                            <input
                                type="email"
                                className="w-full px-3 py-2 border border-neutral-200 rounded-md text-sm outline-none focus:border-black"
                                defaultValue={user?.email || 'yctestemble@gmail.com'}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white h-fit">
                <div className="p-5 border-b border-neutral-100">
                    <h2 className="font-mono text-lg font-bold">Security</h2>
                </div>
                <div className="p-5 space-y-3">
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 border border-neutral-200 rounded-md text-sm font-medium hover:bg-neutral-50 text-left transition-colors">
                        <Mail size={16} className="text-neutral-500" />
                        Change Password
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 border border-neutral-200 rounded-md text-sm font-medium hover:bg-neutral-50 text-left transition-colors">
                        <Shield size={16} className="text-neutral-500" />
                        Two-Factor Authentication
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 border border-neutral-200 rounded-md text-sm font-medium hover:bg-neutral-50 text-left transition-colors">
                        <LogOut size={16} className="text-neutral-500" />
                        Log out
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 border border-red-200 rounded-md text-sm font-medium hover:bg-red-50 text-red-600 text-left transition-colors">
                        <Trash2 size={16} />
                        Delete Account
                    </button>
                </div>
            </div>

            <div className="col-span-1 md:col-span-2 flex justify-end mt-2">
                <button className="bg-[#042614] text-white px-5 py-2.5 rounded-md text-sm font-bold hover:bg-[#031d0f] transition-colors shadow-sm">
                    Save Settings
                </button>
            </div>
        </div>
    );
}

function TeamSettings() {
    return (
        <div className="mt-6">
            <h2 className="font-mono text-lg font-bold mb-4">Team Management</h2>
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">

                {/* Organization Main Card */}
                <div className="rounded-xl border border-neutral-200 bg-white flex flex-col md:flex-row overflow-hidden min-h-[400px]">
                    {/* Inner Sidebar */}
                    <div className="w-full md:w-48 bg-neutral-50 border-b md:border-b-0 md:border-r border-neutral-200 p-4 flex flex-col gap-1 shrink-0">
                        <div className="mb-4">
                            <h3 className="font-bold text-neutral-900 text-lg">Organization</h3>
                            <p className="text-xs text-neutral-500 mt-1">Manage your organization.</p>
                        </div>
                        <button className="w-full text-left px-3 py-2 rounded-md bg-neutral-200/50 font-semibold text-sm flex items-center gap-2 text-neutral-900">
                            <Building2 size={16} />
                            General
                        </button>
                        <button className="w-full text-left px-3 py-2 rounded-md text-neutral-600 hover:bg-neutral-100 font-medium text-sm flex items-center gap-2 transition-colors">
                            <Users size={16} />
                            Members
                        </button>
                    </div>
                    {/* Inner Content */}
                    <div className="flex-1 p-6">
                        <h3 className="font-bold text-neutral-900 mb-6">General</h3>

                        <div className="space-y-2">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-neutral-100 gap-4">
                                <div className="text-sm font-medium">Organization Profile</div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded bg-indigo-500 text-white flex items-center justify-center font-bold">A</div>
                                        <span className="text-sm text-neutral-600">Softgear Technologies Private...</span>
                                    </div>
                                    <button className="text-sm font-semibold text-neutral-900 hover:underline">Update profile</button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between py-4 border-b border-neutral-100">
                                <div className="text-sm font-medium">Leave organization</div>
                                <button className="text-sm font-semibold text-red-500 hover:underline">Leave organization</button>
                            </div>

                            <div className="flex items-center justify-between py-4 border-b border-neutral-100">
                                <div className="text-sm font-medium">Delete organization</div>
                                <button className="text-sm font-semibold text-red-500 hover:underline">Delete organization</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side Cards */}
                <div className="space-y-6">
                    {/* Organization Information */}
                    <div className="rounded-xl border border-neutral-200 bg-white">
                        <div className="p-4 border-b border-neutral-100">
                            <h3 className="font-mono text-base font-bold">Organization Information</h3>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="flex items-center gap-1">
                                        <div className="text-xs text-neutral-500">Organization Name</div>
                                        <CheckCircle2 size={12} className="text-emerald-500" />
                                        <span className="text-[10px] text-emerald-600 font-medium">Verified</span>
                                    </div>
                                    <div className="text-sm font-semibold mt-1">Softgear Technologies Private Limited</div>
                                </div>
                                <div>
                                    <div className="text-xs text-neutral-500">Your Role</div>
                                    <div className="text-sm font-semibold mt-1">Admin</div>
                                </div>
                            </div>

                            <div className="pt-2">
                                <div className="text-xs text-neutral-500 mb-1.5">Organization Slug</div>
                                <div className="bg-neutral-50 border border-neutral-100 rounded px-3 py-2 text-xs font-mono text-neutral-600 break-all">
                                    softgear-technologies-private-limited-1782323241114798848
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Company Details */}
                    <div className="rounded-xl border border-neutral-200 bg-white">
                        <div className="p-4 border-b border-neutral-100">
                            <h3 className="font-mono text-base font-bold">Company Details</h3>
                        </div>
                        <div className="p-4 space-y-3 text-sm">
                            <div className="grid grid-cols-3 gap-2 py-1">
                                <div className="text-neutral-500">Website</div>
                                <div className="col-span-2 font-medium">https://www.softgeartechnologies.in/</div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 py-1 border-t border-neutral-100 pt-3">
                                <div className="text-neutral-500">Verification email</div>
                                <div className="col-span-2 font-medium">support@softgeartechnologies.in</div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 py-1 border-t border-neutral-100 pt-3">
                                <div className="text-neutral-500">Plan</div>
                                <div className="col-span-2 font-medium">Free</div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 py-1 border-t border-neutral-100 pt-3">
                                <div className="text-neutral-500">Created</div>
                                <div className="col-span-2 font-medium">Jun 24, 2026</div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 py-1 border-t border-neutral-100 pt-3">
                                <div className="text-neutral-500">Org ID</div>
                                <div className="col-span-2 font-medium font-mono text-xs">org_3FapsZ08MC...</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProfileSettings() {
    return (
        <div className="mt-6 space-y-6">
            {/* Company profile */}
            <div className="rounded-xl border border-neutral-200 bg-white p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                    <div>
                        <h2 className="font-mono text-lg font-bold">Company profile</h2>
                        <p className="text-xs text-neutral-500 mt-1">What we've learned about your company. Used when generating your pipelines and assessments.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-neutral-400 font-medium">Updated 6/24/2026</span>
                        <div className="flex gap-2">
                            <button className="px-4 py-1.5 border border-neutral-200 rounded-md text-sm font-semibold hover:bg-neutral-50 transition-colors">Edit</button>
                            <button className="px-4 py-1.5 border border-neutral-200 rounded-md text-sm font-semibold hover:bg-neutral-50 flex items-center gap-1.5 transition-colors">
                                <RefreshCw size={14} />
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-semibold mb-2">What you do</h3>
                    <p className="text-sm text-neutral-700 leading-relaxed max-w-4xl">
                        Softgear Technologies delivers custom software solutions specifically designed for small and medium enterprises (SMEs) and startups in India. They provide high-performance websites and mobile apps, along with AI automation systems to streamline operations and boost efficiency. Key capabilities include application development, particularly with React and Next.js for web and mobile platforms, as well as smart automation workflows that integrate AI to eliminate manual tasks.
                    </p>

                    <div className="flex flex-wrap gap-2 mt-4">
                        <span className="px-2.5 py-1 bg-[#f0fdf4] text-emerald-700 text-[11px] rounded font-medium border border-emerald-100">Product type: B2B SaaS</span>
                        <span className="px-2.5 py-1 bg-[#f5f3ff] text-purple-700 text-[11px] rounded font-medium border border-purple-100">Industry: Tech</span>
                        <span className="px-2.5 py-1 bg-[#eff6ff] text-blue-700 text-[11px] rounded font-medium border border-blue-100">Domain: Custom software development</span>
                    </div>
                </div>
            </div>

            {/* Tech stack */}
            <div className="rounded-xl border border-neutral-200 bg-white p-6">
                <div className="mb-6">
                    <h2 className="font-mono text-lg font-bold">Tech stack</h2>
                    <p className="text-xs text-neutral-500 mt-1">From your linked repositories.</p>
                </div>
                <div className="space-y-4">
                    <div>
                        <div className="text-xs font-semibold text-neutral-700 mb-1">Languages</div>
                        <div className="text-sm text-neutral-400 italic">Not inferred</div>
                    </div>
                    <div className="border-t border-neutral-100 pt-4">
                        <div className="text-xs font-semibold text-neutral-700 mb-1">Frameworks</div>
                        <div className="text-sm text-neutral-400 italic">Not inferred</div>
                    </div>
                    <div className="border-t border-neutral-100 pt-4">
                        <div className="text-xs font-semibold text-neutral-700 mb-1">Infrastructure</div>
                        <div className="text-sm text-neutral-400 italic">Not inferred</div>
                    </div>
                    <div className="border-t border-neutral-100 pt-4">
                        <div className="text-xs font-semibold text-neutral-700 mb-1">Architecture patterns</div>
                        <div className="text-sm text-neutral-400 italic">Not inferred</div>
                    </div>
                </div>
            </div>

            {/* How you typically run assessments */}
            <div className="rounded-xl border border-neutral-200 bg-white p-6">
                <div className="mb-6">
                    <h2 className="font-mono text-lg font-bold">How you typically run assessments</h2>
                    <p className="text-xs text-neutral-500 mt-1">Patterns from your past hiring.</p>
                </div>

                <div className="flex gap-2">
                    <span className="px-2.5 py-1 bg-neutral-100 text-neutral-600 text-[11px] rounded font-medium border border-neutral-200">Typical difficulty: not inferred</span>
                    <span className="px-2.5 py-1 bg-neutral-100 text-neutral-600 text-[11px] rounded font-medium border border-neutral-200">Avg time: not inferred</span>
                </div>

                <div className="mt-5 border-t border-neutral-100 pt-4">
                    <div className="text-xs font-semibold text-neutral-700 mb-1">Common domains</div>
                    <div className="text-sm text-neutral-400 italic">Not inferred</div>
                </div>
            </div>
        </div>
    );
}
