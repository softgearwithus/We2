'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Building2, Plus, Mail, Loader2, CheckCircle2, X, Phone, Clock, XCircle, Inbox, LogOut, Briefcase, MapPin, Calendar, AlertCircle, Eye, FileText, UserPlus, IndianRupee, Tag } from 'lucide-react';
import { useForm } from 'react-hook-form';

export default function CompaniesPage() {
    const { token } = useAuth();

    // Tabs state
    const [activeTab, setActiveTab] = useState<'partners' | 'leads' | 'campaigns'>('partners');

    // Partners state
    const [companies, setCompanies] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Leads state
    const [leads, setLeads] = useState<any[]>([]);
    const [isLeadsLoading, setIsLeadsLoading] = useState(true);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeLeadId, setActiveLeadId] = useState<string | null>(null);

    // Campaigns state
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [isCampaignsLoading, setIsCampaignsLoading] = useState(true);
    const [selectedDrive, setSelectedDrive] = useState<any | null>(null);
    const [viewDrive, setViewDrive] = useState<any | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isActionLoading, setIsActionLoading] = useState(false);

    const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm();

    const fetchCompanies = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users?role=company_admin`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setCompanies(data);
            }
        } catch (error) {
            console.error("Failed to fetch companies", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchLeads = async () => {
        setIsLeadsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/company-leads`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setLeads(data);
            }
        } catch (error) {
            console.error("Failed to fetch leads", error);
        } finally {
            setIsLeadsLoading(false);
        }
    };

    const fetchCampaigns = async () => {
        setIsCampaignsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/placements`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setCampaigns(data);
            }
        } catch (error) {
            console.error("Failed to fetch campaigns", error);
        } finally {
            setIsCampaignsLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchCompanies();
            fetchLeads();
            fetchCampaigns();
        }
    }, [token]);

    const handleProvisionClick = (lead?: any) => {
        reset();
        if (lead) {
            setActiveLeadId(lead.id);
            setValue('firstName', lead.companyName);
            setValue('email', lead.email);
        } else {
            setActiveLeadId(null);
        }
        setIsAddModalOpen(true);
    };

    const handleRejectLead = async (leadId: string) => {
        if (!confirm('Are you sure you want to reject this request?')) return;
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/company-leads/${leadId}/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'rejected' })
            });
            fetchLeads();
        } catch (error) {
            console.error(error);
        }
    };

    const handleImpersonate = async (companyId: string) => {
        if (!confirm('You are about to securely hijack this account session. Continue?')) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/impersonate/${companyId}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                const { storeAuthSession } = await import('@/app/lib/auth-storage');
                storeAuthSession('user', data.accessToken, data.user?.id, false);
                window.location.href = '/industry/dashboard';
            } else {
                const errData = await res.json();
                alert(errData.message || 'Failed to impersonate account.');
            }
        } catch (error) {
            console.error(error);
            alert("Network error.");
        }
    };

    const handleVerifyCampaign = async (id: string, status: 'approved' | 'rejected') => {
        if (status === 'rejected' && !rejectionReason.trim()) {
            alert("A rejection reason is required.");
            return;
        }

        setIsActionLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/placements/${id}/verify`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    verificationStatus: status,
                    rejectionReason: status === 'rejected' ? rejectionReason : null
                })
            });

            if (res.ok) {
                setSelectedDrive(null);
                setRejectionReason('');
                fetchCampaigns();
            } else {
                alert("Failed to update status.");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsActionLoading(false);
        }
    };

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            // 1. Create the Company Admin User
            const payload = {
                firstName: data.firstName,
                email: data.email,
                password: data.password,
                role: 'company_admin'
            };

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}` // Though public, can pass it
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                // 2. If provisioned from a Lead, update the Lead status to 'provisioned'
                if (activeLeadId) {
                    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/company-leads/${activeLeadId}/status`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({ status: 'provisioned' })
                    });
                }

                setIsAddModalOpen(false);
                reset();
                setActiveLeadId(null);
                fetchCompanies();
                fetchLeads();
            } else {
                const errData = await res.json();
                alert(errData.message || 'Failed to create company partner');
            }
        } catch (error) {
            console.error(error);
            alert("Network error.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Partner Companies</h1>
                    <p className="text-sm text-slate-500">Manage corporate employers who can post Placement Drives.</p>
                </div>
                <button
                    onClick={() => handleProvisionClick()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm border border-blue-700 shadow-sm"
                >
                    <Plus size={16} />
                    Onboard Partner Manually
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('partners')}
                    className={`pb-3 px-1 text-sm font-bold border-b-2 transition-colors ${activeTab === 'partners' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                    <div className="flex items-center gap-2">
                        <Building2 size={16} /> Active Partners ({companies.length})
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('leads')}
                    className={`pb-3 px-1 text-sm font-bold border-b-2 transition-colors ${activeTab === 'leads' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                    <div className="flex items-center gap-2">
                        <Inbox size={16} /> Inbound Requests
                        {leads.filter(l => l.status === 'pending').length > 0 && (
                            <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full ml-1">
                                {leads.filter(l => l.status === 'pending').length} New
                            </span>
                        )}
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('campaigns')}
                    className={`pb-3 px-1 text-sm font-bold border-b-2 transition-colors ${activeTab === 'campaigns' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                    <div className="flex items-center gap-2">
                        <Briefcase size={16} /> Campaign Moderation
                        {campaigns.filter(c => (c.verificationStatus || 'pending') === 'pending').length > 0 && (
                            <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full ml-1 font-bold">
                                {campaigns.filter(c => (c.verificationStatus || 'pending') === 'pending').length} Action Required
                            </span>
                        )}
                    </div>
                </button>
            </div>

            {/* Content Area */}
            {activeTab === 'partners' ? (
                /* Data Table: Partners */
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Company</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">HR Access</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Joined</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-slate-500">
                                            <Loader2 size={24} className="animate-spin mx-auto text-blue-500" />
                                        </td>
                                    </tr>
                                ) : companies.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-12 text-center">
                                            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
                                                <Building2 size={24} className="text-slate-400" />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 mb-1">No Companies Registered</h3>
                                            <p className="text-slate-500 text-sm max-w-sm mx-auto">
                                                There are currently no corporate partners. Click 'Onboard Partner' to provision access for an employer.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    companies.map(company => (
                                        <tr key={company.id} className="hover:bg-slate-50 transition">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                                                        {company.firstName?.[0] || 'C'}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900">{company.firstName || 'Unnamed Company'}</p>
                                                        <p className="text-xs text-slate-500 flex items-center gap-1">
                                                            <Building2 size={12} /> Partner Verified
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                    <Mail size={14} className="text-slate-400" />
                                                    {company.email}
                                                </p>
                                            </td>
                                            <td className="p-4">
                                                {company.isActive ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        <CheckCircle2 size={12} /> Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                                        Suspended
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <p className="text-sm text-slate-600">
                                                    {new Date(company.createdAt).toLocaleDateString()}
                                                </p>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleImpersonate(company.id)}
                                                        className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition flex items-center justify-center gap-1.5"
                                                    >
                                                        <LogOut size={14} className="rotate-180" /> Impersonate
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : activeTab === 'leads' ? (
                /* Data Table: Leads */
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Company / Rep</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date Requested</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {isLeadsLoading ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-slate-500">
                                            <Loader2 size={24} className="animate-spin mx-auto text-blue-500" />
                                        </td>
                                    </tr>
                                ) : leads.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center">
                                            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
                                                <Inbox size={24} className="text-slate-400" />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 mb-1">No Inbound Requests</h3>
                                            <p className="text-slate-500 text-sm max-w-sm mx-auto">
                                                When companies submit the public Partner Application form, they will appear here.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    leads.map(lead => (
                                        <tr key={lead.id} className="hover:bg-slate-50 transition">
                                            <td className="p-4">
                                                <div>
                                                    <p className="font-bold text-slate-900">{lead.companyName}</p>
                                                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                        {lead.name}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                        <Mail size={14} className="text-slate-400" />
                                                        {lead.email}
                                                    </p>
                                                    {lead.phone && (
                                                        <p className="text-xs text-slate-500 flex items-center gap-2">
                                                            <Phone size={14} className="text-slate-400" />
                                                            {lead.phone}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {lead.status === 'pending' && (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                                        <Clock size={12} /> Pending Review
                                                    </span>
                                                )}
                                                {lead.status === 'provisioned' && (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        <CheckCircle2 size={12} /> Provisioned
                                                    </span>
                                                )}
                                                {lead.status === 'rejected' && (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                                                        <XCircle size={12} /> Rejected
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <p className="text-sm text-slate-600">
                                                    {new Date(lead.createdAt).toLocaleDateString()}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    {new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </td>
                                            <td className="p-4 text-right">
                                                {lead.status === 'pending' && (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleRejectLead(lead.id)}
                                                            className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-red-600 transition"
                                                        >
                                                            Reject
                                                        </button>
                                                        <button
                                                            onClick={() => handleProvisionClick(lead)}
                                                            className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                                                        >
                                                            Provision Target
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : activeTab === 'campaigns' ? (
                /* Data Table: Campaigns */
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Drive Details</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Company</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Posted</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {isCampaignsLoading ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-slate-500">
                                            <Loader2 size={24} className="animate-spin mx-auto text-indigo-500" />
                                        </td>
                                    </tr>
                                ) : campaigns.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center text-slate-500">
                                            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
                                                <Briefcase size={24} className="text-slate-400" />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 mb-1">No Campaigns Listed</h3>
                                            <p className="text-slate-500 text-sm max-w-sm mx-auto">
                                                When partners post hiring drives, they will appear here for review.
                                            </p>
                                        </td>
                                    </tr>
                                ) : campaigns.map(drive => (
                                    <tr key={drive.id} className="hover:bg-slate-50 transition">
                                        <td className="p-4 w-1/3">
                                            <div className="font-bold text-slate-900 line-clamp-1">{drive.title}</div>
                                            <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                                                <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200">{drive.type}</span>
                                                {drive.location && <span><MapPin size={10} className="inline mr-0.5" />{drive.location}</span>}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                                <Building2 size={16} className="text-slate-400" />
                                                {drive.companyName}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {(drive.verificationStatus || 'pending') === 'pending' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">Pending</span>}
                                            {drive.verificationStatus === 'approved' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Approved</span>}
                                            {drive.verificationStatus === 'rejected' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">Rejected</span>}
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm text-slate-600 flex items-center gap-1.5">
                                                <Calendar size={14} className="text-slate-400" />
                                                {new Date(drive.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end items-center gap-2">
                                                <button
                                                    onClick={() => setViewDrive(drive)}
                                                    className="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition flex items-center gap-1.5"
                                                >
                                                    <Eye size={14} /> View
                                                </button>

                                                {(drive.verificationStatus || 'pending') === 'pending' ? (
                                                    <>
                                                        <button onClick={() => setSelectedDrive(drive)} className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition">Reject</button>
                                                        <button disabled={isActionLoading} onClick={() => handleVerifyCampaign(drive.id, 'approved')} className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition">Approve</button>
                                                    </>
                                                ) : (
                                                    <span className="text-xs text-slate-400 font-medium px-2">Moderated</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : null}

            {/* Campaign Modals (Only rendered when managing campaigns) */}
            {selectedDrive && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden p-6 z-50">
                        <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                            <AlertCircle className="text-red-500" />
                            Reject Campaign
                        </h2>
                        <p className="text-sm text-slate-600 mb-6">
                            You are rejecting <strong>{selectedDrive.title}</strong> by {selectedDrive.companyName}. Please provide a reason so the partner can correct the issue.
                        </p>

                        <div className="space-y-4">
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="E.g., The salary data is missing or the job description is too vague."
                                className="w-full h-32 p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
                            />

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => { setSelectedDrive(null); setRejectionReason(''); }}
                                    className="flex-1 px-4 py-2.5 text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl font-medium transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleVerifyCampaign(selectedDrive.id, 'rejected')}
                                    disabled={!rejectionReason.trim() || isActionLoading}
                                    className="flex-1 px-4 py-2.5 text-white bg-red-600 hover:bg-red-700 rounded-xl font-medium transition flex justify-center items-center disabled:opacity-50"
                                >
                                    {isActionLoading ? <Loader2 size={18} className="animate-spin" /> : 'Confirm Rejection'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {viewDrive && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200 relative flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-100 flex items-start justify-between shrink-0 bg-slate-50/50">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{viewDrive.title}</h2>
                                    {(viewDrive.verificationStatus || 'pending') === 'pending' && <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-amber-100 text-amber-700">Pending Review</span>}
                                    {viewDrive.verificationStatus === 'approved' && <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-emerald-100 text-emerald-700 border border-emerald-200">Approved</span>}
                                    {viewDrive.verificationStatus === 'rejected' && <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-red-100 text-red-700 border border-red-200">Rejected</span>}
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-500">
                                    <span className="flex items-center gap-1.5 text-slate-700"><Building2 size={16} className="text-indigo-600" /> {viewDrive.companyName}</span>
                                    {viewDrive.location && <span className="flex items-center gap-1.5"><MapPin size={16} /> {viewDrive.location}</span>}
                                    <span className="flex items-center gap-1.5"><Briefcase size={16} /> {viewDrive.type}</span>
                                    {viewDrive.salary && <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md"><IndianRupee size={14} /> {viewDrive.salary}</span>}
                                </div>
                            </div>
                            <button
                                onClick={() => setViewDrive(null)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto flex-1 space-y-8">

                            {/* Rejection Reason Banner */}
                            {viewDrive.verificationStatus === 'rejected' && viewDrive.rejectionReason && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
                                    <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
                                    <div>
                                        <h4 className="text-sm font-bold text-red-900 mb-1">Rejection Feedback</h4>
                                        <p className="text-sm text-red-700">{viewDrive.rejectionReason}</p>
                                    </div>
                                </div>
                            )}

                            {/* Key Details Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="flex items-center gap-2 text-slate-500 mb-1.5 font-semibold text-xs uppercase tracking-wider">
                                        <Tag size={14} /> Target Batch
                                    </div>
                                    <div className="font-bold text-slate-800">{viewDrive.batchEligible || 'All Batches'}</div>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="flex items-center gap-2 text-slate-500 mb-1.5 font-semibold text-xs uppercase tracking-wider">
                                        <Calendar size={14} /> Posted On
                                    </div>
                                    <div className="font-bold text-slate-800">{new Date(viewDrive.createdAt).toLocaleDateString()}</div>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 md:col-span-2">
                                    <div className="flex items-center gap-2 text-slate-500 mb-1.5 font-semibold text-xs uppercase tracking-wider">
                                        <UserPlus size={14} /> Application Mode
                                    </div>
                                    <div className="font-bold text-blue-600 truncate">
                                        {viewDrive.applyLink ? (
                                            <a href={viewDrive.applyLink} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                External Form Link (Redirects out)
                                            </a>
                                        ) : (
                                            'Native Emble Application (1-Click)'
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Job Description */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
                                    <FileText size={16} className="text-indigo-500" /> About the Role
                                </h3>
                                <div className="prose prose-sm max-w-none text-slate-600 prose-p:leading-relaxed whitespace-pre-wrap">
                                    {viewDrive.description}
                                </div>
                            </div>

                            {/* Requirements */}
                            {viewDrive.requirements && (
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
                                        <CheckCircle2 size={16} className="text-emerald-500" /> Requirements
                                    </h3>
                                    <div className="prose prose-sm max-w-none text-slate-600 prose-p:leading-relaxed whitespace-pre-wrap">
                                        {viewDrive.requirements}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer actions for pending items */}
                        {(viewDrive.verificationStatus || 'pending') === 'pending' && (
                            <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0 flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setSelectedDrive(viewDrive);
                                        setViewDrive(null);
                                    }}
                                    className="px-5 py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition"
                                >
                                    Reject Campaign
                                </button>
                                <button
                                    disabled={isActionLoading}
                                    onClick={() => {
                                        handleVerifyCampaign(viewDrive.id, 'approved');
                                        setViewDrive(null);
                                    }}
                                    className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-600/20 transition flex items-center gap-2"
                                >
                                    Approve Publishing
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Registration Modal (Used for both Manual and Auto-Provisioning) */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900">
                                {activeLeadId ? 'Provision Lead' : 'Onboard Corporate Partner'}
                            </h2>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 transition"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Company Name</label>
                                    <input
                                        {...register('firstName', { required: true })}
                                        type="text"
                                        placeholder="e.g. Google, Emble"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                                    />
                                    {errors.firstName && <span className="text-red-500 text-xs mt-1 block">Company Name is required</span>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">HR / Dashboard Login Email</label>
                                    <input
                                        {...register('email', { required: true })}
                                        type="email"
                                        placeholder="careers@company.com"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                                        disabled={!!activeLeadId} // Prevent changing email if provisioning a known lead
                                    />
                                    {errors.email && <span className="text-red-500 text-xs mt-1 block">Email is required</span>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Temporary Access Password</label>
                                    <input
                                        {...register('password', { required: true, minLength: 6 })}
                                        type="text" // Made type text so admin can copy the temp password
                                        placeholder="Enter secure password"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                                    />
                                    {errors.password && <span className="text-red-500 text-xs mt-1 block">Password must be at least 6 characters</span>}
                                </div>

                                <div className="bg-blue-50 text-blue-800 p-4 rounded-xl mt-6 text-sm flex gap-3 items-start border border-blue-100">
                                    <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                                    <p>The partner will be registered with the <strong>COMPANY_ADMIN</strong> role. You must securely transfer these credentials to the representative.</p>
                                </div>

                                <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="flex-1 px-4 py-2.5 text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl font-medium transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 px-4 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-xl font-medium transition flex justify-center items-center gap-2 disabled:opacity-70"
                                    >
                                        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Provision Account'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
