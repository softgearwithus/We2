'use client';

import React, { useEffect, useState } from 'react';
import { Search, Filter, MoreVertical, CheckCircle2, XCircle, Clock, IndianRupee, Video, Users, GraduationCap, AlertCircle, ArrowUpRight } from 'lucide-react';
import { approveMentorApplication, createAdminMentorPayout, fetchAdminMentorApplications, fetchAdminMentorPayouts, fetchAdminMentorSessions, fetchAdminMentors, rejectMentorApplication, toggleMentorStatus as updateMentorStatus } from '@/app/lib/mentors';

// MOCK DATA
export default function AdminMentorsPage() {
    const [activeTab, setActiveTab] = useState<'directory' | 'applications' | 'payouts' | 'refunds' | 'analytics' | 'sessions'>('directory');
    const [applications, setApplications] = useState<any[]>([]);
    const [payouts, setPayouts] = useState<any[]>([]);
    const [refunds, setRefunds] = useState<any[]>([]);
    const [refundHistory, setRefundHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refundSubTab, setRefundSubTab] = useState<'pending' | 'history'>('pending');
    const [analytics, setAnalytics] = useState<any[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);
    const [usersById, setUsersById] = useState<Record<string, any>>({});

    // Modal States for Action Dialogs
    const [processingPayoutModal, setProcessingPayoutModal] = useState<string | null>(null);
    const [upiRefInput, setUpiRefInput] = useState('');

    const [processingRefundModal, setProcessingRefundModal] = useState<{ id: string, amount: number } | null>(null);
    const [refundUpiInput, setRefundUpiInput] = useState('');

    // Session Logs State
    const [sessionSearchId, setSessionSearchId] = useState('');

    // Directory Interactive States
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [mentors, setMentors] = useState<any[]>([]);
    const [showActiveFilters, setShowActiveFilters] = useState({ active: true, disabled: false });

    // View Profile Modal
    const [viewingProfile, setViewingProfile] = useState<any | null>(null);

    const toggleMentorStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'Active' ? 'Disabled' : 'Active';
        const token = localStorage.getItem('accessToken') || '';
        await updateMentorStatus(token, id, newStatus === 'Active');
        setMentors(mentors.map(m => m.id === id ? { ...m, status: newStatus } : m));
        setActiveDropdown(null);
        alert(`Mentor account has been ${newStatus.toLowerCase()}. They will not be visible to users.`);
    };

    if (loading) {
        return (
            <div className="p-8 max-w-4xl mx-auto min-h-[calc(100vh-64px)] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 max-w-4xl mx-auto min-h-[calc(100vh-64px)] flex flex-col items-center justify-center text-center">
                <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Mentor admin unavailable</h2>
                <p className="text-slate-500">Please check back later.</p>
            </div>
        );
    }

    const deleteMentor = (id: string) => {
        if (window.confirm("Are you sure you want to permanently delete this mentor? This action cannot be undone.")) {
            setMentors(mentors.filter(m => m.id !== id));
            setActiveDropdown(null);
        }
    };

    const handleApproveApp = async (app: any) => {
        const token = localStorage.getItem('accessToken') || '';
        const mentor = await approveMentorApplication(token, app.id);
        setApplications(apps => apps.filter(a => a.id !== app.id));
        setMentors([{
            id: mentor.id,
            name: mentor.name,
            expertise: app.expertise,
            rating: mentor.rating,
            sessions: mentor.sessionsCount,
            status: mentor.isActive ? 'Active' : 'Disabled',
            joined: 'Just Now',
            avatar: app.avatar || 'https://ui-avatars.com/api/?name=Mentor'
        }, ...mentors]);
        alert('Application Approved! The mentor is now visible on the platform.');
    };

    const handleRejectApp = async (id: string) => {
        const token = localStorage.getItem('accessToken') || '';
        await rejectMentorApplication(token, id);
        setApplications(apps => apps.filter(a => a.id !== id));
        alert('Application Rejected.');
    };

    const handleSettlePayout = async () => {
        if (!upiRefInput.trim()) {
            alert('Please enter a valid UPI Reference number.');
            return;
        }
        const token = localStorage.getItem('accessToken') || '';
        const payout = payouts.find((p) => p.id === processingPayoutModal);
        if (payout) {
            await createAdminMentorPayout(token, { mentorId: payout.mentorId, amountInr: payout.amount, referenceId: upiRefInput });
        }
        setPayouts(p => p.filter(pay => pay.id !== processingPayoutModal));
        setProcessingPayoutModal(null);
        setUpiRefInput('');
        alert(`Payout Settled! The mentor's console will now show this payout with Ref: ${upiRefInput}`);
    };

    const handleProcessRefund = (id: string, amount: number) => {
        setProcessingRefundModal({ id, amount });
    };

    const submitRefund = () => {
        if (!processingRefundModal) return;
        if (!refundUpiInput.trim()) {
            alert('Please enter a valid UPI/Bank Reference number for the refund.');
            return;
        }

        const refundToProcess = refunds.find(r => r.id === processingRefundModal.id);

        if (refundToProcess) {
            // Remove from pending
            setRefunds(r => r.filter(ref => ref.id !== refundToProcess.id));

            // Add to history
            setRefundHistory(prev => [
                {
                    id: `rh-${Date.now()}`,
                    studentName: refundToProcess.studentName,
                    amount: refundToProcess.amount,
                    source: refundToProcess.source,
                    mentorName: refundToProcess.mentorName,
                    status: 'Refunded',
                    date: 'Just Now',
                    upiRef: refundUpiInput
                },
                ...prev
            ]);
        }

        setProcessingRefundModal(null);
        setRefundUpiInput('');
        // Mock notification to student
        alert(`Refund Processed!\n\n₹${processingRefundModal.amount} has been logged with Ref: ${refundUpiInput}.\n\nAn automated Email/SMS notification has been sent to the student stating their refund has been initiated.`);
    };

    useEffect(() => {
        const loadAdminMentors = async () => {
            try {
                const token = localStorage.getItem('accessToken') || '';
                const [mentorData, applicationData, payoutData, sessionData] = await Promise.all([
                    fetchAdminMentors(token),
                    fetchAdminMentorApplications(token),
                    fetchAdminMentorPayouts(token),
                    fetchAdminMentorSessions(token),
                ]);
                const mentorMap = new Map<string, { name?: string | null; userId?: string | null }>(
                    (mentorData || []).map((m: any) => [m.id, m])
                );
                const mentorUserIds = (mentorData || []).map((m: any) => m.userId).filter(Boolean);
                const studentUserIds = (sessionData || []).map((s: any) => s.studentId).filter(Boolean);
                const userIds = Array.from(new Set([...mentorUserIds, ...studentUserIds]));
                const userResponses = await Promise.all(
                    userIds.map((id) => fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/users/${id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }).then((res) => (res.ok ? res.json() : null)))
                );
                const userMap = userResponses.filter(Boolean).reduce((acc: Record<string, any>, user: any) => {
                    acc[user.id] = user;
                    return acc;
                }, {});
                setUsersById(userMap);
                setMentors((mentorData || []).map((m: any) => ({
                    id: m.id,
                    name: m.name,
                    expertise: m.companies || 'Expert',
                    rating: m.rating || 0,
                    sessions: m.sessionsCount || 0,
                    status: m.isActive ? 'Active' : 'Disabled',
                    joined: new Date(m.createdAt).toLocaleDateString(),
                    avatar: m.avatarUrl || 'https://ui-avatars.com/api/?name=Mentor',
                    feePerMinuteInr: m.pricePerMinute,
                    headline: m.headline,
                    about: m.about,
                    totalExperience: m.experience,
                    userId: m.userId,
                })));
                setApplications((applicationData || []).map((a: any) => ({
                    id: a.id,
                    name: a.name,
                    expertise: a.expertise || 'General',
                    experience: a.totalExperience || 'N/A',
                    appliedDate: new Date(a.createdAt).toLocaleDateString(),
                    status: a.status,
                    avatar: 'https://ui-avatars.com/api/?name=Applicant',
                    feePerMinuteInr: a.feePerMinuteInr,
                    headline: a.headline,
                    about: a.bio,
                    offerings: a.offerings,
                    linkedin: a.linkedin,
                })));
                const resolveMentorName = (mentorId: string) => {
                    const mentor = mentorMap.get(mentorId);
                    if (mentor?.name) return mentor.name;
                    const user = mentor?.userId ? userMap[mentor.userId] : undefined;
                    return user?.email || 'Mentor';
                };
                setPayouts((payoutData || []).map((p: any) => ({
                    id: p.id,
                    mentorId: p.mentorId,
                    mentorName: resolveMentorName(p.mentorId),
                    grossAmount: p.amountInr,
                    deductions: 0,
                    amount: p.amountInr,
                    period: p.paidAt || p.createdAt,
                    status: 'Paid',
                })));
                setRefunds((sessionData || []).filter((s: any) => s.status === 'declined').map((s: any) => ({
                    id: s.id,
                    studentName: s.studentName || userMap[s.studentId]?.email?.split('@')[0] || 'Student',
                    amount: s.priceInr,
                    source: s.topic,
                    mentorName: resolveMentorName(s.mentorId),
                    status: 'Pending',
                    requestedAt: s.createdAt,
                })));
                setRefundHistory((sessionData || []).filter((s: any) => s.status === 'completed').map((s: any) => ({
                    id: s.id,
                    studentName: s.studentName || userMap[s.studentId]?.email?.split('@')[0] || 'Student',
                    amount: s.priceInr,
                    source: s.topic,
                    mentorName: resolveMentorName(s.mentorId),
                    status: 'Refunded',
                    date: s.updatedAt || s.createdAt,
                    upiRef: 'N/A',
                })));
                setAnalytics((sessionData || []).map((s: any) => ({
                    id: s.id,
                    name: resolveMentorName(s.mentorId),
                    totalGross: s.priceInr,
                    platformCut: Math.round(s.priceInr * 0.2),
                    declineCut: s.status === 'declined' ? Math.round(s.priceInr * 0.02) : 0,
                    razorpayFee: Math.round(s.priceInr * 0.02),
                    netMentorPayout: Math.round(s.priceInr * 0.78),
                })));
                setSessions(sessionData || []);
            } catch (err: any) {
                setError('Mentor admin data unavailable.');
            } finally {
                setLoading(false);
            }
        };
        loadAdminMentors();
    }, []);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Mentor Management</h1>
                <p className="text-sm text-slate-500 mt-1">Manage platform mentors, review applications, and process payouts.</p>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-slate-500">Total Mentors</p>
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                            <GraduationCap size={16} />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl font-extrabold text-slate-900">{mentors.length}</h3>
                        <span className="text-xs font-medium text-emerald-600 flex items-center"><ArrowUpRight size={12} /> +12%</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-slate-500">Sessions This Month</p>
                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <Video size={16} />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                                <h3 className="text-2xl font-extrabold text-slate-900">{sessions.length}</h3>
                        <span className="text-xs font-medium text-emerald-600 flex items-center"><ArrowUpRight size={12} /> +24%</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-slate-500">Pending Apps</p>
                        <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                            <Clock size={16} />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl font-extrabold text-slate-900">{applications.length}</h3>
                    </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm text-white">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-slate-400">Payouts Due</p>
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                            <IndianRupee size={16} />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl font-extrabold">₹ {payouts.reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString()}</h3>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-visible min-h-[500px]">
                {/* Tabs */}
                <div className="flex border-b border-slate-200 bg-slate-50/50">
                    <button
                        onClick={() => setActiveTab('directory')}
                        className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'directory' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        Active Mentors
                    </button>
                    <button
                        onClick={() => setActiveTab('applications')}
                        className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'applications' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        Applications
                        {applications.length > 0 && (
                            <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{applications.length}</span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('payouts')}
                        className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'payouts' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        Process Payouts
                        {payouts.length > 0 && (
                            <span className="bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded-full">{payouts.length}</span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('refunds')}
                        className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'refunds' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        Student Refunds
                        {refunds.length > 0 && (
                            <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full">{refunds.length}</span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'analytics' ? 'border-amber-600 text-amber-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        Calculate / Analytics
                    </button>
                    <button
                        onClick={() => setActiveTab('sessions')}
                        className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'sessions' ? 'border-purple-600 text-purple-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        Session Logs
                    </button>
                </div>

                {/* Tab: Directory */}
                {activeTab === 'directory' && (
                    <div className="p-0">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <div className="relative w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search mentors..."
                                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <div className="relative">
                                <button
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                    className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${isFilterOpen ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    <Filter size={16} /> Filters
                                </button>

                                {isFilterOpen && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)}></div>
                                        <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 shadow-xl rounded-xl z-20 p-4">
                                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Filter By Status</h4>
                                            <div className="space-y-2 mb-4">
                                                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                                    <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" checked={showActiveFilters.active} onChange={() => setShowActiveFilters(p => ({ ...p, active: !p.active }))} /> Active
                                                </label>
                                                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                                    <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" checked={showActiveFilters.disabled} onChange={() => setShowActiveFilters(p => ({ ...p, disabled: !p.disabled }))} /> Disabled
                                                </label>
                                            </div>
                                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Expertise</h4>
                                            <select className="w-full text-sm border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 focus:outline-none bg-slate-50">
                                                <option>All Topics</option>
                                                <option>Frontend & UI</option>
                                                <option>Backend & DB</option>
                                                <option>DSA & Logic</option>
                                            </select>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="overflow-visible pb-12 relative">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                                        <th className="px-6 py-4">Mentor</th>
                                        <th className="px-6 py-4">Expertise</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Sessions</th>
                                        <th className="px-6 py-4">Rating</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mentors.filter(m => {
                                        if (showActiveFilters.active && showActiveFilters.disabled) return true;
                                        if (showActiveFilters.active) return m.status === 'Active';
                                        if (showActiveFilters.disabled) return m.status === 'Disabled';
                                        return false;
                                    }).map(mentor => (
                                        <tr key={mentor.id} className={`hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0 relative ${mentor.status === 'Disabled' ? 'grayscale opacity-60 bg-slate-50' : ''}`}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img src={mentor.avatar} alt="" className="w-10 h-10 rounded-full border border-slate-200" />
                                                    <div>
                                                        <div className={`text-sm font-bold ${mentor.status === 'Disabled' ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                                                            {mentor.name}
                                                            <span className="ml-2 text-[10px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">ID: {mentor.id}</span>
                                                        </div>
                                                        <div className="text-xs text-slate-500 mt-0.5">Joined {mentor.joined}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 font-medium">{mentor.expertise}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${mentor.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                                                    }`}>
                                                    {mentor.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-slate-600">{mentor.sessions}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1 text-sm font-bold text-slate-900">
                                                    <span className="text-orange-500">★</span> {mentor.rating}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right relative">
                                                <button
                                                    onClick={() => setActiveDropdown(activeDropdown === mentor.id ? null : mentor.id)}
                                                    className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                                                >
                                                    <MoreVertical size={16} />
                                                </button>

                                                {/* Actions Dropdown */}
                                                {activeDropdown === mentor.id && (
                                                    <>
                                                        <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); }}></div>
                                                        <div className="absolute right-6 top-10 w-48 bg-white border border-slate-200 shadow-xl rounded-xl z-20 py-2 text-left">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setViewingProfile(mentor); setActiveDropdown(null); }}
                                                                className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 text-left"
                                                            >
                                                                View Profile
                                                            </button>
                                                            <div className="h-px bg-slate-100 my-1"></div>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); toggleMentorStatus(mentor.id, mentor.status); }}
                                                                className={`w-full px-4 py-2 text-sm text-left font-medium ${mentor.status === 'Active' ? 'text-orange-600 hover:bg-orange-50' : 'text-emerald-600 hover:bg-emerald-50'
                                                                    }`}
                                                            >
                                                                {mentor.status === 'Active' ? 'Disable Account' : 'Enable Account'}
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); deleteMentor(mentor.id); }}
                                                                className="w-full px-4 py-2 text-sm text-left font-medium text-red-600 hover:bg-red-50"
                                                            >
                                                                Delete Account
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Tab: Applications */}
                {activeTab === 'applications' && (
                    <div className="p-0">
                        {applications.length === 0 ? (
                            <div className="p-12 text-center">
                                <CheckCircle2 size={48} className="mx-auto text-emerald-200 mb-4" />
                                <h3 className="text-lg font-bold text-slate-900 mb-1">You're all caught up!</h3>
                                <p className="text-slate-500">There are no pending mentor applications to review.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {applications.map(app => (
                                    <div key={app.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50/50 transition-colors">
                                        <div className="flex items-start gap-4 flex-1">
                                            <img src={app.avatar} alt="" className="w-12 h-12 rounded-full border border-slate-200" />
                                            <div>
                                                <h3 className="text-base font-bold text-slate-900 mb-1">{app.name}</h3>
                                                <p className="text-sm text-slate-600 mb-1"><span className="font-semibold text-slate-800">Expertise:</span> {app.expertise} • {app.experience} Exp</p>
                                                <p className="text-xs text-slate-500 flex items-center gap-1"><Clock size={12} /> Applied {app.appliedDate}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <button onClick={() => setViewingProfile(app)} className="text-sm font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4 mr-2">
                                                View Full Profile
                                            </button>
                                            <button onClick={() => handleRejectApp(app.id)} className="w-10 h-10 rounded-full border border-red-200 text-red-600 flex items-center justify-center hover:bg-red-50 transition-colors">
                                                <XCircle size={20} />
                                            </button>
                                            <button onClick={() => handleApproveApp(app)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm">
                                                Approve Mentor
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Tab: Payouts */}
                {activeTab === 'payouts' && (
                    <div className="p-0">
                        <div className="px-6 py-4 bg-orange-50 border-b border-orange-100 flex items-start gap-3">
                            <AlertCircle size={18} className="text-orange-600 shrink-0 mt-0.5" />
                            <div className="text-sm text-orange-800">
                                <span className="font-bold">Important:</span> When you settle a payout here, ensure the amount has been successfully transferred via UPI/Bank to the mentor's registered account. Submitting a Reference ID here will immediately update the Mentor's dashboard.
                            </div>
                        </div>

                        {payouts.length === 0 ? (
                            <div className="p-12 text-center text-slate-500">
                                No pending payouts.
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {payouts.map(pay => (
                                    <div key={pay.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50/50 transition-colors">
                                        <div>
                                            <h3 className="text-base font-bold text-slate-900">{pay.mentorName}</h3>
                                            <p className="text-sm text-slate-500 mt-1">Accrued Period: {pay.period}</p>
                                        </div>
                                        <div className="flex flex-col md:flex-row items-end md:items-center gap-6">
                                            <div className="text-right flex flex-col items-end">
                                                <div className="flex items-center gap-3 mb-1 text-xs font-mono bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                                    <div className="text-slate-500">Gross: ₹{pay.grossAmount?.toLocaleString()}</div>
                                                    <div className="text-orange-500 font-semibold">-₹{pay.deductions?.toLocaleString()} (Cuts)</div>
                                                </div>
                                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1 mt-1">Net Payout Due</p>
                                                <p className="text-2xl font-black text-blue-600">₹ {pay.amount.toLocaleString()}</p>
                                            </div>
                                            <button
                                                onClick={() => setProcessingPayoutModal(pay.id)}
                                                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-md"
                                            >
                                                Lodge Payment
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Tab: Refunds */}
                {activeTab === 'refunds' && (
                    <div className="p-0">
                        <div className="px-6 py-4 bg-orange-50 border-b border-orange-100 flex items-start gap-3">
                            <AlertCircle size={18} className="text-orange-600 shrink-0 mt-0.5" />
                            <div className="text-sm text-orange-800">
                                <span className="font-bold">Refund Queue:</span> These sessions were cancelled or auto-rejected by Mentors. Please process these refunds immediately to maintain student satisfaction.
                            </div>
                        </div>

                        {/* Refund Sub-Tabs */}
                        <div className="flex px-6 border-b border-slate-100">
                            <button
                                onClick={() => setRefundSubTab('pending')}
                                className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors ${refundSubTab === 'pending' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            >
                                Pending Refunds ({refunds.length})
                            </button>
                            <button
                                onClick={() => setRefundSubTab('history')}
                                className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors ${refundSubTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            >
                                Refund History ({refundHistory.length})
                            </button>
                        </div>

                        {refundSubTab === 'pending' ? (
                            refunds.length === 0 ? (
                                <div className="p-12 text-center text-slate-500">
                                    No pending student refunds.
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {refunds.map(ref => (
                                        <div key={ref.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50/50 transition-colors">
                                            <div>
                                                <h3 className="text-base font-bold text-slate-900">Student: {ref.studentName}</h3>
                                                <p className="text-sm text-slate-500 mt-1">Session: {ref.source} (Mentor: {ref.mentorName})</p>
                                                <p className="text-xs text-slate-400 mt-1">Requested: {ref.requestedAt}</p>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Refund Amount</p>
                                                    <p className="text-xl font-extrabold text-slate-900">₹ {ref.amount.toLocaleString()}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleProcessRefund(ref.id, ref.amount)}
                                                    className="px-6 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-bold hover:bg-orange-700 transition-colors shadow-md"
                                                >
                                                    Process Refund
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        ) : (
                            refundHistory.length === 0 ? (
                                <div className="p-12 text-center text-slate-500">
                                    No completed refunds yet.
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {refundHistory.map(hist => (
                                        <div key={hist.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50/50 transition-colors">
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                                                    <CheckCircle2 size={20} className="text-emerald-500" />
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-bold text-slate-900">Student: {hist.studentName}</h3>
                                                    <p className="text-sm text-slate-600 mt-1"><span className="font-semibold">Session:</span> {hist.source}</p>
                                                    <p className="text-sm text-slate-500 mt-0.5"><span className="font-semibold">Mentor:</span> {hist.mentorName}</p>
                                                    <div className="flex items-center gap-3 mt-2 text-xs font-mono text-slate-500 bg-slate-50 inline-block px-2 py-1 rounded border border-slate-200">
                                                        <span>Ref: <span className="text-slate-700 font-bold">{hist.upiRef}</span></span>
                                                        <span className="text-slate-300">|</span>
                                                        <span>{hist.date}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <p className="text-xs font-bold uppercase tracking-wider mb-1 text-emerald-600">Successfully Refunded</p>
                                                    <p className="text-xl font-extrabold text-slate-900">₹ {hist.amount.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                    </div>
                )}
                {/* Tab: Analytics */}
                {activeTab === 'analytics' && (
                    <div className="p-0">
                        {/* Summary Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-slate-50/50 border-b border-slate-100">
                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Total Platform Gross</p>
                                <p className="text-xl font-extrabold text-slate-900">₹ {analytics.reduce((acc, curr) => acc + curr.totalGross, 0).toLocaleString()}</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50">
                                <p className="text-xs text-emerald-600 uppercase font-bold tracking-wider mb-1">Platform Revenue (20%)</p>
                                <p className="text-xl font-extrabold text-emerald-700">₹ {analytics.reduce((acc, curr) => acc + curr.platformCut, 0).toLocaleString()}</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-orange-200 bg-orange-50">
                                <p className="text-xs text-orange-600 uppercase font-bold tracking-wider mb-1">Total Fees & Cuts</p>
                                <p className="text-sm text-orange-700 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                                    ₹ {analytics.reduce((acc, curr) => acc + curr.declineCut + curr.razorpayFee, 0).toLocaleString()} (Decline + Gateway)
                                </p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50">
                                <p className="text-xs text-blue-600 uppercase font-bold tracking-wider mb-1">Net Platform Profit</p>
                                <p className="text-xl font-extrabold text-blue-700">
                                    ₹ {(analytics.reduce((acc, curr) => acc + curr.platformCut, 0) + analytics.reduce((acc, curr) => acc + curr.declineCut, 0) - analytics.reduce((acc, curr) => acc + curr.razorpayFee, 0)).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        {/* Detailed breakdown table */}
                        <div className="overflow-x-auto pb-6">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                                        <th className="px-6 py-4">Mentor Name</th>
                                        <th className="px-6 py-4 text-right">Total Gross</th>
                                        <th className="px-6 py-4 text-right">Platform Cut (20%)</th>
                                        <th className="px-6 py-4 text-right">Gateway cut (2%)</th>
                                        <th className="px-6 py-4 text-right">Cancellation Deduct</th>
                                        <th className="px-6 py-4 text-right text-blue-600">Net Mentor Payout</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {analytics.map((data) => (
                                        <tr key={data.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-slate-900">{data.name}</td>
                                            <td className="px-6 py-4 text-right font-mono text-slate-600">₹ {data.totalGross.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right font-mono text-emerald-600 font-semibold">+₹ {data.platformCut.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right font-mono text-orange-600">-₹ {data.razorpayFee.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right font-mono text-orange-600">-₹ {data.declineCut.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right font-mono text-blue-600 font-black tracking-tight">₹ {data.netMentorPayout.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Tab: Session Logs */}
                {activeTab === 'sessions' && (
                    <div className="p-0">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-4">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search by Mentor ID (UUID)..."
                                value={sessionSearchId}
                                onChange={(e) => setSessionSearchId(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                            />
                            </div>
                        </div>

                        {sessionSearchId.trim() === '' ? (
                            <div className="p-12 text-center text-slate-500">
                                Please enter a Mentor ID to view their session history.
                            </div>
                        ) : (
                            <div className="overflow-x-auto pb-6">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                                            <th className="px-6 py-4">Session Date</th>
                                            <th className="px-6 py-4">Student</th>
                                            <th className="px-6 py-4">Topic</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Gross (₹)</th>
                                            <th className="px-6 py-4 text-right">Cuts (₹)</th>
                                            <th className="px-6 py-4 text-right text-purple-600">Net To Mentor</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                    {sessions.filter((s: any) => s.mentorId.toLowerCase() === sessionSearchId.toLowerCase().trim()).length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                                                No sessions found for Mentor ID "{sessionSearchId}".
                                            </td>
                                        </tr>
                                    ) : (
                                        sessions.filter((s: any) => s.mentorId.toLowerCase() === sessionSearchId.toLowerCase().trim()).map((session: any) => (
                                            <tr key={session.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 text-sm text-slate-600">{session.updatedAt || session.createdAt}</td>
                                                <td className="px-6 py-4 font-bold text-slate-900">{session.studentName || usersById[session.studentId]?.email?.split('@')[0] || 'Student'}</td>
                                                    <td className="px-6 py-4 text-sm text-slate-600">{session.topic}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${session.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : session.status === 'declined' ? 'bg-red-100 text-red-700' : session.status === 'accepted' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                                                            {session.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-mono text-slate-600">₹{session.priceInr}</td>
                                                <td className="px-6 py-4 text-right font-mono text-orange-600">
                                                    -₹{Math.round(session.priceInr * 0.22)}
                                                </td>
                                                <td className="px-6 py-4 text-right font-mono font-black tracking-tight text-purple-600">
                                                    ₹{Math.round(session.priceInr * 0.78)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
            </div>

            {/* Refund Modal */}
            {processingRefundModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setProcessingRefundModal(null)}></div>
                    <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-slate-900 mb-2 border-b border-slate-100 pb-4">Process Student Refund</h3>
                        <p className="text-sm text-slate-500 mb-6">Enter the UPI Transaction ID or Bank Reference Number for the refund of <strong className="text-slate-800">₹{processingRefundModal.amount}</strong>.</p>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase mb-2 block">Refund Reference Number</label>
                                <input
                                    type="text"
                                    value={refundUpiInput}
                                    onChange={(e) => setRefundUpiInput(e.target.value)}
                                    placeholder="e.g. UPI1234567890"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-mono"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setProcessingRefundModal(null)}
                                    className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submitRefund}
                                    className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-bold transition-colors shadow-md"
                                >
                                    Confirm Refund
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Settle Payout Modal */}
            {processingPayoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setProcessingPayoutModal(null)}></div>
                    <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-slate-900 mb-2 border-b border-slate-100 pb-4">Log Payment Reference</h3>
                        <p className="text-sm text-slate-500 mb-6">Enter the UPI Transaction ID or Bank Reference Number. This will be visible on the Mentor's Console.</p>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase mb-2 block">UPI / Bank Reference Number</label>
                                <input
                                    type="text"
                                    value={upiRefInput}
                                    onChange={(e) => setUpiRefInput(e.target.value)}
                                    placeholder="e.g. UPI1234567890"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setProcessingPayoutModal(null)}
                                    className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSettlePayout}
                                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors shadow-md"
                                >
                                    Submit Payout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View Profile Modal */}
            {viewingProfile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setViewingProfile(null)}></div>
                    <div className="relative bg-white rounded-2xl w-full max-w-2xl p-0 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
                            <h3 className="text-lg font-bold text-slate-900">Mentor Application Data</h3>
                            <button onClick={() => setViewingProfile(null)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors">
                                <XCircle size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto">
                            <div className="flex items-start gap-4 mb-6">
                                <img src={viewingProfile.avatar} alt="Profile" className="w-20 h-20 rounded-full border border-slate-200" />
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                        {viewingProfile.name}
                                        {viewingProfile.id && !viewingProfile.id.startsWith('a') && (
                                            <span className="text-xs font-mono bg-slate-100 text-slate-500 px-2 py-1 rounded border border-slate-200 uppercase tracking-wider">ID: {viewingProfile.id}</span>
                                        )}
                                    </h2>
                                    <p className="text-slate-500 font-medium">{viewingProfile.expertise}</p>
                                    <div className="mt-2 flex gap-2">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${viewingProfile.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : viewingProfile.status === 'Pending' ? 'bg-orange-100 text-orange-700' : 'bg-slate-200 text-slate-600'}`}>
                                            Status: {viewingProfile.status}
                                        </span>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600">
                                            {viewingProfile.joined ? `Joined ${viewingProfile.joined}` : `Applied ${viewingProfile.appliedDate}`}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Session Fee (15m)</p>
                                            <p className="text-lg font-extrabold text-slate-900">₹{viewingProfile.feePerMinuteInr ? viewingProfile.feePerMinuteInr * 15 : 0}</p>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Total Sessions Taught</p>
                                            <p className="text-lg font-extrabold text-slate-900">{viewingProfile.sessions ?? 0}</p>
                                        </div>
                                    </div>

                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 mb-2 border-b border-slate-100 pb-2">Professional Headline</h4>
                                    <p className="text-sm text-slate-600 relative pl-4">
                                        <span className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-full"></span>
                                        {viewingProfile.headline || 'Not provided.'}
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 mb-2 border-b border-slate-100 pb-2">About & Bio</h4>
                                    <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                                        {viewingProfile.about || 'Not provided.'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900 mb-2 border-b border-slate-100 pb-2">Experience & Qualifications</h4>
                                        <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                                            {viewingProfile.totalExperience || 'Not provided.'}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900 mb-2 border-b border-slate-100 pb-2">Verified Links</h4>
                                        {viewingProfile.linkedin ? (
                                            <a href={viewingProfile.linkedin} className="text-sm text-blue-600 hover:underline flex items-center gap-1 font-medium" target="_blank" rel="noreferrer">
                                                <ArrowUpRight size={14} /> {viewingProfile.linkedin}
                                            </a>
                                        ) : (
                                            <p className="text-sm text-slate-500">No links provided.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
