'use client';

import { useState } from 'react';
import { GitBranch, GitPullRequest, Folder, FileCode, Clock } from 'lucide-react';

export default function RepoPage() {
    const [activeTab, setActiveTab] = useState('files');

    const files = [
        { name: 'src', type: 'folder', update: 'fix: navigation bug', time: '2 hours ago' },
        { name: 'public', type: 'folder', update: 'chore: update assets', time: '1 day ago' },
        { name: '.gitignore', type: 'file', update: 'init: project setup', time: '3 days ago' },
        { name: 'package.json', type: 'file', update: 'feat: add dependecies', time: '5 hours ago' },
        { name: 'README.md', type: 'file', update: 'docs: update readme', time: '3 days ago' },
        { name: 'tsconfig.json', type: 'file', update: 'chore: ts config', time: '3 days ago' },
    ];



    return (
        <div className="flex h-full bg-[#1e1e1e] flex-col">
            {/* Header */}
            <div className="border-b border-[#333] p-4 bg-[#252526]">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded bg-orange-600 flex items-center justify-center font-bold text-white text-lg">G</div>
                    <div className="text-gray-400">acme-corp / </div>
                    <div className="font-bold text-white">frontend-monorepo</div>
                    <span className="text-xs border border-gray-600 text-gray-400 px-2 py-0.5 rounded-full ml-2">Public</span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 text-sm">
                        <button onClick={() => setActiveTab('files')} className={`flex items-center gap-2 pb-2 border-b-2 transition-colors ${activeTab === 'files' ? 'text-white border-orange-500 font-bold' : 'text-gray-400 border-transparent hover:text-gray-200'}`}>
                            <span className="material-symbols-outlined text-lg">code</span> Code
                        </button>
                        <button onClick={() => setActiveTab('issues')} className={`flex items-center gap-2 pb-2 border-b-2 transition-colors ${activeTab === 'issues' ? 'text-white border-orange-500 font-bold' : 'text-gray-400 border-transparent hover:text-gray-200'}`}>
                            <span className="material-symbols-outlined text-lg">adjust</span> Issues <span className="bg-[#333] px-1.5 rounded-full text-xs">12</span>
                        </button>
                        <button onClick={() => setActiveTab('prs')} className={`flex items-center gap-2 pb-2 border-b-2 transition-colors ${activeTab === 'prs' ? 'text-white border-orange-500 font-bold' : 'text-gray-400 border-transparent hover:text-gray-200'}`}>
                            <GitPullRequest size={16} /> Merge Requests <span className="bg-[#333] px-1.5 rounded-full text-xs">4</span>
                        </button>
                        <button className="flex items-center gap-2 pb-2 border-b-2 border-transparent text-gray-400 hover:text-gray-200">
                            <span className="material-symbols-outlined text-lg">play_circle</span> CI/CD
                        </button>
                    </div>

                    <div className="flex gap-3">
                        <button className="bg-[#333] hover:bg-[#444] text-white px-3 py-1.5 rounded text-sm font-bold border border-[#444] flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">star</span> Star
                        </button>
                        <button className="bg-[#333] hover:bg-[#444] text-white px-3 py-1.5 rounded text-sm font-bold border border-[#444] flex items-center gap-2">
                            <GitBranch size={14} /> Fork
                        </button>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-bold flex items-center gap-2">
                            Clone
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#1e1e1e]">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <button className="bg-[#252526] border border-[#333] hover:border-gray-500 text-gray-300 px-3 py-1.5 rounded text-sm flex items-center gap-2 transition-colors">
                            <GitBranch size={14} className="text-gray-400" />
                            main
                            <span className="material-symbols-outlined text-sm">expand_more</span>
                        </button>
                        <div className="text-gray-500 text-sm flex items-center gap-2">
                            <GitBranch size={14} /> <strong>4</strong> branches
                            <span className="mx-1">•</span>
                            <span className="material-symbols-outlined text-sm">sell</span> <strong>12</strong> tags
                        </div>
                    </div>

                    <div className="bg-[#252526] border border-[#333] rounded px-3 py-1.5 flex items-center gap-2 text-sm text-gray-400">
                        <span className="truncate max-w-[200px]">abc1234</span>
                        <span className="mx-1">·</span>
                        <span className="text-gray-300 font-bold truncate">fix: resolve merge conflicts in auth service</span>
                        <span className="text-xs text-gray-500 ml-2">3 hours ago</span>
                        <Clock size={14} className="ml-2 text-gray-500" />
                        <span className="text-xs font-bold text-gray-500">4,321 commits</span>
                    </div>
                </div>

                <div className="border border-[#333] rounded-lg overflow-hidden bg-[#252526]">
                    {files.map((file, i) => (
                        <div key={file.name} className={`flex items-center justify-between p-3 hover:bg-[#2a2d2e] cursor-pointer transition-colors ${i !== files.length - 1 ? 'border-b border-[#333]' : ''}`}>
                            <div className="flex items-center gap-3 w-1/3">
                                {file.type === 'folder' ? (
                                    <Folder size={16} className="text-blue-400 fill-blue-400/20" />
                                ) : (
                                    <FileCode size={16} className="text-gray-400" />
                                )}
                                <span className="text-sm text-gray-200 hover:text-blue-400 hover:underline">{file.name}</span>
                            </div>
                            <div className="flex-1 text-sm text-gray-500 truncate px-4 hover:text-gray-300">
                                {file.update}
                            </div>
                            <div className="text-xs text-gray-500 w-24 text-right">
                                {file.time}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 border border-[#333] rounded-lg bg-[#252526]">
                    <div className="p-3 border-b border-[#333] flex items-center gap-2">
                        <span className="material-symbols-outlined text-gray-400">toc</span>
                        <h3 className="font-bold text-gray-200 text-sm">README.md</h3>
                    </div>
                    <div className="p-6 prose prose-invert max-w-none">
                        <h1>Frontend Monorepo</h1>
                        <p>Welcome to the Acme Corp frontend repository. This project is built with Next.js and Tailwind CSS.</p>

                        <h2>Getting Started</h2>
                        <pre className="bg-[#1e1e1e] p-4 rounded text-sm text-gray-300">
                            <code>
                                git clone https://git.acmecorp.internal/frontend.git<br />
                                cd frontend<br />
                                npm install<br />
                                npm run dev
                            </code>
                        </pre>

                        <h2>Project Structure</h2>
                        <ul>
                            <li><code>apps/web</code>: Main application</li>
                            <li><code>packages/ui</code>: Shared UI components</li>
                            <li><code>packages/config</code>: Shared configuration</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
