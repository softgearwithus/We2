'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Save, AlertCircle, RefreshCcw } from 'lucide-react';
import { getStoredToken } from '@/app/lib/auth-storage';
import { fetchPlatformSettings, refreshFreeTier, updatePlatformSettings } from '../../lib/admin-settings';

export default function SubscriptionManagementPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isRefreshingFreeTier, setIsRefreshingFreeTier] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const [freeTierLimitMinutes, setFreeTierLimitMinutes] = useState<number>(10);
    const [upgradesEnabled, setUpgradesEnabled] = useState(false);
    const [prices, setPrices] = useState({
        standard: {
            '1m': 0,
            '3m': 0,
            '6m': 0,
            '12m': 0,
        },
        pro: {
            '1m': 0,
            '3m': 0,
            '6m': 0,
            '12m': 0,
        }
    });

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
                // Merge with default structure to prevent undefined errors
                setPrices(prev => ({
                    standard: { ...prev.standard, ...(data.subscriptionPrices?.standard || {}) },
                    pro: { ...prev.pro, ...(data.subscriptionPrices?.pro || {}) }
                }));
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch settings');
        } finally {
            setIsLoading(false);
        }
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

    const handlePriceChange = (plan: 'standard' | 'pro', duration: string, value: string) => {
        const numValue = parseInt(value) || 0;
        setPrices(prev => ({
            ...prev,
            [plan]: {
                ...prev[plan],
                [duration]: numValue
            }
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
                        <h2 className="text-lg font-bold text-slate-900">Dynamic Pricing Validation</h2>
                        <p className="text-sm text-slate-500 mt-1">Configure exact prices in INR for the public pricing page rendering.</p>
                    </div>

                    <div className="p-6 grid md:grid-cols-2 gap-8">
                        {/* Standard Pricing */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-4 w-1 bg-slate-800 rounded-full" />
                                <h3 className="font-bold text-slate-800">EMBLE Standard</h3>
                            </div>

                            <div className="space-y-3">
                                {['1m', '3m', '6m', '12m'].map((dur) => (
                                    <div key={`std-${dur}`} className="flex items-center gap-4">
                                        <label className="w-20 text-sm font-medium text-slate-600 uppercase tracking-wider">{dur.replace('m', ' Months')}</label>
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                                            <input
                                                type="number"
                                                min="0"
                                                value={prices.standard[dur as keyof typeof prices.standard]}
                                                onChange={(e) => handlePriceChange('standard', dur, e.target.value)}
                                                className="w-full pl-8 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pro Pricing */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-4 w-1 bg-blue-600 rounded-full" />
                                <h3 className="font-bold text-slate-800">EMBLE Pro</h3>
                            </div>

                            <div className="space-y-3">
                                {['1m', '3m', '6m', '12m'].map((dur) => (
                                    <div key={`pro-${dur}`} className="flex items-center gap-4">
                                        <label className="w-20 text-sm font-medium text-slate-600 uppercase tracking-wider">{dur.replace('m', ' Months')}</label>
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                                            <input
                                                type="number"
                                                min="0"
                                                value={prices.pro[dur as keyof typeof prices.pro]}
                                                onChange={(e) => handlePriceChange('pro', dur, e.target.value)}
                                                className="w-full pl-8 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                ))}
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
            </div>
        </div>
    );
}
