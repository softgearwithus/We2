'use client';

import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Star, Briefcase, Calendar, Clock } from 'lucide-react';
import { createMentorPaymentOrder, fetchMentors, fetchStudentMentorSessions, verifyMentorPayment, MentorProfile, MentorSession } from '@/app/lib/mentors';

export default function MentorsDiscoveryPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedBios, setExpandedBios] = useState<Record<string, boolean>>({});
    const [mentors, setMentors] = useState<MentorProfile[]>([]);
    const [sessions, setSessions] = useState<MentorSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal States
    const [activeModal, setActiveModal] = useState<'none' | 'connect' | 'success' | 'filter'>('none');
    const [selectedMentor, setSelectedMentor] = useState<MentorProfile | null>(null);
    const [selectedDuration, setSelectedDuration] = useState(15);
    const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);

    // Load Razorpay SDK
    useEffect(() => {
        const loadRazorpay = () => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            script.onload = () => setIsRazorpayLoaded(true);
            document.body.appendChild(script);
        };
        loadRazorpay();
    }, []);

    useEffect(() => {
        const loadMentors = async () => {
            try {
                const { getActiveToken } = await import('@/app/lib/auth-storage');
                const token = getActiveToken() || '';
                const data = await fetchMentors(token);
                setMentors(data || []);
                const sessionData = await fetchStudentMentorSessions(token);
                setSessions(sessionData || []);
            } catch (err: any) {
                setError('No mentors available yet.');
            } finally {
                setLoading(false);
            }
        };
        loadMentors();
    }, []);

    // Derived State
    const filteredMentors = mentors.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.companies || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.headline || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatSessionDate = (session: MentorSession) => {
        const timestamp = session.scheduledAt || session.createdAt;
        if (!timestamp) return 'Scheduled';
        const parsed = new Date(timestamp);
        if (Number.isNaN(parsed.getTime())) return 'Scheduled';
        return parsed.toLocaleString();
    };

    const toggleBio = (id: string) => {
        setExpandedBios(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const openConnect = (mentor: MentorProfile) => {
        setSelectedMentor(mentor);
        setSelectedDuration(15); // Reset
        setActiveModal('connect');
    };

    const handleRazorpayPayment = async () => {
        if (!selectedMentor) {
            alert('Please select a mentor first.');
            return;
        }

        if (!isRazorpayLoaded) {
            alert('Payment system is loading. Please try again.');
            return;
        }

        if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
            alert('Payment is unavailable right now. Please try again later.');
            return;
        }

        const { getActiveToken } = await import('@/app/lib/auth-storage');
        const token = getActiveToken() || '';
        const order = await createMentorPaymentOrder(token, {
            mentorId: selectedMentor!.id,
            durationMinutes: selectedDuration,
        });

        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: order.amountInr * 100,
            currency: 'INR',
            name: 'EMBLE',
            description: `1:1 Session with ${selectedMentor!.name}`,
            image: '/logo.png', // Update with actual logo if available
            order_id: order.orderId,
            handler: function (response: any) {
                verifyMentorPayment(token, {
                    mentorId: selectedMentor!.id,
                    paymentId: response.razorpay_payment_id,
                    orderId: response.razorpay_order_id || order.orderId,
                    signature: response.razorpay_signature || '',
                    topic: `Session with ${selectedMentor!.name}`,
                    durationMinutes: selectedDuration,
                }).then(() => {
                    setActiveModal('success');
                }).catch(() => {
                    alert('Payment verified but session could not be created.');
                });
            },
            prefill: {
                name: 'Student Name',
                email: 'student@example.com',
                contact: '9999999999'
            },
            theme: {
                color: '#059669' // Emerald 600
            }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
            alert('Payment Failed! Reason: ' + response.error.description);
        });
        rzp.open();
    };


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
                <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Mentors not available</h2>
                <p className="text-slate-500">Please check back later.</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">

            {/* Top Bar: Search and Filter */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
                <button
                    onClick={() => setActiveModal('filter')}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 sm:py-2.5 bg-white border border-emerald-600 rounded-full text-sm font-bold text-emerald-700 hover:bg-emerald-50 transition-colors shadow-sm"
                >
                    <SlidersHorizontal size={16} />
                    Sort & Filter
                </button>
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search mentors by name, company, or role..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 sm:py-2.5 bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm transition-all"
                    />
                </div>
            </div>

            {/* Student's Booked Sessions */}
            {sessions.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Calendar size={18} className="text-emerald-600" />
                        Your Booked Sessions
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sessions.map((session: MentorSession) => (
                            <div key={session.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-start gap-4">
                                <img loading="lazy" decoding="async" src={session.avatarUrl || 'https://ui-avatars.com/api/?name=Mentor'} alt="" className="w-12 h-12 rounded-full border border-slate-100 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-bold text-slate-900">{session.mentorName || 'Mentor'}</h3>
                                    <p className="text-xs text-slate-500 truncate">{session.topic}</p>
                                    <div className="flex items-center gap-3 mt-2 text-xs font-medium text-slate-600">
                                        <span className="flex items-center gap-1"><Clock size={12} /> {session.durationMinutes}m</span>
                                        <span className="flex items-center gap-1"><Calendar size={12} /> {formatSessionDate(session)}</span>
                                    </div>
                                    <div className="mt-3">
                                        {session.status === 'accepted' && session.meetingLink ? (
                                            <button
                                                onClick={() =>
                                                    window.open(
                                                        session.meetingLink!,
                                                        '_blank',
                                                        'noopener,noreferrer',
                                                    )
                                                }
                                                className="w-full py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
                                            >
                                                Join Meeting
                                            </button>
                                        ) : session.status === 'accepted' ? (
                                            <div className="w-full py-2 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 text-center flex items-center justify-center gap-1">
                                                <Clock size={12} /> Meeting link pending
                                            </div>
                                        ) : session.status === 'declined' ? (
                                            <div className="w-full py-2 bg-red-50 text-red-700 text-xs font-bold rounded-lg border border-red-200 text-center flex items-center justify-center gap-1">
                                                <Clock size={12} /> Declined by mentor
                                            </div>
                                        ) : session.status === 'completed' ? (
                                            <div className="w-full py-2 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200 text-center flex items-center justify-center gap-1">
                                                <Clock size={12} /> Session completed
                                            </div>
                                        ) : (
                                            <div className="w-full py-2 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg border border-amber-200 text-center flex items-center justify-center gap-1">
                                                <Clock size={12} /> Awaiting Mentor Confirmation
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* Left Column: Mentor List */}
                <div className="lg:col-span-8 space-y-6">
                    {filteredMentors.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 border border-slate-200 shadow-sm text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="text-slate-400" size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">No mentors found</h3>
                            <p className="text-slate-500 max-w-sm mx-auto">Try adjusting your search query or filters to find what you're looking for.</p>
                            <button
                                onClick={() => setSearchQuery('')}
                                className="mt-6 px-6 py-2 bg-emerald-50 text-emerald-700 font-bold rounded-full hover:bg-emerald-100 transition-colors"
                            >
                                Clear Search
                            </button>
                        </div>
                    ) : (
                        filteredMentors.map((mentor) => (
                            <div key={mentor.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">

                                {/* Avatar & Online Badge */}
                                <div className="shrink-0 flex flex-col items-center">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-full border-4 border-emerald-600 overflow-hidden shadow-sm">
                                            <img loading="lazy" decoding="async" src={mentor.avatarUrl ?? undefined} alt={mentor.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full border-2 border-white uppercase tracking-wider shadow-sm">
                                            Mentor
                                        </div>
                                    </div>
                                </div>

                                {/* Details Segment */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 h-full">

                                        {/* Info Info */}
                                        <div className="flex-1">
                                            <h3 className="text-xl font-extrabold text-slate-900 truncate mb-1">{mentor.name}</h3>
                                            <p className="text-sm text-slate-700 font-medium mb-1 truncate">{mentor.headline}</p>
                                            <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                                                <span className="font-bold text-emerald-700">Company:</span> {mentor.companies || '—'}
                                            </p>
                                            <p className="text-xs text-slate-500 mb-4 flex items-center gap-1">
                                                <Briefcase size={12} className="text-slate-400" />
                                                {mentor.experience || 'Experience details'}
                                            </p>

                                            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                                                <span className={expandedBios[mentor.id] ? "" : "line-clamp-2"}>
                                                    {mentor.about}
                                                </span>
                                                <button
                                                    onClick={() => toggleBio(mentor.id)}
                                                    className="text-emerald-600 font-medium ml-1 hover:underline mt-1"
                                                >
                                                    {expandedBios[mentor.id] ? "Read less" : "Read more"}
                                                </button>
                                            </p>

                                            {mentor.tags && mentor.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {mentor.tags.map(tag => (
                                                        <span
                                                            key={tag}
                                                            className="px-4 py-1.5 rounded-full border border-slate-200 text-xs font-medium text-slate-600 bg-white"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Box */}
                                        <div className="shrink-0 w-full md:w-auto flex flex-col items-center justify-between h-full bg-slate-50/50 rounded-xl border border-slate-100 p-4 min-w-[160px]">

                                            <div className="flex items-center justify-between w-full mb-6">
                                                <div className="flex flex-col items-center flex-1 border-r border-slate-200 pr-2">
                                                    {mentor.rating ? (
                                                        <>
                                                            <div className="flex items-center gap-1">
                                                                <span className="font-extrabold text-slate-900">{mentor.rating}</span>
                                                                <Star size={14} className="fill-brand-orange text-brand-orange" />
                                                            </div>
                                                            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{mentor.sessionsCount} Sessions</span>
                                                        </>
                                                    ) : (
                                                        <div className="flex flex-col items-center h-full justify-center">
                                                            <span className="font-extrabold text-slate-900">-</span>
                                                            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Session</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-center flex-1 pl-2">
                                                    <span className="font-extrabold text-slate-900">₹ {mentor.pricePerMinute}</span>
                                                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Per Min</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2 w-full mt-auto">
                                                <button
                                                    onClick={() => openConnect(mentor)}
                                                    className="w-full px-4 py-2 rounded-full bg-emerald-700 text-white font-bold text-sm hover:bg-emerald-800 transition-colors shadow-sm shadow-emerald-700/20 text-center"
                                                >
                                                    Connect
                                                </button>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="lg:col-span-4 space-y-6"></div>
            </div>

            {/* Overlays / Modals */}
            {
                activeModal !== 'none' && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm cursor-pointer"
                            onClick={() => setActiveModal('none')}
                        ></div>

                        {/* Modal Content - Removed motion for performance */}
                        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 transform transition-all">
                            {/* Close Button X */}
                            <button
                                onClick={() => setActiveModal('none')}
                                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors z-10"
                            >
                                ✕
                            </button>

                            {/* Modal Body: Connect */}
                            {activeModal === 'connect' && selectedMentor && (
                                <div className="p-8">
                                    <div className="flex flex-col items-center text-center mb-6">
                                        <img loading="lazy" decoding="async" src={selectedMentor.avatarUrl ?? undefined} alt="" className="w-20 h-20 rounded-full border-4 border-emerald-50 shadow-md mb-4" />
                                        <h3 className="text-xl font-extrabold text-slate-900">Book 1:1 with {selectedMentor.name.split(' ')[0]}</h3>
                                        <p className="text-sm text-slate-500 mt-1">₹ {selectedMentor.pricePerMinute} / Min • Voice & Video</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">Duration</label>
                                            <select
                                                value={selectedDuration}
                                                onChange={(e) => setSelectedDuration(Number(e.target.value))}
                                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                            >
                                            <option value={15}>15 Minutes (₹ {selectedMentor.pricePerMinute * 15})</option>
                                            <option value={30}>30 Minutes (₹ {selectedMentor.pricePerMinute * 30})</option>
                                            <option value={60}>60 Minutes (₹ {selectedMentor.pricePerMinute * 60})</option>
                                        </select>
                                    </div>

                                    <button
                                        onClick={handleRazorpayPayment}
                                        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20 transition-all font-sans flex items-center justify-center gap-2"
                                    >
                                        Pay ₹{selectedMentor.pricePerMinute * selectedDuration}
                                    </button>
                                    </div>
                                </div>
                            )}


                            {/* Modal Body: Filter */}
                            {activeModal === 'filter' && (
                                <div className="p-8">
                                    <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                                        <SlidersHorizontal size={20} className="text-emerald-600" />
                                        Sort & Filter Mentors
                                    </h3>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-3">Sort By</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button className="px-4 py-2 border border-emerald-600 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold">Recommended</button>
                                                <button className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-bold transition-colors">Price: Low to High</button>
                                                <button className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-bold transition-colors">Rating: High to Low</button>
                                                <button className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-bold transition-colors">Sessions Taught</button>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            <label className="text-sm font-bold text-slate-900 flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" defaultChecked />
                                                Active / Online Now
                                            </label>
                                        </div>

                                        <button
                                            onClick={() => setActiveModal('none')}
                                            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-md transition-all font-sans"
                                        >
                                            Apply Filters
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Modal Body: Success Flow */}
                            {activeModal === 'success' && selectedMentor && (
                                <div className="p-10 text-center">
                                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                                            ✓
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Payment Successful!</h3>
                                    <p className="text-slate-500 text-sm mb-8">
                                        We've sent your 1:1 request to <span className="font-bold text-slate-700">{selectedMentor.name}</span> for a {selectedDuration} minute session. You will be notified once they accept!
                                    </p>
                                    <button
                                        onClick={() => setActiveModal('none')}
                                        className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-md transition-all font-sans"
                                    >
                                        Done
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }
        </div>
    );
}
