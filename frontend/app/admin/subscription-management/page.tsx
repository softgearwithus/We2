'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Save, AlertCircle, RefreshCcw } from 'lucide-react';
import { getStoredToken } from '@/app/lib/auth-storage';
import { fetchPlatformSettings, refreshFreeTier, updatePlatformSettings } from '../../lib/admin-settings';
import { fetchAdminSubscriptionPayments, type SubscriptionPaymentRecord } from '@/app/lib/admin';

export default function SubscriptionManagementPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isRefreshingFreeTier, setIsRefreshingFreeTier] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const [freeTierLimitMinutes, setFreeTierLimitMinutes] = useState<number>(10);
    const [upgradesEnabled, setUpgradesEnabled] = useState(false);
    const [prices, setPrices] = useState({
        pro: {
            '1m': 0,
        },
        display: {
            proMonthlyUsd: 0,
        },
    });
    const [payments, setPayments] = useState<SubscriptionPaymentRecord[]>([]);
    const [isPaymentsLoading, setIsPaymentsLoading] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setIsLoading(true);
            const token = getStoredToken('admin') || '';
            const data = await fetchPlatformSettings(token);
            setUpgradesEnabled(data.upgradesEnabled || false);
            setFreeTierLimitMinutes(data.freeTierLimitMinutes ?? 10);
            if (data.subscriptionPrices) {
                setPrices(prev => ({
                    pro: {
                        ...prev.pro,
                        '1m': Number(data.subscriptionPrices?.pro?.['1m']) || prev.pro['1m'],
                    },
                    display: {
                        ...prev.display,
                        proMonthlyUsd: Number(data.subscriptionPrices?.display?.proMonthlyUsd) || prev.display.proMonthlyUsd,
                    },
                }));
            }

            setIsPaymentsLoading(true);
            const paymentRows = await fetchAdminSubscriptionPayments(token, 50);
            setPayments(Array.isArray(paymentRows) ? paymentRows : []);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch settings');
            setPayments([]);
        } finally {
            setIsPaymentsLoading(false);
            setIsLoading(false);
        }
    };

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            setError(null);
            setSuccessMsg(null);
            const token = getStoredToken('admin') || '';
            await updatePlatformSettings(token, {
                upgradesEnabled,
                subscriptionPrices: prices,
                freeTierLimitMinutes,
            } as any);
            setSuccessMsg('Settings saved successfully.');
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    const handleRefreshFreeTier = async () => {
        try {
            setIsRefreshingFreeTier(true);
            setError(null);
            setSuccessMsg(null);
            const token = getStoredToken('admin') || '';
            await updatePlatformSettings(token, {
                freeTierLimitMinutes,
            } as any);
            await refreshFreeTier(token);
            setSuccessMsg('Saved & refreshed free tier.');
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to refresh free tier');
        } finally {
            setIsRefreshingFreeTier(false);
        }
    };

    const handlePriceChange = (duration: string, value: string) => {
        const numValue = parseInt(value) || 0;
        setPrices(prev => ({
            ...prev,
            pro: {
                ...prev.pro,
                [duration]: numValue
            }
        }));
    };

    const handleUsdDisplayChange = (value: string) => {
        const numValue = Number(value) || 0;
        setPrices(prev => ({
            ...prev,
            display: {
                ...prev.display,
                proMonthlyUsd: numValue,
            },
        }));
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <CreditCard className="text-blue-600" /> Subscription Management
                    </h1>
                    <p className="text-slate-500 mt-1">Configure global upgrades and pricing logic.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                    {isSaving ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                        <Save size={18} />
                    )}
                    Save Changes
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            {successMsg && (
                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-lg flex items-center gap-2">
                    <Save size={18} />
                    {successMsg}
                </div>
            )}

            <div className="grid gap-6">
                {/* Upgrade Toggle Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Global Upgrades Toggle</h2>
                            <p className="text-sm text-slate-500 mt-1">Enable or disable the ability for students to purchase or upgrade plans from the /pricing page.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={upgradesEnabled}
                                onChange={(e) => setUpgradesEnabled(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-100 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>

                {/* Pricing Configuration Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-slate-900">Pro Plan Pricing</h2>
                        <p className="text-sm text-slate-500 mt-1">Configure the single active Pro monthly plan pricing.</p>
                    </div>

                    <div className="p-6 grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-4 w-1 bg-blue-600 rounded-full" />
                                <h3 className="font-bold text-slate-800">EMBLE Pro (Monthly)</h3>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-4">
                                    <label className="w-20 text-sm font-medium text-slate-600 uppercase tracking-wider">1 Month</label>
                                    <div className="relative flex-1">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                                        <input
                                            type="number"
                                            min="0"
                                            value={prices.pro['1m']}
                                            onChange={(e) => handlePriceChange('1m', e.target.value)}
                                            className="w-full pl-8 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-4 w-1 bg-emerald-600 rounded-full" />
                                <h3 className="font-bold text-slate-800">Display Price (Non-India)</h3>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-4">
                                    <label className="w-24 text-sm font-medium text-slate-600 uppercase tracking-wider">USD / Month</label>
                                    <div className="relative flex-1">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={prices.display.proMonthlyUsd}
                                            onChange={(e) => handleUsdDisplayChange(e.target.value)}
                                            className="w-full pl-8 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500">
                                    This is display-only pricing for users outside India. Checkout still settles in INR.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Free Tier Configuration Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-slate-900">Free Tier Constraints</h2>
                        <p className="text-sm text-slate-500 mt-1">Configure feature access duration globally for all free users.</p>
                    </div>

                    <div className="p-6">
                        {/* Session Limit */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-4 w-1 bg-brand-orange rounded-full" />
                                <h3 className="font-bold text-slate-800">Access Duration (Minutes)</h3>
                            </div>
                            <p className="text-xs text-slate-500 mb-4">Time allowed inside Premium tools (e.g. Workstation) before being locked out.</p>
                            <input
                                type="number"
                                min="1"
                                value={freeTierLimitMinutes}
                                onChange={(e) => setFreeTierLimitMinutes(parseInt(e.target.value) || 0)}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                            <button
                                onClick={handleRefreshFreeTier}
                                disabled={isRefreshingFreeTier}
                                className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-orange text-white font-semibold hover:bg-orange-600 disabled:opacity-50"
                            >
                                {isRefreshingFreeTier ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                ) : (
                                    <RefreshCcw size={16} />
                                )}
                                Refresh Free Tier
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-slate-900">Recent Subscription Payments</h2>
                        <p className="text-sm text-slate-500 mt-1">Latest Pro member checkout records from Razorpay.</p>
                    </div>

                    {isPaymentsLoading ? (
                        <div className="p-8 flex items-center justify-center">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700"></div>
                        </div>
                    ) : payments.length === 0 ? (
                        <div className="p-8 text-center text-sm font-semibold text-slate-400">No paid subscriptions yet.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[860px] text-sm">
                                <thead>
                                    <tr className="text-left text-xs uppercase tracking-wider text-slate-500 border-b border-slate-100">
                                        <th className="px-6 py-3">Date</th>
                                        <th className="px-6 py-3">Student</th>
                                        <th className="px-6 py-3">Email</th>
                                        <th className="px-6 py-3">Plan</th>
                                        <th className="px-6 py-3">Amount</th>
                                        <th className="px-6 py-3">Payment ID</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map((row) => (
                                        <tr key={row.id} className="border-b border-slate-100/80">
                                            <td className="px-6 py-3 font-medium text-slate-700">{formatDate(row.paidAt || row.createdAt)}</td>
                                            <td className="px-6 py-3 font-semibold text-slate-800">{row.userName || 'N/A'}</td>
                                            <td className="px-6 py-3 text-slate-600">{row.userEmail || 'N/A'}</td>
                                            <td className="px-6 py-3 font-semibold text-slate-800">EMBLE Pro Member</td>
                                            <td className="px-6 py-3 font-bold text-slate-900">₹{(row.amountInPaise / 100).toFixed(2)}</td>
                                            <td className="px-6 py-3 font-mono text-xs text-slate-500">{row.paymentId || 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
