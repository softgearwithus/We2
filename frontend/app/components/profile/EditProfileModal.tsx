import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Globe, Github, Linkedin, Save, X, AlertCircle } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
    const { user, updateUser } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        bio: '',
        location: '',
        email: '',
        website: '',
        github: '',
        linkedin: ''
    });

    useEffect(() => {
        if (!isOpen || !user) return;
        const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
        setFormData({
            name: fullName,
            username: user.username || '',
            bio: user.bio || '',
            location: user.location || '',
            email: user.email || '',
            website: user.websiteUrl ? user.websiteUrl.replace(/^https?:\/\//, '') : '',
            github: user.githubUrl ? user.githubUrl.replace(/^https?:\/\//, '') : '',
            linkedin: user.linkedinUrl ? user.linkedinUrl.replace(/^https?:\/\//, '') : '',
        });
    }, [isOpen, user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setErrorMessage(null);

        const { getActiveToken } = await import('@/app/lib/auth-storage');
        const token = getActiveToken();
        if (!token) {
            setErrorMessage('You are not authenticated. Please log in again.');
            setIsSaving(false);
            return;
        }

        const [firstName, ...rest] = formData.name.trim().split(' ');
        const lastName = rest.join(' ').trim();
        const normalizeUrl = (value: string) => (value ? `https://${value.replace(/^https?:\/\//, '')}` : '');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    firstName: firstName || null,
                    lastName: lastName || null,
                    username: formData.username || null,
                    bio: formData.bio || null,
                    location: formData.location || null,
                    websiteUrl: formData.website ? normalizeUrl(formData.website) : null,
                    githubUrl: formData.github ? normalizeUrl(formData.github) : null,
                    linkedinUrl: formData.linkedin ? normalizeUrl(formData.linkedin) : null,
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save profile.');
            }

            const updated = await response.json();
            updateUser(updated);

            localStorage.setItem('profile_completed', 'true');
            window.dispatchEvent(new Event('profile_status_changed'));

            onClose();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to save profile.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto w-full">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.2 } }}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95, transition: { duration: 0.2 } }}
                        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <User className="text-indigo-500" /> Edit Profile
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Note about completion */}
                        <div className="bg-amber-50 px-6 py-3 border-b border-amber-100 flex items-center gap-2 shrink-0">
                            <AlertCircle className="text-amber-500" size={16} />
                            <p className="text-xs font-medium text-amber-800">
                                Saving your details will mark your profile as complete.
                            </p>
                        </div>

                        {errorMessage && (
                            <div className="mx-6 mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700">
                                {errorMessage}
                            </div>
                        )}

                        {/* Scrollable Form Area */}
                        <div className="p-6 overflow-y-auto">
                            <form id="edit-profile-form" onSubmit={handleSave} className="space-y-8">
                                {/* Basic Info */}
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                                        Basic Information
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Username</label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">@</span>
                                                    <input
                                                        type="text"
                                                        name="username"
                                                        value={formData.username}
                                                        onChange={handleChange}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Bio</label>
                                            <textarea
                                                name="bio"
                                                value={formData.bio}
                                                onChange={handleChange}
                                                rows={3}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium resize-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Location</label>
                                            <input
                                                type="text"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Contact & Links */}
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                                        Contact & Links
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Mail size={14} /> Email Address</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                readOnly
                                                className="w-full bg-slate-100 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-500 font-medium cursor-not-allowed"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Globe size={14} /> Personal Website</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">https://</span>
                                                <input
                                                    type="text"
                                                    name="website"
                                                    value={formData.website}
                                                    onChange={handleChange}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-16 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Github size={14} /> GitHub</label>
                                                <input
                                                    type="text"
                                                    name="github"
                                                    value={formData.github}
                                                    onChange={handleChange}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Linkedin size={14} /> LinkedIn</label>
                                                <input
                                                    type="text"
                                                    name="linkedin"
                                                    value={formData.linkedin}
                                                    onChange={handleChange}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2.5 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="edit-profile-form"
                                disabled={isSaving}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                            >
                                <Save size={16} />
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
