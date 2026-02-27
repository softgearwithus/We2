'use client';

import React, { useState, useEffect } from 'react';
import { IndianRupee, Clock, Users, Check, Calendar, Video, MessageSquare, AlertCircle, X } from 'lucide-react';
import { acceptMentorRequest, declineMentorRequest, fetchMentorPayouts, fetchMentorRequests, fetchMentorSessions, MentorPayout, MentorSession } from '@/app/lib/mentors';
import { useAuth } from '@/app/context/AuthContext';

export default function MentorConsolePage() {
    const [requests, setRequests] = useState<MentorSession[]>([]);
    const [upcomingSessions, setUpcomingSessions] = useState<MentorSession[]>([]);
    const [history, setHistory] = useState<MentorSession[]>([]);
    const [allSessions, setAllSessions] = useState<MentorSession[]>([]);
    const [payouts, setPayouts] = useState<MentorPayout[]>([]);
    const [activeTab, setActiveTab] = useState<'requests' | 'upcoming' | 'history' | 'payouts'>('requests');
    const [walletBalance, setWalletBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    // Modal State
    const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
    const [meetingLink, setMeetingLink] = useState('');

    const mentorDisplayName = (() => {
        if (!user) return 'Mentor';
        const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
        if (fullName) return fullName;
        if (user.email) return user.email.split('@')[0];
        return 'Mentor';
    })();

    const mentorIdLabel = user?.id ? user.id.slice(0, 8) : null;

    const formatSessionDate = (session: MentorSession) => {
        const timestamp = session.scheduledAt || session.createdAt;
        if (!timestamp) return 'Scheduled';
        const parsed = new Date(timestamp);
        if (Number.isNaN(parsed.getTime())) return 'Scheduled';
        return parsed.toLocaleString();
    };

    // Load mentor console data
    useEffect(() => {
        const loadMentorConsole = async () => {
            if (!user || user.role !== 'mentor') {
                setLoading(false);
                return;
            }
            try {
                const token = localStorage.getItem('accessToken') || '';
                const [reqData, sessionData, payoutData] = await Promise.all([
                    fetchMentorRequests(token),
                    fetchMentorSessions(token),
                    fetchMentorPayouts(token),
                ]);
                const sessionList = sessionData || [];
                setRequests(reqData || []);
                setAllSessions(sessionList);
                setUpcomingSessions(sessionList.filter((s: any) => s.status === 'accepted'));
                setHistory(sessionList.filter((s: any) => s.status !== 'accepted' && s.status !== 'requested'));
                setPayouts(payoutData || []);
                const total = (payoutData || []).reduce((sum: number, p: MentorPayout) => sum + (p.amountInr || 0), 0);
                setWalletBalance(total);
            } catch (err: any) {
                setError('Mentor console data unavailable.');
            } finally {
                setLoading(false);
            }
        };
        loadMentorConsole();
    }, [user]);

    const handleAcceptClick = (id: string) => {
        setSelectedRequestId(id);
        setIsAcceptModalOpen(true);
    };

    const confirmAccept = async () => {
        if (!selectedRequestId || !meetingLink.trim()) {
            alert("Please provide a valid meeting link.");
            return;
        }
        const token = localStorage.getItem('accessToken') || '';
        const updatedSession = await acceptMentorRequest(token, selectedRequestId, meetingLink);
        setRequests(requests.filter(r => r.id !== selectedRequestId));
        setUpcomingSessions((prev) => [updatedSession, ...prev]);
        setAllSessions((prev) => [updatedSession, ...prev]);
        setIsAcceptModalOpen(false);
        setMeetingLink('');
        setSelectedRequestId(null);
        alert('Session Accepted! Notification & Link sent to the student.');
    };

    const handleReject = async (id: string) => {
        const token = localStorage.getItem('accessToken') || '';
        const updatedSession = await declineMentorRequest(token, id);
        setRequests(requests.filter(r => r.id !== id));
        setHistory((prev) => [updatedSession, ...prev]);
        setAllSessions((prev) => [updatedSession, ...prev]);
        alert('Session Declined. The student will be notified by admin.');
    };

    const getRemainingHours = (requestedAt?: string | null) => {
        if (!requestedAt) return null;
        const requestedTime = new Date(requestedAt).getTime();
        if (Number.isNaN(requestedTime)) return null;
        const elapsedMs = Date.now() - requestedTime;
        const remainingMs = (12 * 60 * 60 * 1000) - elapsedMs;
        return Math.max(0, Math.floor(remainingMs / (1000 * 60 * 60)));
    };

    const totalStudents = Array.from(new Set(allSessions.map((s) => s.studentId).filter(Boolean))).length;
    const totalMinutes = allSessions
        .filter((s) => s.status === 'accepted' || s.status === 'completed')
        .reduce((sum, s) => sum + (s.durationMinutes || 0), 0);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
                <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Mentor console unavailable</h2>
                <p className="text-slate-500">Please check back later.</p>
            </div>
        );
    }

    if (user?.role !== 'mentor') {
        return (
            <div className="max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                    <Users size={40} className="text-emerald-700" />
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 mb-4">You are not a registered Mentor</h2>
                <p className="text-slate-500 max-w-lg mb-8">This portal is exclusively for verified Mentors to manage their 1:1 sessions, action requests, and track payouts.</p>
                <a href="/mentor/apply" className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20 transition-all font-sans">
                    Apply to Become a Mentor
                </a>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-emerald-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg shadow-emerald-900/10">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-800/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(mentorDisplayName)}&background=10B981&color=fff`}
                            alt="Profile"
                            className="w-16 h-16 rounded-full border-2 border-emerald-400/50 shadow-md"
                        />
                        <div>
                            <div className="flex items-center gap-4">
                                <h1 className="text-2xl font-extrabold tracking-tight">Welcome back, {mentorDisplayName}!</h1>
                                {mentorIdLabel && (
                                    <span className="text-xs font-mono bg-emerald-800/80 text-emerald-200 px-2.5 py-1 rounded-md border border-emerald-600/50 shadow-inner tracking-wider">ID: {mentorIdLabel}</span>
                                )}
                            </div>
                            <p className="text-emerald-100 font-medium mt-1">Ready to guide the next generation of engineers?</p>
                        </div>
                    </div>
                    <div className="flex bg-emerald-800/50 rounded-xl p-4 gap-6 border border-emerald-700/50 min-w-[200px] justify-between">
                        <div>
                            <p className="text-xs text-emerald-200 uppercase tracking-widest font-bold mb-1">Total Earnings</p>
                            <p className="text-2xl font-extrabold flex items-center gap-2">
                                <span className={walletBalance < 0 ? 'text-red-400' : 'text-white'}>
                                    {walletBalance < 0 ? '-' : ''}₹ {Math.abs(walletBalance).toLocaleString()}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Students Taught</p>
                        <p className="text-2xl font-extrabold text-slate-900 mt-1">{totalStudents}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Session Minutes</p>
                        <p className="text-2xl font-extrabold text-slate-900 mt-1">{totalMinutes.toLocaleString()}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                        <Calendar size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rating</p>
                        <p className="text-2xl font-extrabold text-slate-900 mt-1">— <span className="text-sm font-medium text-slate-500">/ 5.0</span></p>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2">
                {[
                    { id: 'requests', label: `Pending Requests (${requests.length})` },
                    { id: 'upcoming', label: `Upcoming Sessions (${upcomingSessions.length})` },
                    { id: 'history', label: 'Action History' },
                    { id: 'payouts', label: 'Payouts & Earnings' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${activeTab === tab.id
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                {/* Tab: Pending Requests */}
                {activeTab === 'requests' && (
                    <div>
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <MessageSquare size={18} className="text-emerald-600" />
                                Action Required: New Requests
                            </h2>
                        </div>

                        <div className="p-0">
                            {requests.length === 0 ? (
                                <div className="p-8 text-center text-slate-500">
                                    No pending requests at the moment.
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {requests.map(req => {
                                        const studentName = req.studentName || 'Student';
                                        const remainingHours = getRemainingHours(req.requestedAt || req.createdAt);
                                        return (
                                            <div key={req.id} className="p-6 transition-colors hover:bg-slate-50">
                                                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
                                                    <div className="flex items-start gap-4">
                                                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}`} alt="" className="w-12 h-12 rounded-full border border-slate-200" />
                                                        <div>
                                                            <h3 className="text-sm font-bold text-slate-900">{studentName}</h3>
                                                            <p className="text-sm text-slate-700 font-medium mt-1">{req.topic}</p>
                                                            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                                                                <span className="flex items-center gap-1"><Clock size={14} /> {req.durationMinutes} Mins</span>
                                                                <span className="flex items-center gap-1"><Calendar size={14} /> {formatSessionDate(req)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                                                        <div className="text-right">
                                                            <div className="text-lg font-extrabold text-slate-900">₹ {req.priceInr}</div>
                                                            <div className="flex items-center gap-1 text-[11px] font-bold text-orange-600 mt-1 bg-orange-50 px-2 py-0.5 rounded-md">
                                                                <AlertCircle size={12} />
                                                                {remainingHours === null ? 'Expiry pending' : `Expires in ${remainingHours}h (Auto-Refund)`}
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2 w-full sm:w-auto mt-2">
                                                            <button
                                                                onClick={() => handleReject(req.id)}
                                                                className="flex-1 sm:flex-none px-4 py-2 border border-red-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-1"
                                                            >
                                                                <X size={16} /> Decline
                                                            </button>
                                                            <button
                                                                onClick={() => handleAcceptClick(req.id)}
                                                                className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-600/20 flex items-center justify-center gap-1"
                                                            >
                                                                <Check size={16} /> Accept
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Tab: Upcoming Sessions */}
                {activeTab === 'upcoming' && (
                    <div>
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Video size={18} className="text-emerald-600" />
                                Upcoming Sessions
                            </h2>
                        </div>

                        <div className="p-0">
                            {upcomingSessions.length === 0 ? (
                                <div className="p-8 text-center text-slate-500">
                                    No upcoming sessions.
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {upcomingSessions.map(session => {
                                        const studentName = session.studentName || 'Student';
                                        return (
                                            <div key={session.id} className="p-6">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}`} alt="" className="w-10 h-10 rounded-full border border-slate-200" />
                                                    <div>
                                                        <h3 className="text-sm font-bold text-slate-900">{studentName}</h3>
                                                        <p className="text-xs text-slate-500">{formatSessionDate(session)}</p>
                                                    </div>
                                                </div>
                                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-4">
                                                    <p className="text-sm font-medium text-slate-800 mb-2">{session.topic}</p>
                                                    <p className="text-xs text-slate-500 flex items-center gap-1"><Clock size={12} /> {session.durationMinutes} Minutes</p>
                                                </div>

                                                {session.meetingLink ? (
                                                    <div className="flex bg-blue-50/50 border border-blue-100 rounded-xl p-3 items-center justify-between mb-4">
                                                        <div className="text-xs text-blue-800 font-medium truncate max-w-[200px]">{session.meetingLink}</div>
                                                        <button
                                                            onClick={() => navigator.clipboard.writeText(session.meetingLink || '')}
                                                            className="text-xs font-bold text-blue-600 hover:text-blue-700 shrink-0"
                                                        >
                                                            Copy Link
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex bg-amber-50 border border-amber-100 rounded-xl p-3 items-center justify-between mb-4">
                                                        <div className="text-xs text-amber-700 font-medium">Meeting link pending</div>
                                                    </div>
                                                )}

                                                <button
                                                    onClick={() => session.meetingLink && window.open(session.meetingLink, '_blank')}
                                                    className={`w-full py-2.5 rounded-xl text-sm font-bold shadow-md transition-colors ${session.meetingLink ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-200 text-slate-500 cursor-not-allowed'}`}
                                                >
                                                    {session.meetingLink ? 'Join Meeting Room' : 'Link Pending'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Tab: Action History */}
                {activeTab === 'history' && (
                    <div>
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Clock size={18} className="text-emerald-600" />
                                Session Action History
                            </h2>
                        </div>
                        <div className="p-0">
                            {history.length === 0 ? (
                                <div className="p-8 text-center text-slate-500">No history found.</div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {history.map(item => (
                                        <div key={item.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-900">Session {item.topic}</h3>
                                                <p className="text-xs text-slate-500 mt-1">{formatSessionDate(item)}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-bold text-slate-900 mb-1">₹ {item.priceInr}</div>
                                                <span className={`text-[11px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${item.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                                    item.status === 'declined' ? 'bg-red-100 text-red-700' :
                                                        'bg-orange-100 text-orange-700'
                                                    }`}>
                                                    {item.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Tab: Payouts */}
                {activeTab === 'payouts' && (
                    <div>
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <IndianRupee size={18} className="text-emerald-600" />
                                Admin Payouts
                            </h2>
                        </div>
                        <div className="p-0">
                            {payouts.length === 0 ? (
                                <div className="p-8 text-center text-slate-500">No payout records found.</div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {payouts.map(payment => (
                                        <div key={payment.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="text-lg font-extrabold text-slate-900">₹ {payment.amountInr}</h3>
                                                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                                                        Paid
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-600 font-medium font-mono">Ref: {payment.referenceId || 'N/A'}</p>
                                                <p className="text-xs text-slate-500 mt-1">Initiated on {payment.paidAt || payment.createdAt}</p>
                                            </div>
                                            <div className="text-xs text-slate-500 font-medium">
                                                Contact admin if there is any discrepancy.
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Accept Request Modal */}
            {isAcceptModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm cursor-pointer transition-opacity"
                        onClick={() => setIsAcceptModalOpen(false)}
                    ></div>

                    {/* Modal Content */}
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 transform transition-all p-8">
                        <button
                            onClick={() => setIsAcceptModalOpen(false)}
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors z-10"
                        >
                            ✕
                        </button>

                        <h3 className="text-xl font-extrabold text-slate-900 mb-2 flex items-center gap-2">
                            <Video className="text-emerald-600" size={24} />
                            Provide Meeting Link
                        </h3>
                        <p className="text-sm text-slate-500 mb-6">Enter a Google Meet or Zoom link for this session. We will share this securely with the student.</p>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">Meeting Link (GMeet / Zoom)</label>
                                <input
                                    type="url"
                                    value={meetingLink}
                                    onChange={(e) => setMeetingLink(e.target.value)}
                                    placeholder="https://meet.google.com/..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                />
                            </div>

                            <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-3 flex gap-2 items-start mt-2">
                                <Check className="text-brand-orange shrink-0 mt-0.5" size={14} />
                                <p className="text-xs text-slate-600">By accepting, you commit to being available at the requested time. The link will be sent to the student immediately.</p>
                            </div>

                            <button
                                onClick={confirmAccept}
                                className="w-full mt-4 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20 transition-all font-sans"
                            >
                                Confirm & Accept Session
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
