'use client';

import React, { useState, useEffect } from 'react';
import { IndianRupee, Clock, Users, ArrowUpRight, Check, X, Calendar, Video, MessageSquare, AlertCircle } from 'lucide-react';
import Image from 'next/image';

const PENDING_REQUESTS = [
    {
        id: 'req1',
        studentName: 'Aman Gupta',
        topic: 'System Design Interview Prep',
        duration: 45,
        price: 900, // 45 * 20
        date: 'Today, 8:00 PM',
        avatar: 'https://ui-avatars.com/api/?name=Aman+Gupta&background=random',
        requestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
    },
    {
        id: 'req2',
        studentName: 'Sneha Reddy',
        topic: 'Resume Review & Career Guidance',
        duration: 30,
        price: 600, // 30 * 20
        date: 'Tomorrow, 10:00 AM',
        avatar: 'https://ui-avatars.com/api/?name=Sneha+Reddy&background=random',
        requestedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString() // 10 hours ago
    },
    {
        id: 'req3',
        studentName: 'Karan Sharma',
        topic: 'Mock Interview (Backend)',
        duration: 60,
        price: 1200,
        date: 'Tomorrow, 2:00 PM',
        avatar: 'https://ui-avatars.com/api/?name=Karan+Sharma&background=random',
        requestedAt: new Date(Date.now() - 13 * 60 * 60 * 1000).toISOString() // 13 hours ago (Will trigger auto-reject)
    }
];

const INITIAL_UPCOMING_SESSIONS = [
    {
        id: 'sess1',
        studentName: 'Rahul Verma',
        topic: 'Mock Interview (Frontend)',
        duration: 60,
        date: 'Today, 5:00 PM',
        avatar: 'https://ui-avatars.com/api/?name=Rahul+Verma&background=random',
        link: 'https://meet.google.com/abc-defg-hij'
    }
];

const INITIAL_HISTORY = [
    {
        id: 'hist1',
        studentName: 'Vivek Singh',
        action: 'Accepted (After 20% Platform Cut)',
        date: 'Yesterday, 2:00 PM',
        amount: 960 // 1200 * 0.8
    },
    {
        id: 'hist2',
        studentName: 'Priya Sharma',
        action: 'Declined (Refunded)',
        date: '2 Days Ago',
        amount: 0 // No earnings
    }
];

const INITIAL_PAYOUTS = [
    {
        id: 'pay1',
        amount: 4500,
        date: 'Oct 24, 2023',
        status: 'Sent by Admin',
        upiRef: 'UPI1234567890',
        mentorConfirmed: false
    },
    {
        id: 'pay2',
        amount: 12450,
        date: 'Oct 15, 2023',
        status: 'Confirmed',
        upiRef: 'UPI0987654321',
        mentorConfirmed: true
    }
];

