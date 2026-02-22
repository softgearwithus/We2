'use client';

import React, { useState, useEffect } from 'react';
import { roadmapData } from '@/app/lib/data/roadmapData';
import { ArrowLeft, Save, Loader2, CheckCircle, AlertCircle, Edit3, Eye, FileText, Sparkles, Wand2, RefreshCw } from 'lucide-react';
import API_BASE_URL from '@/app/lib/api-config';
import Link from 'next/link';

const LESSON_TEMPLATE = `# 🎯 Learning Objectives
- Understand the core concept of [Topic Name]
- Learn how to implement [Key Feature]
- Explore real-world use cases

# 📖 Detailed Explanation
[Topic Name] is essential because...

### Core Mechanics
...

### Implementation Guide
\`\`\`cpp
// Example implementation
void example() {
    // code here
}
\`\`\`

# 💡 Key Takeaways
- Point 1: ...
- Point 2: ...

# ❓ Interview Preparation
**Q1: What is [Topic Name]?**
*A1: [Topic Name] is...*

**Q2: How does [Topic Name] differ from [Other Topic]?**
*A2: The main difference is...*
`;

export default function AdminContentPage() {
    const [selectedTopicId, setSelectedTopicId] = useState('');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [preview, setPreview] = useState(false);

    // Flatten all topics for selection
    const allTopics = roadmapData.flatMap(phase =>
        phase.topics.map(topic => ({
            ...topic,
            phaseTitle: phase.title,
            id: topic.title.toLowerCase().replace(/\s+/g, '-')
        }))
    );

    useEffect(() => {
        if (selectedTopicId) {
            // Reset fields immediately to avoid stale validation
            setTitle('');
            setContent('');
            fetchContent(selectedTopicId);
        }
    }, [selectedTopicId]);

    const fetchContent = async (topicId: string) => {
        setLoading(true);
        setMessage(null);
        try {
            const response = await fetch(`${API_BASE_URL}/course-content/${topicId}`);
            if (response.ok) {
                const data = await response.json();
                if (data && data.title) {
                    setTitle(data.title);
                    setContent(data.content || '');
                } else {
                    const topic = allTopics.find(t => t.id === topicId);
                    setTitle(topic?.title || '');
                    setContent('');
                }
            } else {
                // Topic likely not in database yet, set title from roadmap
                const topic = allTopics.find(t => t.id === topicId);
                setTitle(topic?.title || '');
                setContent('');
            }
        } catch (error) {
            console.error('Error fetching content:', error);
            setMessage({ type: 'error', text: 'Failed to fetch content from server.' });
        } finally {
            setLoading(false);
        }
    };

    const handleApplyTemplate = () => {
        if (content && !confirm('This will replace your current content with the template. Continue?')) {
            return;
        }
        setContent(LESSON_TEMPLATE.replace(/\[Topic Name\]/g, title || 'this topic'));
    };

    const handleAIGenerate = async () => {
        if (!selectedTopicId || !title) {
            setMessage({ type: 'error', text: 'Please select a topic first.' });
            return;
        }

        setGenerating(true);
        setMessage(null);
        try {
            const response = await fetch(`${API_BASE_URL}/ai/generate-content`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topicId: selectedTopicId, topicTitle: title })
            });

            if (response.ok) {
                const data = await response.json();
                setMessage({ type: 'success', text: 'EMBLE AI generated a Pro-level guide for you!' });
                setContent(data.content);
            } else if (response.status === 429) {
                setMessage({ type: 'error', text: 'EMBLE AI is currently busy. Try again later.' });
            } else {
                setMessage({ type: 'error', text: 'Failed to generate content.' });
            }
        } catch (error) {
            console.error('Error generating AI content:', error);
            setMessage({ type: 'error', text: 'Network error while calling EMBLE AI.' });
        } finally {
            setGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!selectedTopicId || !title || !content) {
            setMessage({ type: 'error', text: 'Please fill in all fields.' });
            return;
        }

        setSaving(true);
        setMessage(null);
        try {
            const response = await fetch(`${API_BASE_URL}/course-content/${selectedTopicId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content })
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Content saved successfully!' });
            } else {
                setMessage({ type: 'error', text: 'Failed to save content.' });
            }
        } catch (error) {
            console.error('Error saving content:', error);
            setMessage({ type: 'error', text: 'Network error while saving.' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 lg:p-8 font-sans text-slate-900">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <Link href="/admin" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium mb-4 transition-colors">
                            <ArrowLeft size={18} /> Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-extrabold text-slate-900">Course Content Management</h1>
                        <p className="text-slate-500">Create comprehensive deep-dive guides for your students.</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Topic Selector Side */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Select Topic</label>
                            <select
                                value={selectedTopicId}
                                onChange={(e) => setSelectedTopicId(e.target.value)}
                                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-sm"
                            >
                                <option value="">-- Choose a Topic --</option>
                                {roadmapData.map(phase => (
                                    <optgroup key={phase.id} label={phase.title}>
                                        {phase.topics.map(topic => {
                                            const id = topic.title.toLowerCase().replace(/\s+/g, '-');
                                            return <option key={id} value={id}>{topic.title}</option>
                                        })}
                                    </optgroup>
                                ))}
                            </select>
                        </div>

                        {selectedTopicId && (
                            <button
                                onClick={handleApplyTemplate}
                                className="w-full bg-white border border-indigo-200 text-indigo-600 p-4 rounded-3xl font-bold text-sm hover:bg-indigo-50 transition-all flex items-center justify-center gap-3 shadow-sm group"
                            >
                                <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
                                Apply Lesson Template
                            </button>
                        )}

                        {message && (
                            <div className={`p-4 rounded-2xl flex items-start gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                {message.type === 'success' ? <CheckCircle className="shrink-0" size={20} /> : <AlertCircle className="shrink-0" size={20} />}
                                <p className="text-sm font-medium">{message.text}</p>
                            </div>
                        )}
                    </div>

                    {/* Editor Area */}
                    <div className="lg:col-span-3">
                        {selectedTopicId ? (
                            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[700px] flex flex-col">
                                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setPreview(false)}
                                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${!preview ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-600'}`}
                                        >
                                            <Edit3 size={16} /> Edit
                                        </button>
                                        <button
                                            onClick={() => setPreview(true)}
                                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${preview ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-600'}`}
                                        >
                                            <Eye size={16} /> Preview
                                        </button>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleAIGenerate}
                                            disabled={generating || loading}
                                            className="bg-brand-orange text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-orange-600 transition-all flex items-center gap-2 shadow-lg shadow-orange-100 disabled:opacity-50"
                                        >
                                            {generating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                            {generating ? 'EMBLE AI is thinking...' : 'Generate with EMBLE AI'}
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={saving || loading || generating}
                                            className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100 disabled:opacity-50"
                                        >
                                            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                            {saving ? 'Saving...' : 'Save Content'}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 p-8">
                                    {loading ? (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                                            <Loader2 className="animate-spin text-indigo-500" size={32} />
                                            <p className="text-sm font-medium">Fetching content...</p>
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col">
                                            <input
                                                type="text"
                                                placeholder="Lesson Title"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                className="w-full text-3xl font-black text-slate-900 border-none outline-none focus:ring-0 placeholder:text-slate-200 mb-6 bg-transparent"
                                            />
                                            {preview ? (
                                                <div className="flex-1 overflow-y-auto prose prose-slate max-w-none pt-6 border-t border-slate-100">
                                                    <div className="prose prose-slate max-w-none">
                                                        {content || "No content to preview yet. Start typing or use EMBLE AI!"}
                                                    </div>
                                                </div>
                                            ) : (
                                                <textarea
                                                    placeholder="Write your comprehensive lesson here... Markdown supported."
                                                    value={content}
                                                    onChange={(e) => setContent(e.target.value)}
                                                    className="flex-1 w-full mt-2 border border-slate-100 rounded-3xl p-6 font-mono text-sm text-slate-700 outline-none focus:border-indigo-200 transition-colors resize-none placeholder:text-slate-300 bg-slate-50/30 leading-relaxed min-h-[500px]"
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="h-[700px] bg-white border-2 border-dashed border-slate-200 rounded-[40px] flex flex-col items-center justify-center p-12 text-center text-slate-400">
                                <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mb-6">
                                    <FileText size={48} className="text-slate-200" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-600 mb-2">No Topic Selected</h3>
                                <p className="text-slate-400 max-w-sm mx-auto leading-relaxed">
                                    Ready to create some amazing educational content? Select a topic from the roadmap on the left to begin drafting.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
