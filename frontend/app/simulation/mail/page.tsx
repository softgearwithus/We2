'use client';

import { useState } from 'react';

export default function EmailPage() {
    const [emails] = useState([
        { id: 1, sender: 'HR Dept', subject: 'Onboarding Checklist - Day 1', preview: 'Welcome to Acme Corp! Please complete the following...', time: '09:00 AM', read: false },
        { id: 2, sender: 'Tech Lead', subject: 'Repo Access & Environment Setup', preview: 'I have added you to the gitlab group. Please clone...', time: '09:15 AM', read: false },
        { id: 3, sender: 'Product Owner', subject: 'Sprint Planning Notes', preview: 'Here are the user stories we discussed for the upcoming...', time: '10:30 AM', read: true },
        { id: 4, sender: 'System Admin', subject: 'VPN Credentials', preview: 'Your VPN access keys have been generated. Expires in 24h...', time: 'Yesterday', read: true },
    ]);
    const [selectedEmail, setSelectedEmail] = useState<number | null>(1);

    const currentEmail = emails.find(e => e.id === selectedEmail);

    return (
        <div className="flex h-full bg-[#1e1e1e]">
            {/* Email List */}
            <div className="w-80 border-r border-[#333] flex flex-col">
                <div className="p-4 border-b border-[#333] flex items-center justify-between">
                    <h2 className="font-bold text-gray-200">Inbox</h2>
                    <span className="text-xs text-gray-500 font-mono">{emails.filter(e => !e.read).length} unread</span>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {emails.map(email => (
                        <div
                            key={email.id}
                            onClick={() => setSelectedEmail(email.id)}
                            className={`p-4 border-b border-[#333] cursor-pointer hover:bg-[#2a2d2e] transition-colors ${selectedEmail === email.id ? 'bg-[#37373d] border-l-2 border-l-blue-500' : ''}`}
                        >
                            <div className="flex justify-between mb-1">
                                <span className={`text-sm font-bold ${!email.read ? 'text-white' : 'text-gray-400'}`}>{email.sender}</span>
                                <span className="text-xs text-gray-500">{email.time}</span>
                            </div>
                            <div className={`text-sm mb-1 ${!email.read ? 'text-white font-medium' : 'text-gray-400'}`}>{email.subject}</div>
                            <div className="text-xs text-gray-500 truncate">{email.preview}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Email Content */}
            <div className="flex-1 flex flex-col bg-[#1e1e1e]">
                {currentEmail ? (
                    <>
                        <div className="p-6 border-b border-[#333]">
                            <div className="flex items-center justify-between mb-4">
                                <h1 className="text-2xl font-bold text-white">{currentEmail.subject}</h1>
                                <div className="flex gap-2">
                                    <button className="p-2 hover:bg-[#333] rounded text-gray-400"><span className="material-symbols-outlined">reply</span></button>
                                    <button className="p-2 hover:bg-[#333] rounded text-gray-400"><span className="material-symbols-outlined">delete</span></button>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white">
                                    {currentEmail.sender.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-bold text-sm text-white">{currentEmail.sender}</div>
                                    <div className="text-xs text-gray-400">To: Me &lt;intern@acmecorp.com&gt;</div>
                                </div>
                            </div>
                        </div>
                        <div className="p-8 text-gray-300 leading-relaxed font-serif">
                            <p className="mb-4">Hi,</p>
                            <p className="mb-4">Welcome to the team! We are excited to have you on board.</p>
                            <p className="mb-4">
                                Please follow the instructions in the wiki to set up your local development environment.
                                You will need to install Node.js 20, Docker, and the VS Code extensions listed in the `docs/setup.md` file.
                            </p>
                            <p className="mb-8">
                                Your first task has been assigned on the Kanban board (T-101). Please verify you can access it.
                            </p>
                            <p>Best Regards,<br />{currentEmail.sender}</p>

                            <div className="mt-8 pt-8 border-t border-[#333]">
                                <button className="bg-[#333] hover:bg-[#444] text-white px-4 py-2 rounded text-sm font-medium flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">attachment</span>
                                    setup_guide.pdf (1.2 MB)
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        Select an email to read
                    </div>
                )}
            </div>
        </div>
    );
}
