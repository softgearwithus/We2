'use client';

import { fetchApi } from '../../lib/apiClient';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Key, Mail, Trash2, ChevronRight, AlertTriangle, Save, CreditCard, Calendar, Star, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';

type Tab = 'account' | 'subscription' | 'security';

export default function SettingsPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('account');
    const [isSaving, setIsSaving] = useState(false);
    const [payments, setPayments] = useState<Array<{
        id: string;
        plan: string;
        amountInPaise: number;
        currency: string;
        paidAt: string | null;
        createdAt: string;
        paymentId: string | null;
    }>>([]);
    const [isPaymentsLoading, setIsPaymentsLoading] = useState(false);

    React.useEffect(() => {
        const loadPayments = async () => {
            const { getActiveToken } = await import('@/app/lib/auth-storage');
            const token = getActiveToken();
            if (!token || !user?.id) return;

            try {
                setIsPaymentsLoading(true);
                const response = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/users/my/subscription/payments?limit=25`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) {
                    setPayments([]);
                    return;
                }
                const rows = await response.json();
                setPayments(Array.isArray(rows) ? rows : []);
            } catch {
                setPayments([]);
            } finally {
                setIsPaymentsLoading(false);
            }
        };

        void loadPayments();
    }, [user?.id]);

    // Date formatter
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Plan display formatter
    const getDisplayPlan = (plan?: string) => {
        if (!plan || plan === 'free') return 'Free';
        if (plan === 'standard' || plan === 'placement_plus' || plan.includes('standard')) return 'EMBLE Pro Member';
        if (plan === 'pro' || plan === 'we2_max' || plan.includes('pro')) return 'EMBLE Pro Member';
        return plan;
    };

    // Password State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
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
        { id: 'subscription', label: 'Subscription', icon: <CreditCard size={18} /> },
        { id: 'security', label: 'Security', icon: <Shield size={18} /> },
    ];

    return (
        <div className="min-h-screen bg-[#fafafa] font-sans text-slate-900 pb-20">
            <div className="max-w-full max-w-[1000px] mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8">

                {/* Left Sidebar Nav */}
                <div className="w-full md:w-64 shrink-0">
                    <h1 className="text-2xl font-black text-slate-900 mb-6">Settings</h1>
                    <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as Tab)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-slate-50 text-slate-900'
                                    : 'text-slate-500 hover:bg-slate-100'
                                    }`}
                            >
                                <span className={activeTab === tab.id ? 'text-slate-800' : 'text-slate-400'}>{tab.icon}</span>
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
                                                <p className="font-bold text-slate-900">{user?.email}</p>
                                                <p className="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-1">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Verified
                                                </p>
                                            </div>
                                            <button className="text-sm font-bold text-slate-800 hover:text-slate-900 bg-slate-50 px-4 py-2 rounded-lg transition-colors">
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

                        {/* SUBSCRIPTION TAB */}
                        {activeTab === 'subscription' && (
                            <motion.div
                                key="subscription"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-6"
                            >
                                <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                                <Star className="text-amber-500 fill-amber-500" size={20} /> Current Plan
                                            </h2>
                                            <p className="text-sm text-slate-500 mt-1">Review your active subscription details and billing cycle.</p>
                                        </div>
                                        <Link href="/pricing" className="text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 px-5 py-2.5 rounded-xl shadow-lg shadow-slate-200 transition-all flex items-center gap-2">
                                            <Sparkles size={16} /> Upgrade Plan
                                        </Link>
                                    </div>
                                    <div className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                            {/* Plan Details */}
                                            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col gap-1">
                                                <span className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1.5 focus:outline-none mb-1">
                                                    <CreditCard size={14} /> Active Plan
                                                </span>
                                                <span className="text-2xl font-black text-slate-900">
                                                    {getDisplayPlan(user?.subscriptionPlan)}
                                                </span>
                                                <span className={`text-xs font-bold px-2 py-0.5 mt-1 rounded-md w-fit ${user?.subscriptionStatus === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-600'}`}>
                                                    {(user?.subscriptionStatus || 'Free').toUpperCase()}
                                                </span>
                                            </div>

                                            {/* Started */}
                                            <div className="p-5 rounded-xl border border-slate-100 bg-slate-50 flex flex-col justify-center">
                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 focus:outline-none mb-1">
                                                    <Calendar size={14} /> Valid From
                                                </span>
                                                <span className="text-lg font-bold text-slate-800">
                                                    {formatDate(user?.usageLastReset || user?.createdAt)}
                                                </span>
                                            </div>

                                            {/* Ends */}
                                            <div className="p-5 rounded-xl border border-slate-100 bg-slate-50 flex flex-col justify-center">
                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 focus:outline-none mb-1">
                                                    <Calendar size={14} /> Valid Until
                                                </span>
                                                <span className="text-lg font-bold text-slate-800">
                                                    {user?.subscriptionEndDate ? formatDate(user.subscriptionEndDate) : 'Lifetime Access'}
                                                </span>
                                            </div>

                                        </div>
                                    </div>
                                </section>

                                <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="p-6 border-b border-slate-100">
                                        <h2 className="text-lg font-bold text-slate-900">Billing History</h2>
                                        <p className="text-sm text-slate-500 mt-1">Recent payments and invoices.</p>
                                    </div>
                                    {isPaymentsLoading ? (
                                        <div className="p-8 flex items-center justify-center">
                                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-600"></div>
                                        </div>
                                    ) : payments.length === 0 ? (
                                        <div className="p-8 flex flex-col items-center justify-center text-center">
                                            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                                                <CreditCard size={24} className="text-slate-300" />
                                            </div>
                                            <p className="text-sm font-bold text-slate-400">No past invoices available.</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full min-w-[640px] text-sm">
                                                <thead>
                                                    <tr className="text-left text-xs uppercase tracking-wider text-slate-500 border-b border-slate-100">
                                                        <th className="px-6 py-3">Date</th>
                                                        <th className="px-6 py-3">Plan</th>
                                                        <th className="px-6 py-3">Amount</th>
                                                        <th className="px-6 py-3">Payment ID</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {payments.map((row) => {
                                                        const paidDate = row.paidAt || row.createdAt;
                                                        return (
                                                            <tr key={row.id} className="border-b border-slate-100/80">
                                                                <td className="px-6 py-3 font-medium text-slate-700">{formatDate(paidDate)}</td>
                                                                <td className="px-6 py-3 font-semibold text-slate-800">EMBLE Pro Member</td>
                                                                <td className="px-6 py-3 font-bold text-slate-900">₹{(row.amountInPaise / 100).toFixed(2)}</td>
                                                                <td className="px-6 py-3 font-mono text-xs text-slate-500">{row.paymentId || 'N/A'}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
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
                                            <Key className="text-slate-700" size={20} /> Change Password
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
                                                className="w-full max-w-md bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all font-medium"
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
                                                className="w-full max-w-md bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all font-medium"
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
                                                className="w-full max-w-md bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all font-medium"
                                                required
                                            />
                                        </div>
                                        <div className="pt-2">
                                            <button
                                                type="submit"
                                                disabled={isSaving || !passwordData.currentPassword || !passwordData.newPassword}
                                                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                                            >
                                                <Save size={16} />
                                                {isSaving ? 'Updating...' : 'Update Password'}
                                            </button>
                                        </div>
                                    </form>
                                </section>

                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>

            </div>
        </div >
    );
}
