'use client';

import { useState } from 'react';

export default function ChatPage() {
    const [channels, setChannels] = useState([
        { id: 'c1', name: 'general', unread: 0 },
        { id: 'c2', name: 'frontend-devs', unread: 5 },
        { id: 'c3', name: 'random', unread: 0 },
        { id: 'c4', name: 'announcements', unread: 2 },
    ]);
    const [activeChannel, setActiveChannel] = useState('c2');
    const [messageInput, setMessageInput] = useState('');

    return (
        <div className="flex h-full bg-[#1e1e1e]">
            {/* Sidebar */}
            <div className="w-64 bg-[#252526] flex flex-col border-r border-[#333]">
                <div className="p-4 border-b border-[#333]">
                    <h2 className="font-bold text-white flex items-center gap-2">
                        Acme Corp
                        <span className="material-symbols-outlined text-xs text-gray-400">expand_more</span>
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    <div className="mb-6">
                        <h3 className="px-2 text-xs font-bold text-gray-500 uppercase mb-2 flex items-center justify-between group cursor-pointer hover:text-gray-300">
                            Channels <span className="material-symbols-outlined text-xs opacity-0 group-hover:opacity-100">add</span>
                        </h3>
                        <div className="space-y-0.5">
                            {channels.map(channel => (
                                <div
                                    key={channel.id}
                                    onClick={() => setActiveChannel(channel.id)}
                                    className={`px-2 py-1 rounded cursor-pointer flex items-center justify-between group ${activeChannel === channel.id ? 'bg-[#37373d] text-white' : 'text-gray-400 hover:bg-[#2a2d2e] hover:text-gray-200'}`}
                                >
                                    <span className="flex items-center gap-1">
                                        <span className="text-gray-500">#</span> {channel.name}
                                    </span>
                                    {channel.unread > 0 && (
                                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full">{channel.unread}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="px-2 text-xs font-bold text-gray-500 uppercase mb-2 flex items-center justify-between group cursor-pointer hover:text-gray-300">
                            Direct Messages <span className="material-symbols-outlined text-xs opacity-0 group-hover:opacity-100">add</span>
                        </h3>
                        <div className="space-y-0.5">
                            <div className="px-2 py-1 rounded cursor-pointer flex items-center gap-2 text-gray-400 hover:bg-[#2a2d2e] hover:text-gray-200">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                Sarah Jenkins
                            </div>
                            <div className="px-2 py-1 rounded cursor-pointer flex items-center gap-2 text-gray-400 hover:bg-[#2a2d2e] hover:text-gray-200">
                                <div className="w-2 h-2 rounded-full bg-gray-500 border border-black"></div>
                                Mike Ross
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-[#1e1e1e]">
                <div className="h-14 border-b border-[#333] flex items-center justify-between px-6">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-lg">#</span>
                        <h2 className="font-bold text-white text-lg">{channels.find(c => c.id === activeChannel)?.name}</h2>
                    </div>
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 rounded bg-gray-600 border border-[#1e1e1e]"></div>)}
                        <span className="text-xs text-gray-400 ml-3 self-center">24 members</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Welcome Message */}
                    <div className="mb-8 pb-8 border-b border-[#333]">
                        <div className="w-16 h-16 bg-[#333] rounded-2xl flex items-center justify-center mb-4">
                            <span className="text-gray-400 text-3xl">#</span>
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Welcome to #{channels.find(c => c.id === activeChannel)?.name}!</h1>
                        <p className="text-gray-400">This is the start of the <span className="text-blue-400">#{channels.find(c => c.id === activeChannel)?.name}</span> channel.</p>
                    </div>

                    {/* Messages */}
                    <div className="flex gap-4 group">
                        <div className="w-10 h-10 rounded bg-blue-600 flex-shrink-0 flex items-center justify-center font-bold text-white">S</div>
                        <div>
                            <div className="flex items-baseline gap-2">
                                <span className="font-bold text-white hover:underline cursor-pointer">Sarah Jenkins</span>
                                <span className="text-xs text-gray-500">10:42 AM</span>
                            </div>
                            <p className="text-gray-300">Hey team! Just a reminder that code freeze is at 5 PM today. Please merge your PRs before then.</p>
                        </div>
                    </div>

                    <div className="flex gap-4 group">
                        <div className="w-10 h-10 rounded bg-purple-600 flex-shrink-0 flex items-center justify-center font-bold text-white">M</div>
                        <div>
                            <div className="flex items-baseline gap-2">
                                <span className="font-bold text-white hover:underline cursor-pointer">Mike Ross</span>
                                <span className="text-xs text-gray-500">10:45 AM</span>
                            </div>
                            <p className="text-gray-300">
                                <span className="text-blue-400 bg-blue-500/10 px-1 rounded">@Sarah Jenkins</span> I'm still waiting on review for PR #42. Can someone take a look?
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4 px-6 pb-6">
                    <div className="bg-[#2a2d2e] border border-[#444] rounded-lg">
                        <div className="flex items-center gap-1 p-2 bg-[#2a2d2e] border-b border-[#444] rounded-t-lg text-gray-400">
                            <button className="p-1 hover:bg-[#333] rounded"><span className="material-symbols-outlined text-sm">format_bold</span></button>
                            <button className="p-1 hover:bg-[#333] rounded"><span className="material-symbols-outlined text-sm">format_italic</span></button>
                            <div className="w-px h-4 bg-[#444] mx-1"></div>
                            <button className="p-1 hover:bg-[#333] rounded"><span className="material-symbols-outlined text-sm">code</span></button>
                            <button className="p-1 hover:bg-[#333] rounded"><span className="material-symbols-outlined text-sm">link</span></button>
                        </div>
                        <textarea
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            placeholder={`Message #${channels.find(c => c.id === activeChannel)?.name}`}
                            className="w-full bg-[#2a2d2e] text-white p-3 outline-none min-h-[4rem] resize-none rounded-b-lg font-light text-sm"
                        />
                    </div>
                    <div className="text-[10px] text-gray-500 mt-2 text-right">
                        <strong>Return</strong> to send &nbsp; <strong>Shift + Return</strong> to add a new line
                    </div>
                </div>
            </div>
        </div>
    );
}