export default function MentorConsolePage() {
    const [requests, setRequests] = useState(PENDING_REQUESTS);
    const [upcomingSessions, setUpcomingSessions] = useState(INITIAL_UPCOMING_SESSIONS);
    const [history, setHistory] = useState(INITIAL_HISTORY);
    const [payouts, setPayouts] = useState(INITIAL_PAYOUTS);
    const [activeTab, setActiveTab] = useState<'requests' | 'upcoming' | 'history' | 'payouts'>('requests');
    const [walletBalance, setWalletBalance] = useState(12450);

    // Modal State
    const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
    const [meetingLink, setMeetingLink] = useState('');

    // Auto-Reject Logic Effect
    useEffect(() => {
        const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

        setRequests(prevRequests => {
            const now = Date.now();
            let newHistoryLogs: typeof INITIAL_HISTORY = [];

            const validRequests = prevRequests.filter(req => {
                const requestedTime = new Date(req.requestedAt).getTime();
                if (now - requestedTime > TWELVE_HOURS_MS) {
                    newHistoryLogs.push({
                        id: `hist-auto-${Date.now()}-${Math.random()}`,
                        studentName: req.studentName,
                        action: 'Auto-Rejected (Expired)',
                        date: 'Just Now',
                        amount: req.price
                    });
                    return false; // Remove it
                }
                return true;
            });

            if (newHistoryLogs.length > 0) {
                setHistory(prev => [...newHistoryLogs, ...prev]);
                return validRequests;
            }
            return prevRequests;
        });
    }, []);

    const handleAcceptClick = (id: string) => {
        setSelectedRequestId(id);
        setIsAcceptModalOpen(true);
    };

    const confirmAccept = () => {
        if (!selectedRequestId || !meetingLink.trim()) {
            alert("Please provide a valid meeting link.");
            return;
        }

        const requestToAccept = requests.find(r => r.id === selectedRequestId);
        if (requestToAccept) {
            const earningsAfterCut = requestToAccept.price * 0.8;
            setWalletBalance(prev => prev + earningsAfterCut);

            // Move from pending to upcoming
            setUpcomingSessions(prev => [
                {
                    id: `sess-${Date.now()}`,
                    studentName: requestToAccept.studentName,
                    topic: requestToAccept.topic,
                    duration: requestToAccept.duration,
                    date: requestToAccept.date,
                    avatar: requestToAccept.avatar,
                    link: meetingLink
                },
                ...prev
            ]);

            // Log to history
            setHistory(prev => [
                {
                    id: `hist-${Date.now()}`,
                    studentName: requestToAccept.studentName,
                    action: 'Accepted (After 20% Platform Cut)',
                    date: 'Just Now',
                    amount: earningsAfterCut
                },
                ...prev
            ]);

            // Remove from pending
            setRequests(requests.filter(r => r.id !== selectedRequestId));
        }

        setIsAcceptModalOpen(false);
        setMeetingLink('');
        setSelectedRequestId(null);
        alert('Session Accepted! Notification & Link sent to the student.');
    };

    const handleReject = (id: string, price: number, studentName: string) => {
        const cancellationFee = Math.round(price * 0.02); // 2% Razorpay Fee
        setWalletBalance(prev => prev - cancellationFee);

        setRequests(requests.filter(r => r.id !== id));
        setHistory(prev => [
            {
                id: `hist-fee-${Date.now()}`,
                studentName: 'Platform/Payment Gateway Fee',
                action: 'Cancellation Charge (2%)',
                date: 'Just Now',
                amount: -cancellationFee
            },
            {
                id: `hist-${Date.now()}`,
                studentName: studentName,
                action: 'Declined (Refunded)',
                date: 'Just Now',
                amount: price
            },
            ...prev
        ]);
        alert(`Session Declined.\n\nA full refund of ₹${price} has been initiated to the student.\nNote: A basic 2% Razorpay refund processing fee (₹${cancellationFee}) has been deducted from your mentor ledger.`);
    };

    const confirmPayout = (id: string, received: boolean) => {
        setPayouts(payouts.map(p => {
            if (p.id === id) {
                return { ...p, status: received ? 'Confirmed' : 'Disputed', mentorConfirmed: received };
            }
            return p;
        }));
        if (!received) {
            alert('Payout marked as "Not Received". An admin will look into this discrepancy.');
        } else {
            alert('Payout receipt confirmed successfully!');
        }
    };

    const getRemainingHours = (requestedAt: string) => {
        const elapsedMs = Date.now() - new Date(requestedAt).getTime();
        const remainingMs = (12 * 60 * 60 * 1000) - elapsedMs;
        return Math.max(0, Math.floor(remainingMs / (1000 * 60 * 60)));
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-emerald-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg shadow-emerald-900/10">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-800/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <img
                            src="https://ui-avatars.com/api/?name=Mentor&background=10B981&color=fff"
                            alt="Profile"
                            className="w-16 h-16 rounded-full border-2 border-emerald-400/50 shadow-md"
                        />
                        <div>
                            <div className="flex items-center gap-4">
                                <h1 className="text-2xl font-extrabold tracking-tight">Welcome back, Mentor!</h1>
                                <span className="text-xs font-mono bg-emerald-800/80 text-emerald-200 px-2.5 py-1 rounded-md border border-emerald-600/50 shadow-inner tracking-wider">ID: m4892</span>
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
                        <p className="text-2xl font-extrabold text-slate-900 mt-1">48</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Session Minutes</p>
                        <p className="text-2xl font-extrabold text-slate-900 mt-1">1,240</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                        <Calendar size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rating</p>
                        <p className="text-2xl font-extrabold text-slate-900 mt-1">4.9 <span className="text-sm font-medium text-slate-500">/ 5.0</span></p>
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
                                    {requests.map(req => (
                                        <div key={req.id} className="p-6 transition-colors hover:bg-slate-50">
                                            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
                                                <div className="flex items-start gap-4">
                                                    <img src={req.avatar} alt="" className="w-12 h-12 rounded-full border border-slate-200" />
                                                    <div>
                                                        <h3 className="text-sm font-bold text-slate-900">{req.studentName}</h3>
                                                        <p className="text-sm text-slate-700 font-medium mt-1">{req.topic}</p>
                                                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                                                            <span className="flex items-center gap-1"><Clock size={14} /> {req.duration} Mins</span>
                                                            <span className="flex items-center gap-1"><Calendar size={14} /> {req.date}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                                                    <div className="text-right">
                                                        <div className="text-lg font-extrabold text-slate-900">₹ {req.price}</div>
                                                        <div className="flex items-center gap-1 text-[11px] font-bold text-orange-600 mt-1 bg-orange-50 px-2 py-0.5 rounded-md">
                                                            <AlertCircle size={12} />
                                                            Expires in {getRemainingHours(req.requestedAt)}h (Auto-Refund)
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 w-full sm:w-auto mt-2">
                                                        <button
                                                            onClick={() => handleReject(req.id, req.price, req.studentName)}
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
                                    ))}
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
                                    {upcomingSessions.map(session => (
                                        <div key={session.id} className="p-6">
                                            <div className="flex items-center gap-4 mb-4">
                                                <img src={session.avatar} alt="" className="w-10 h-10 rounded-full border border-slate-200" />
                                                <div>
                                                    <h3 className="text-sm font-bold text-slate-900">{session.studentName}</h3>
                                                    <p className="text-xs text-slate-500">{session.date}</p>
                                                </div>
                                            </div>
                                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-4">
                                                <p className="text-sm font-medium text-slate-800 mb-2">{session.topic}</p>
                                                <p className="text-xs text-slate-500 flex items-center gap-1"><Clock size={12} /> {session.duration} Minutes</p>
                                            </div>

                                            <div className="flex bg-blue-50/50 border border-blue-100 rounded-xl p-3 items-center justify-between mb-4">
                                                <div className="text-xs text-blue-800 font-medium truncate max-w-[200px]">{session.link}</div>
                                                <button
                                                    onClick={() => navigator.clipboard.writeText(session.link)}
                                                    className="text-xs font-bold text-blue-600 hover:text-blue-700 shrink-0"
                                                >
                                                    Copy Link
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => window.open(session.link, '_blank')}
                                                className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 transition-colors"
                                            >
                                                Join Meeting Room
                                            </button>
                                        </div>
                                    ))}
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
                                                <h3 className="text-sm font-bold text-slate-900">{item.studentName}</h3>
                                                <p className="text-xs text-slate-500 mt-1">{item.date}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-bold text-slate-900 mb-1">₹ {item.amount}</div>
                                                <span className={`text-[11px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${item.action.includes('Accepted') ? 'bg-emerald-100 text-emerald-700' :
                                                    item.action.includes('Auto-Rejected') ? 'bg-orange-100 text-orange-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                    {item.action}
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
                                                    <h3 className="text-lg font-extrabold text-slate-900">₹ {payment.amount}</h3>
                                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${payment.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' :
                                                        payment.status === 'Disputed' ? 'bg-red-100 text-red-700' :
                                                            'bg-brand-orange/10 text-brand-orange'
                                                        }`}>
                                                        {payment.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-600 font-medium font-mono">Ref: {payment.upiRef}</p>
                                                <p className="text-xs text-slate-500 mt-1">Initiated on {payment.date}</p>
                                            </div>

                                            {!payment.mentorConfirmed && payment.status !== 'Disputed' && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => confirmPayout(payment.id, true)}
                                                        className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-1"
                                                    >
                                                        <Check size={16} /> Received
                                                    </button>
                                                    <button
                                                        onClick={() => confirmPayout(payment.id, false)}
                                                        className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-bold transition-colors flex items-center gap-1"
                                                    >
                                                        <X size={16} /> Not Received
                                                    </button>
                                                </div>
                                            )}
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
