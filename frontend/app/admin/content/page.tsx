'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, FileText, Loader2, Save, Sparkles, Plus, Code2, Trash2, Eye, GripVertical, ArrowUp, ArrowDown, PlusSquare } from 'lucide-react';
import { SKILLFORGE_TRACKS } from '@/app/lib/skillforge-content';

type ContentMode = 'module' | 'chapters' | 'topics';

type ContentSection = {
    type: 'markdown' | 'code' | 'callout' | 'list';
    title?: string;
    body?: string;
    language?: string;
    items?: string[];
};

type ContentDocument = {
    title: string;
    difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
    readTime?: string;
    sections: ContentSection[];
    mindMap?: string;
    revision?: string;
};

type ChapterBlueprint = {
    id: string;
    title: string;
    desc: string;
    completed: boolean;
};

const DEFAULT_DOC: ContentDocument = {
    title: 'Untitled Module',
    difficulty: 'Beginner',
    readTime: '8 min',
    sections: [
        {
            type: 'markdown',
            title: 'Overview',
            body: 'Write a clear, tactical explanation here.',
        },
        {
            type: 'code',
            title: 'Example',
            body: 'console.log("Hello Skill Forge");',
            language: 'ts',
        },
    ],
    mindMap: '',
    revision: '- Summarize the key takeaways here.',
};

const CHAPTER_TEMPLATE = [
    { id: 'intro', title: 'Introduction', desc: 'Setup, core definitions, and mental models.', completed: false },
];

const PROGRAMMING_SNIPPETS: Record<string, { language: string; code: string }> = {
    python: { language: 'python', code: 'def solve(nums):\n    total = 0\n    for n in nums:\n        total += n\n    return total\n' },
    javascript: { language: 'javascript', code: 'const sum = (nums) => nums.reduce((acc, n) => acc + n, 0);\n' },
    java: { language: 'java', code: 'int sum(int[] nums) {\n    int total = 0;\n    for (int n : nums) total += n;\n    return total;\n}' },
    cpp: { language: 'cpp', code: '#include <bits/stdc++.h>\nusing namespace std;\n\nint sum(const vector<int>& nums) {\n    int total = 0;\n    for (int n : nums) total += n;\n    return total;\n}\n' },
    go: { language: 'go', code: 'func sum(nums []int) int {\n    total := 0\n    for _, n := range nums {\n        total += n\n    }\n    return total\n}\n' },
};

const TECHNOLOGY_SNIPPETS: Record<string, { language: string; code: string }> = {
    react: { language: 'tsx', code: 'export function Badge({ label }: { label: string }) {\n  return <span className="badge">{label}</span>;\n}\n' },
    node: { language: 'ts', code: 'app.get("/api/health", (req, res) => {\n  res.json({ ok: true, ts: Date.now() });\n});\n' },
    next: { language: 'tsx', code: 'export default function Page() {\n  return <main className="p-6">Hello Skill Forge</main>;\n}\n' },
    docker: { language: 'docker', code: 'FROM node:20-alpine\nWORKDIR /app\nCOPY . .\nRUN npm install\nCMD ["npm", "run", "start"]\n' },
    graphql: { language: 'graphql', code: 'type Query {\n  health: String\n}\n' },
    mongodb: { language: 'javascript', code: 'db.users.createIndex({ email: 1 }, { unique: true });\n' },
    html: { language: 'html', code: '<section class="card">\n  <h2>Skill Forge</h2>\n  <p>Build with intent.</p>\n</section>\n' },
    css: { language: 'css', code: '.card {\n  padding: 1.5rem;\n  border-radius: 1rem;\n  background: #fff;\n}\n' },
    javascript: { language: 'javascript', code: 'document.querySelector("#cta").addEventListener("click", () => {\n  alert("Ready to build!");\n});\n' },
    typescript: { language: 'typescript', code: 'type ApiResponse = { ok: boolean; ts: number };\n' },
};

const TRACK_SNIPPETS: Record<string, { language: string; code: string }> = {
    dsa: { language: 'cpp', code: 'vector<int> twoSum(vector<int>& nums, int target) {\n  unordered_map<int,int> seen;\n  for (int i = 0; i < (int)nums.size(); i++) {\n    int need = target - nums[i];\n    if (seen.count(need)) return {seen[need], i};\n    seen[nums[i]] = i;\n  }\n  return {};\n}\n' },
    'system-design': { language: 'text', code: 'Clients -> API Gateway -> Services -> Cache -> DB\n' },
    aiml: { language: 'python', code: 'model.fit(X_train, y_train)\npreds = model.predict(X_test)\n' },
    datascience: { language: 'sql', code: 'SELECT department, AVG(score)\nFROM students\nGROUP BY department;\n' },
    aptitude: { language: 'text', code: 'Speed = Distance / Time\nWork = Rate * Time\n' },
    tools: { language: 'bash', code: 'git checkout -b feature/skillforge\ngit add .\ngit commit -m "feat: add module"\n' },
    blockchain: { language: 'solidity', code: 'contract Counter {\n  uint value;\n  function inc() public { value += 1; }\n}\n' },
    core: { language: 'text', code: 'Process -> Ready Queue -> CPU -> IO Wait\n' },
    hr: { language: 'text', code: 'Situation: ...\nTask: ...\nAction: ...\nResult: ...\n' },
    programming: { language: 'python', code: 'print("Hello Skill Forge")\n' },
    technology: { language: 'tsx', code: 'export const Button = () => <button>Ship</button>;\n' },
};

const CHAPTER_BLUEPRINTS: Record<string, (topicName: string) => ChapterBlueprint[]> = {
    programming: (topicName) => [
        { id: 'module-0', title: `${topicName} Foundations`, desc: 'Syntax, data types, and setup.', completed: false },
        { id: 'module-1', title: 'Control Flow', desc: 'Conditionals and loops for real tasks.', completed: false },
        { id: 'module-2', title: 'Functions & Abstractions', desc: 'Reusable logic and composition.', completed: false },
        { id: 'module-3', title: 'Data Structures', desc: 'Arrays, maps, and core collections.', completed: false },
        { id: 'module-4', title: 'Object-Oriented Design', desc: 'Classes, inheritance, interfaces.', completed: false },
        { id: 'module-5', title: 'Concurrency & Async', desc: 'Async patterns and performance.', completed: false },
        { id: 'module-6', title: 'Testing & Debugging', desc: 'Unit tests and debugging workflows.', completed: false },
        { id: 'module-7', title: 'Project Sprint', desc: 'Ship a mini project using the stack.', completed: false },
    ],
    technology: (topicName) => [
        { id: 'module-0', title: `${topicName} Overview`, desc: 'Core concepts and architecture.', completed: false },
        { id: 'module-1', title: 'Component Patterns', desc: 'Reusable UI and state structure.', completed: false },
        { id: 'module-2', title: 'API Integration', desc: 'Fetching, caching, and errors.', completed: false },
        { id: 'module-3', title: 'Auth & Security', desc: 'Sessions, tokens, and safe flows.', completed: false },
        { id: 'module-4', title: 'Performance', desc: 'Optimization and best practices.', completed: false },
        { id: 'module-5', title: 'Deployment', desc: 'Ship to production confidently.', completed: false },
    ],
    dsa: (topicName) => [
        { id: 'module-0', title: `${topicName} Patterns`, desc: 'Pattern recognition and primitives.', completed: false },
        { id: 'module-1', title: 'Core Techniques', desc: 'Two pointers, sliding window, hashing.', completed: false },
        { id: 'module-2', title: 'Optimization', desc: 'Complexity improvements and pruning.', completed: false },
        { id: 'module-3', title: 'Edge Cases', desc: 'Pitfalls and boundary handling.', completed: false },
        { id: 'module-4', title: 'Practice Set', desc: 'Handpicked problems and walkthroughs.', completed: false },
    ],
    'system-design': (topicName) => [
        { id: 'module-0', title: 'Requirements & Scale', desc: 'Define metrics and constraints.', completed: false },
        { id: 'module-1', title: 'High-Level Architecture', desc: 'Service decomposition and flows.', completed: false },
        { id: 'module-2', title: 'Data Design', desc: 'Schema, storage, and access.', completed: false },
        { id: 'module-3', title: 'Scalability', desc: 'Caching, sharding, and queues.', completed: false },
        { id: 'module-4', title: 'Reliability', desc: 'Fault tolerance and observability.', completed: false },
        { id: 'module-5', title: 'Case Study', desc: 'End-to-end design walkthrough.', completed: false },
    ],
    aiml: (topicName) => [
        { id: 'module-0', title: 'Problem Framing', desc: 'Define objectives and metrics.', completed: false },
        { id: 'module-1', title: 'Data Preparation', desc: 'Cleaning, features, splitting.', completed: false },
        { id: 'module-2', title: 'Modeling', desc: 'Baselines to advanced models.', completed: false },
        { id: 'module-3', title: 'Evaluation', desc: 'Validation, metrics, tuning.', completed: false },
        { id: 'module-4', title: 'Deployment', desc: 'Serving, monitoring, and drift.', completed: false },
    ],
    datascience: (topicName) => [
        { id: 'module-0', title: 'Business Question', desc: 'Define KPIs and scope.', completed: false },
        { id: 'module-1', title: 'Data Wrangling', desc: 'Clean, join, transform.', completed: false },
        { id: 'module-2', title: 'Exploration', desc: 'EDA and pattern discovery.', completed: false },
        { id: 'module-3', title: 'Visualization', desc: 'Dashboards and storytelling.', completed: false },
        { id: 'module-4', title: 'Insights', desc: 'Actionable findings and next steps.', completed: false },
    ],
    aptitude: (topicName) => [
        { id: 'module-0', title: `${topicName} Fundamentals`, desc: 'Formulae and quick methods.', completed: false },
        { id: 'module-1', title: 'Speed Techniques', desc: 'Shortcuts and eliminations.', completed: false },
        { id: 'module-2', title: 'Practice Drills', desc: 'Timed practice sets.', completed: false },
        { id: 'module-3', title: 'Mock Test', desc: 'Full-length practice test.', completed: false },
    ],
    tools: (topicName) => [
        { id: 'module-0', title: `${topicName} Setup`, desc: 'Install and configure tools.', completed: false },
        { id: 'module-1', title: 'Daily Workflow', desc: 'Common commands and patterns.', completed: false },
        { id: 'module-2', title: 'Team Collaboration', desc: 'Branching, reviews, and sync.', completed: false },
        { id: 'module-3', title: 'Power User Tips', desc: 'Speed and automation.', completed: false },
    ],
    blockchain: (topicName) => [
        { id: 'module-0', title: 'Foundations', desc: 'Consensus and cryptography.', completed: false },
        { id: 'module-1', title: 'Smart Contracts', desc: 'Solidity basics and deployment.', completed: false },
        { id: 'module-2', title: 'Security', desc: 'Audit patterns and exploits.', completed: false },
        { id: 'module-3', title: 'DApp Integration', desc: 'Wallets, web3, and frontend.', completed: false },
    ],
    core: (topicName) => [
        { id: 'module-0', title: `${topicName} Basics`, desc: 'Definitions and core models.', completed: false },
        { id: 'module-1', title: 'Internals', desc: 'How it works under the hood.', completed: false },
        { id: 'module-2', title: 'Tradeoffs', desc: 'Performance and design choices.', completed: false },
        { id: 'module-3', title: 'Interview Patterns', desc: 'Common questions and answers.', completed: false },
    ],
    hr: (topicName) => [
        { id: 'module-0', title: 'Frameworks', desc: 'STAR and structured responses.', completed: false },
        { id: 'module-1', title: 'Story Bank', desc: 'Prepare high-impact stories.', completed: false },
        { id: 'module-2', title: 'Mock Rounds', desc: 'Practice with feedback.', completed: false },
    ],
    default: (topicName) => [
        { id: 'module-0', title: `${topicName} Foundations`, desc: 'Core concepts and definitions.', completed: false },
        { id: 'module-1', title: 'Deep Dive', desc: 'Detailed explanations and examples.', completed: false },
        { id: 'module-2', title: 'Practice', desc: 'Exercises and applied learning.', completed: false },
    ],
};

const MODULE_TEMPLATES: Record<string, ContentDocument> = {
    'dsa': {
        title: 'DSA Module Template',
        difficulty: 'Intermediate',
        readTime: '12 min',
        sections: [
            { type: 'markdown', title: 'Concept Overview', body: 'Explain the core pattern, use-cases, and intuition.' },
            { type: 'code', title: 'Example (C++)', body: '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    vector<int> nums = {1,2,3,4};\n    // TODO: implement\n    return 0;\n}', language: 'cpp' },
            { type: 'markdown', title: 'Complexity', body: '- Time: O(n)\n- Space: O(1) or O(n)' },
            { type: 'callout', title: 'Common Pitfalls', body: '- Off-by-one errors\n- Missing edge cases\n- Failing for empty input' },
        ],
        mindMap: 'Pattern -> Steps -> Edge cases',
        revision: '- Identify the pattern\n- Solve sample\n- Optimize\n- Verify complexity',
    },
    'technology': {
        title: 'Full Stack Module Template',
        difficulty: 'Intermediate',
        readTime: '10 min',
        sections: [
            { type: 'markdown', title: 'Use Case', body: 'Describe a real-world feature and why it matters.' },
            { type: 'code', title: 'Frontend Example', body: 'function Button() {\n  return <button className="btn">Save</button>;\n}', language: 'tsx' },
            { type: 'code', title: 'Backend Example', body: 'app.get("/api/status", (req, res) => {\n  res.json({ ok: true });\n});', language: 'ts' },
            { type: 'callout', title: 'Production Notes', body: '- Add error handling\n- Validate inputs\n- Use monitoring' },
        ],
        mindMap: 'UI -> API -> DB -> Deployment',
        revision: '- Build UI\n- Wire API\n- Validate data\n- Ship',
    },
    'system-design': {
        title: 'System Design Template',
        difficulty: 'Advanced',
        readTime: '15 min',
        sections: [
            { type: 'markdown', title: 'Problem Statement', body: 'Describe the system and target scale.' },
            { type: 'markdown', title: 'High-Level Architecture', body: 'List core services and data flow.' },
            { type: 'code', title: 'Schema Sketch', body: 'users(id, name, email)\norders(id, user_id, amount)', language: 'text' },
            { type: 'callout', title: 'Tradeoffs', body: '- Consistency vs Availability\n- Caching strategy\n- Cost controls' },
        ],
        mindMap: 'Clients -> API -> Services -> Storage',
        revision: '- Define scale\n- Pick storage\n- Address bottlenecks',
    },
    'aiml': {
        title: 'AI/ML Module Template',
        difficulty: 'Intermediate',
        readTime: '14 min',
        sections: [
            { type: 'markdown', title: 'Objective', body: 'Define the ML task and success metrics.' },
            { type: 'code', title: 'Training Snippet', body: 'model.fit(X_train, y_train)\nprint(model.score(X_test, y_test))', language: 'python' },
            { type: 'callout', title: 'Data Tips', body: '- Clean missing values\n- Normalize features\n- Check leakage' },
        ],
        mindMap: 'Data -> Model -> Evaluation -> Deployment',
        revision: '- Define labels\n- Train baseline\n- Improve features',
    },
    'datascience': {
        title: 'Data Science Module Template',
        difficulty: 'Beginner',
        readTime: '9 min',
        sections: [
            { type: 'markdown', title: 'Business Question', body: 'State the metric or insight to uncover.' },
            { type: 'code', title: 'SQL Example', body: 'SELECT department, AVG(score)\nFROM students\nGROUP BY department;', language: 'sql' },
            { type: 'code', title: 'Pandas Example', body: 'df.groupby("department")["score"].mean()', language: 'python' },
        ],
        mindMap: 'Question -> Data -> Analysis -> Story',
        revision: '- Validate data\n- Aggregate\n- Communicate insights',
    },
    'aptitude': {
        title: 'Aptitude Module Template',
        difficulty: 'Beginner',
        readTime: '8 min',
        sections: [
            { type: 'markdown', title: 'Concept', body: 'Explain formula + quick shortcuts.' },
            { type: 'callout', title: 'Speed Tips', body: '- Use estimation\n- Eliminate options quickly' },
        ],
        mindMap: 'Formula -> Example -> Shortcuts',
        revision: '- Memorize formula\n- Practice 5 problems',
    },
    'core': {
        title: 'CS Fundamentals Template',
        difficulty: 'Intermediate',
        readTime: '11 min',
        sections: [
            { type: 'markdown', title: 'Core Theory', body: 'Define the concept with examples.' },
            { type: 'code', title: 'Illustration', body: 'Process -> Ready Queue -> CPU', language: 'text' },
            { type: 'callout', title: 'Interview Notes', body: '- Provide crisp definitions\n- Use examples' },
        ],
        mindMap: 'Definition -> Example -> Tradeoffs',
        revision: '- Revise definitions\n- Recall key terms',
    },
    'tools': {
        title: 'Developer Tools Template',
        difficulty: 'Beginner',
        readTime: '7 min',
        sections: [
            { type: 'markdown', title: 'Workflow', body: 'Explain day-to-day workflow steps.' },
            { type: 'code', title: 'CLI Example', body: 'git checkout -b feature/name\ngit add .\ngit commit -m "feat"', language: 'bash' },
        ],
        mindMap: 'Setup -> Usage -> Best Practices',
        revision: '- Learn commands\n- Practice daily',
    },
    'blockchain': {
        title: 'Web3 Module Template',
        difficulty: 'Intermediate',
        readTime: '10 min',
        sections: [
            { type: 'markdown', title: 'Concept', body: 'Define the blockchain concept.' },
            { type: 'code', title: 'Solidity Example', body: 'contract Counter {\n  uint value;\n  function inc() public { value += 1; }\n}', language: 'solidity' },
        ],
        mindMap: 'Consensus -> Contracts -> Apps',
        revision: '- Understand blocks\n- Write one contract',
    },
    'hr': {
        title: 'Behavioral Skills Template',
        difficulty: 'Beginner',
        readTime: '6 min',
        sections: [
            { type: 'markdown', title: 'Framework', body: 'Use STAR or CAR to answer.' },
            { type: 'callout', title: 'Practice', body: '- Record answers\n- Get feedback' },
        ],
        mindMap: 'Story -> Impact -> Reflection',
        revision: '- Prep 3 stories\n- Practice daily',
    },
};

export default function AdminContentPage() {
    const [trackId, setTrackId] = useState('');
    const [topicId, setTopicId] = useState('');
    const [moduleId, setModuleId] = useState('');
    const [mode, setMode] = useState<ContentMode>('module');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [doc, setDoc] = useState<ContentDocument>(DEFAULT_DOC);
    const [rawContent, setRawContent] = useState('');
    const [preview, setPreview] = useState(false);
    const [isPremium, setIsPremium] = useState(true);
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [bulkScope, setBulkScope] = useState<'all' | 'track' | 'topic'>('all');
    const [bulkOverwrite, setBulkOverwrite] = useState(false);
    const [bulkRunning, setBulkRunning] = useState(false);
    const [bulkProgress, setBulkProgress] = useState({ total: 0, done: 0, current: '' });
    const [bulkErrors, setBulkErrors] = useState<string[]>([]);

    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const track = useMemo(() => SKILLFORGE_TRACKS.find((t) => t.id === trackId), [trackId]);
    const topics = track?.topics || [];

    const topicOptions = useMemo(() => topics.map((t) => ({ id: t.id, name: t.name })), [topics]);

    const topicIdForMode = useMemo(() => {
        if (!trackId) return '';
        if (mode === 'topics') return track?.topicId || '';
        if (!topicId) return '';
        if (mode === 'chapters') return `${trackId}-${topicId}-chapters`;
        if (!moduleId) return '';
        return `${trackId}-${topicId}-${moduleId}`;
    }, [trackId, topicId, moduleId, mode, track?.topicId]);

    useEffect(() => {
        if (!topicIdForMode) return;
        const loadContent = async () => {
            setLoading(true);
            setMessage(null);
            try {
                const response = await fetch(`${apiBase}/course-content/${topicIdForMode}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data?.content) {
                        if (mode === 'module') {
                            try {
                                const parsed = JSON.parse(data.content);
                                setDoc(parsed);
                                setRawContent(data.content);
                            } catch {
                                setDoc({ ...DEFAULT_DOC, title: data.title || DEFAULT_DOC.title });
                                setRawContent(data.content);
                            }
                        } else {
                            setRawContent(data.content);
                        }
                    } else {
                        setDoc(DEFAULT_DOC);
                        setRawContent('');
                    }
                } else {
                    setDoc(DEFAULT_DOC);
                    setRawContent('');
                }
            } catch (error) {
                setMessage({ type: 'error', text: 'Failed to load content.' });
            } finally {
                setLoading(false);
            }
        };

        loadContent();
    }, [topicIdForMode, mode]);

    const resolveSnippetFor = (trackKey: string, topicKey: string) => {
        if (trackKey === 'programming' && PROGRAMMING_SNIPPETS[topicKey]) {
            return PROGRAMMING_SNIPPETS[topicKey];
        }
        if (trackKey === 'technology' && TECHNOLOGY_SNIPPETS[topicKey]) {
            return TECHNOLOGY_SNIPPETS[topicKey];
        }
        if (TRACK_SNIPPETS[trackKey]) {
            return TRACK_SNIPPETS[trackKey];
        }
        return { language: 'ts', code: 'console.log("Hello Skill Forge");' };
    };

    const resolveSnippet = () => resolveSnippetFor(trackId, topicId);

    const handleAddSection = (type: ContentSection['type']) => {
        const snippet = resolveSnippet();
        setDoc((prev) => ({
            ...prev,
            sections: [
                ...prev.sections,
                {
                    type,
                    title: type === 'code' ? 'Example' : 'Section',
                    body: type === 'code' ? snippet.code : '',
                    language: type === 'code' ? snippet.language : 'ts',
                },
            ],
        }));
    };

    const handleInsertCodeAfter = (index: number) => {
        const snippet = resolveSnippet();
        setDoc((prev) => {
            const next = [...prev.sections];
            next.splice(index + 1, 0, {
                type: 'code',
                title: 'Example',
                body: snippet.code,
                language: snippet.language,
            });
            return { ...prev, sections: next };
        });
    };

    const handleRemoveSection = (index: number) => {
        setDoc((prev) => ({
            ...prev,
            sections: prev.sections.filter((_, i) => i !== index),
        }));
    };

    const moveSection = (from: number, to: number) => {
        if (from === to) return;
        setDoc((prev) => {
            const next = [...prev.sections];
            const [moved] = next.splice(from, 1);
            next.splice(to, 0, moved);
            return { ...prev, sections: next };
        });
    };

    const handleDragStart = (index: number, event: React.DragEvent<HTMLDivElement>) => {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', String(index));
        event.dataTransfer.setDragImage(event.currentTarget, 10, 10);
        setDraggingIndex(index);
    };

    const handleDragOver = (index: number, event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        if (dragOverIndex !== index) {
            setDragOverIndex(index);
        }
    };

    const handleDrop = (index: number, event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const raw = event.dataTransfer.getData('text/plain');
        const from = parseInt(raw, 10);
        if (!Number.isNaN(from)) {
            moveSection(from, index);
        }
        setDraggingIndex(null);
        setDragOverIndex(null);
    };

    const handleDragEnd = () => {
        setDraggingIndex(null);
        setDragOverIndex(null);
    };

    const updateSection = (index: number, patch: Partial<ContentSection>) => {
        setDoc((prev) => ({
            ...prev,
            sections: prev.sections.map((section, i) => (i === index ? { ...section, ...patch } : section)),
        }));
    };

    const handleSave = async () => {
        if (!topicIdForMode) {
            setMessage({ type: 'error', text: 'Select a track/topic/module first.' });
            return;
        }

        setSaving(true);
        setMessage(null);
        try {
            const contentPayload = mode === 'module'
                ? JSON.stringify(doc, null, 2)
                : rawContent;

            const response = await fetch(`${apiBase}/course-content/${topicIdForMode}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: mode === 'module' ? doc.title : topicIdForMode,
                    content: contentPayload,
                    isPremium,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save content');
            }
            setMessage({ type: 'success', text: 'Content saved successfully.' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to save content.' });
        } finally {
            setSaving(false);
        }
    };

    const handleLoadTemplate = () => {
        if (mode === 'topics' && track) {
            setRawContent(JSON.stringify(track.topics, null, 2));
            return;
        }
        if (mode === 'module') {
            const template = MODULE_TEMPLATES[trackId] || DEFAULT_DOC;
            setDoc({ ...template, title: template.title });
            return;
        }
        if (mode === 'chapters' && trackId && topicId) {
            const topicName = topicOptions.find((topic) => topic.id === topicId)?.name || topicId;
            const builder = CHAPTER_BLUEPRINTS[trackId] || CHAPTER_BLUEPRINTS.default;
            setRawContent(JSON.stringify(builder(topicName), null, 2));
        } else if (mode === 'chapters') {
            setRawContent(JSON.stringify(CHAPTER_TEMPLATE, null, 2));
        }
    };

    const buildModuleDocument = (trackKey: string, topicKey: string, topicName: string, chapter: ChapterBlueprint, index: number) => {
        const base = MODULE_TEMPLATES[trackKey] || DEFAULT_DOC;
        const snippet = resolveSnippetFor(trackKey, topicKey);
        const difficulty = index < 2 ? 'Beginner' : index < 4 ? 'Intermediate' : 'Advanced';
        const sections = base.sections.map((section) => {
            if (section.type === 'code') {
                return {
                    ...section,
                    title: section.title || 'Example',
                    body: snippet.code,
                    language: snippet.language,
                };
            }
            if (section.type === 'markdown') {
                return {
                    ...section,
                    body: `This module focuses on **${chapter.title}** for ${topicName}.\n\n${section.body || ''}`.trim(),
                };
            }
            return section;
        });

        if (!sections.some((section) => section.type === 'code')) {
            sections.push({ type: 'code', title: 'Example', body: snippet.code, language: snippet.language });
        }

        sections.push({
            type: 'callout',
            title: 'Try in IDE',
            body: 'Run the snippet in the IDE and modify it with your own inputs.',
        });

        return {
            title: `${topicName}: ${chapter.title}`,
            difficulty,
            readTime: base.readTime || '10 min',
            sections,
            mindMap: base.mindMap || `${topicName} → ${chapter.title} → Practice`,
            revision: base.revision || `- Review ${chapter.title}\n- Solve 2 practice tasks\n- Summarize the key idea`,
        };
    };

    const fetchExisting = async (topicKey: string) => {
        try {
            const response = await fetch(`${apiBase}/course-content/${topicKey}`);
            if (!response.ok) return null;
            return await response.json();
        } catch {
            return null;
        }
    };

    const createContent = async (topicKey: string, title: string, content: string, premiumFlag: boolean) => {
        const response = await fetch(`${apiBase}/course-content/${topicKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content, isPremium: premiumFlag }),
        });
        if (!response.ok) {
            throw new Error(`Failed to write ${topicKey}`);
        }
    };

    const handleBulkGenerate = async () => {
        if (bulkRunning) return;
        if (bulkScope !== 'all' && !trackId) {
            setMessage({ type: 'error', text: 'Select a track before bulk generation.' });
            return;
        }
        if (bulkScope === 'topic' && !topicId) {
            setMessage({ type: 'error', text: 'Select a topic before bulk generation.' });
            return;
        }

        const tracksToUse = bulkScope === 'all'
            ? SKILLFORGE_TRACKS
            : SKILLFORGE_TRACKS.filter((item) => item.id === trackId);

        const tasks: Array<{ topicKey: string; title: string; content: string }> = [];

        for (const item of tracksToUse) {
            if (bulkScope !== 'topic') {
                tasks.push({
                    topicKey: item.topicId,
                    title: `${item.name} Topics`,
                    content: JSON.stringify(item.topics, null, 2),
                });
            }

            const topicsToUse = bulkScope === 'topic'
                ? item.topics.filter((topic) => topic.id === topicId)
                : item.topics;

            for (const topic of topicsToUse) {
                const chapterBuilder = CHAPTER_BLUEPRINTS[item.id] || CHAPTER_BLUEPRINTS.default;
                const chapters = chapterBuilder(topic.name);
                tasks.push({
                    topicKey: `${item.id}-${topic.id}-chapters`,
                    title: `${topic.name} Chapters`,
                    content: JSON.stringify(chapters, null, 2),
                });

                chapters.forEach((chapter, index) => {
                    const moduleDoc = buildModuleDocument(item.id, topic.id, topic.name, chapter, index);
                    tasks.push({
                        topicKey: `${item.id}-${topic.id}-${chapter.id}`,
                        title: moduleDoc.title,
                        content: JSON.stringify(moduleDoc, null, 2),
                    });
                });
            }
        }

        setBulkRunning(true);
        setBulkErrors([]);
        setBulkProgress({ total: tasks.length, done: 0, current: '' });

        let completed = 0;
        const errors: string[] = [];

        for (const task of tasks) {
            setBulkProgress({ total: tasks.length, done: completed, current: task.topicKey });
            try {
                if (!bulkOverwrite) {
                    const existing = await fetchExisting(task.topicKey);
                    if (existing?.content) {
                        completed += 1;
                        continue;
                    }
                }
                await createContent(task.topicKey, task.title, task.content, isPremium);
            } catch (error: any) {
                errors.push(`${task.topicKey}: ${error?.message || 'failed'}`);
            } finally {
                completed += 1;
                setBulkProgress({ total: tasks.length, done: completed, current: task.topicKey });
            }
        }

        setBulkErrors(errors);
        setBulkRunning(false);
        setMessage({
            type: errors.length ? 'error' : 'success',
            text: errors.length
                ? `Bulk generation completed with ${errors.length} errors.`
                : 'Bulk generation completed successfully.',
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 lg:p-8 font-sans text-slate-900">
            <div className="max-w-7xl mx-auto space-y-8">
                <header className="flex items-center justify-between">
                    <div>
                        <Link href="/admin" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium mb-4 transition-colors">
                            <ArrowLeft size={18} /> Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-extrabold text-slate-900">Skill Forge Content Studio</h1>
                        <p className="text-slate-500">Design premium modules, chapters, and topic catalogs.</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                    <div className="xl:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Content Type</label>
                                <div className="mt-3 grid grid-cols-3 gap-2">
                                    {(['module', 'chapters', 'topics'] as ContentMode[]).map((item) => (
                                        <button
                                            key={item}
                                            onClick={() => setMode(item)}
                                            className={`px-3 py-2 rounded-xl text-xs font-bold ${mode === item ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-500 border border-slate-200'}`}
                                        >
                                            {item}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Track</label>
                                <select
                                    value={trackId}
                                    onChange={(e) => {
                                        setTrackId(e.target.value);
                                        setTopicId('');
                                        setModuleId('');
                                    }}
                                    className="mt-2 w-full p-3 rounded-xl border border-slate-200 bg-slate-50"
                                >
                                    <option value="">Select Track</option>
                                    {SKILLFORGE_TRACKS.map((track) => (
                                        <option key={track.id} value={track.id}>{track.name}</option>
                                    ))}
                                </select>
                            </div>

                            {mode !== 'topics' && (
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Topic</label>
                                    <select
                                        value={topicId}
                                        onChange={(e) => {
                                            setTopicId(e.target.value);
                                            setModuleId('');
                                        }}
                                        className="mt-2 w-full p-3 rounded-xl border border-slate-200 bg-slate-50"
                                    >
                                        <option value="">Select Topic</option>
                                        {topicOptions.map((topic) => (
                                            <option key={topic.id} value={topic.id}>{topic.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {mode === 'module' && (
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Module ID</label>
                                    <input
                                        value={moduleId}
                                        onChange={(e) => setModuleId(e.target.value)}
                                        className="mt-2 w-full p-3 rounded-xl border border-slate-200 bg-slate-50"
                                        placeholder="intro, arrays-1, etc"
                                    />
                                </div>
                            )}

                                <div className="pt-2 space-y-2">
                                    <label className="flex items-center gap-2 text-xs text-slate-500">
                                        <input
                                            type="checkbox"
                                            checked={isPremium}
                                            onChange={(e) => setIsPremium(e.target.checked)}
                                        />
                                        Mark as premium content
                                    </label>
                                    <button
                                        onClick={handleLoadTemplate}
                                        className="w-full bg-white border border-indigo-200 text-indigo-600 p-3 rounded-2xl font-bold text-xs hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Sparkles size={14} /> Load Template
                                    </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="w-full bg-indigo-600 text-white p-3 rounded-2xl font-bold text-xs hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                                >
                                    {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                                    {saving ? 'Saving...' : 'Save Content'}
                                </button>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                            <div>
                                <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Bulk Generator</div>
                                <p className="text-xs text-slate-500 mt-2">Generate topics, chapters, and modules for Skill Forge in one run.</p>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                {(['all', 'track', 'topic'] as const).map((scope) => (
                                    <button
                                        key={scope}
                                        onClick={() => setBulkScope(scope)}
                                        className={`px-3 py-2 rounded-xl text-xs font-bold ${bulkScope === scope ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-500 border border-slate-200'}`}
                                    >
                                        {scope}
                                    </button>
                                ))}
                            </div>

                            <label className="flex items-center gap-2 text-xs text-slate-500">
                                <input
                                    type="checkbox"
                                    checked={bulkOverwrite}
                                    onChange={(e) => setBulkOverwrite(e.target.checked)}
                                />
                                Overwrite existing content
                            </label>
                            <label className="flex items-center gap-2 text-xs text-slate-500">
                                <input
                                    type="checkbox"
                                    checked={isPremium}
                                    onChange={(e) => setIsPremium(e.target.checked)}
                                />
                                Generate as premium
                            </label>

                            <button
                                onClick={handleBulkGenerate}
                                disabled={bulkRunning}
                                className="w-full bg-slate-900 text-white p-3 rounded-2xl font-bold text-xs hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                                {bulkRunning ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                                {bulkRunning ? 'Generating...' : 'Generate All Content'}
                            </button>

                            {bulkRunning && (
                                <div className="text-xs text-slate-500">
                                    {bulkProgress.done}/{bulkProgress.total} • {bulkProgress.current}
                                    <div className="mt-2 h-2 rounded-full bg-slate-100">
                                        <div
                                            className="h-full rounded-full bg-indigo-500 transition-all"
                                            style={{ width: `${bulkProgress.total ? (bulkProgress.done / bulkProgress.total) * 100 : 0}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {bulkErrors.length > 0 && (
                                <div className="text-xs text-rose-500 space-y-1 max-h-28 overflow-y-auto">
                                    {bulkErrors.map((err, index) => (
                                        <div key={`${err}-${index}`}>{err}</div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {message && (
                            <div className={`p-4 rounded-2xl text-xs font-semibold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                                {message.text}
                            </div>
                        )}
                    </div>

                    <div className="xl:col-span-3">
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[700px] flex flex-col">
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPreview(false)}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${!preview ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-600'}`}
                                    >
                                        <FileText size={16} /> Edit
                                    </button>
                                    <button
                                        onClick={() => setPreview(true)}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${preview ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-600'}`}
                                    >
                                        <Eye size={16} /> Preview
                                    </button>
                                </div>
                                {mode === 'module' && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleAddSection('markdown')}
                                            className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 border border-slate-200 hover:bg-white"
                                        >
                                            <Plus size={14} className="inline" /> Section
                                        </button>
                                        <button
                                            onClick={() => handleAddSection('code')}
                                            className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 border border-slate-200 hover:bg-white"
                                        >
                                            <Code2 size={14} className="inline" /> Code
                                        </button>
                                        <button
                                            onClick={() => handleAddSection('callout')}
                                            className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 border border-slate-200 hover:bg-white"
                                        >
                                            <BookOpen size={14} className="inline" /> Callout
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 p-6 lg:p-8">
                                {loading ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                                        <Loader2 className="animate-spin text-indigo-500" size={32} />
                                        <p className="text-sm font-medium">Loading content...</p>
                                    </div>
                                ) : mode === 'module' ? (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <input
                                                value={doc.title}
                                                onChange={(e) => setDoc((prev) => ({ ...prev, title: e.target.value }))}
                                                className="md:col-span-2 w-full text-2xl font-black text-slate-900 border border-slate-200 rounded-2xl p-4"
                                                placeholder="Module Title"
                                            />
                                            <div className="grid grid-cols-2 gap-2">
                                                <select
                                                    value={doc.difficulty}
                                                    onChange={(e) => setDoc((prev) => ({ ...prev, difficulty: e.target.value as ContentDocument['difficulty'] }))}
                                                    className="w-full border border-slate-200 rounded-2xl p-3 text-sm font-bold"
                                                >
                                                    <option>Beginner</option>
                                                    <option>Intermediate</option>
                                                    <option>Advanced</option>
                                                </select>
                                                <input
                                                    value={doc.readTime}
                                                    onChange={(e) => setDoc((prev) => ({ ...prev, readTime: e.target.value }))}
                                                    className="w-full border border-slate-200 rounded-2xl p-3 text-sm font-bold"
                                                    placeholder="8 min"
                                                />
                                            </div>
                                        </div>

                                        {doc.sections.map((section, index) => (
                                            <div
                                                key={`${section.type}-${index}`}
                                                className={`border rounded-2xl p-4 space-y-3 transition-all ${dragOverIndex === index ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-slate-200'} ${draggingIndex === index ? 'opacity-70' : ''}`}
                                                onDragOver={(event) => handleDragOver(index, event)}
                                                onDrop={(event) => handleDrop(index, event)}
                                            >
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="flex items-center gap-1 text-slate-400 cursor-grab"
                                                            draggable
                                                            onDragStart={(event) => handleDragStart(index, event)}
                                                            onDragEnd={handleDragEnd}
                                                        >
                                                            <GripVertical size={16} />
                                                            <span className="text-xs font-bold uppercase">{section.type}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => moveSection(index, Math.max(0, index - 1))}
                                                                className="text-slate-400 hover:text-slate-700"
                                                            >
                                                                <ArrowUp size={14} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => moveSection(index, Math.min(doc.sections.length - 1, index + 1))}
                                                                className="text-slate-400 hover:text-slate-700"
                                                            >
                                                                <ArrowDown size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleInsertCodeAfter(index)}
                                                            className="text-xs font-bold text-indigo-600 flex items-center gap-1"
                                                        >
                                                            <PlusSquare size={14} /> Insert Code Example
                                                        </button>
                                                        <button
                                                            onClick={() => handleRemoveSection(index)}
                                                            className="text-xs font-bold text-rose-500"
                                                        >
                                                            <Trash2 size={14} className="inline" /> Remove
                                                        </button>
                                                    </div>
                                                </div>
                                                <input
                                                    value={section.title || ''}
                                                    onChange={(e) => updateSection(index, { title: e.target.value })}
                                                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold"
                                                    placeholder="Section title"
                                                />
                                                {section.type === 'code' && (
                                                    <input
                                                        value={section.language || ''}
                                                        onChange={(e) => updateSection(index, { language: e.target.value })}
                                                        className="w-full border border-slate-200 rounded-xl p-3 text-sm"
                                                        placeholder="language (e.g., ts, python)"
                                                    />
                                                )}
                                                <textarea
                                                    value={section.body || ''}
                                                    onChange={(e) => updateSection(index, { body: e.target.value })}
                                                    className="w-full border border-slate-200 rounded-xl p-4 text-sm min-h-[160px]"
                                                    placeholder="Write content here..."
                                                />
                                            </div>
                                        ))}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <textarea
                                                value={doc.mindMap || ''}
                                                onChange={(e) => setDoc((prev) => ({ ...prev, mindMap: e.target.value }))}
                                                className="w-full border border-slate-200 rounded-2xl p-4 text-sm min-h-[160px]"
                                                placeholder="Mind map (mermaid or text)"
                                            />
                                            <textarea
                                                value={doc.revision || ''}
                                                onChange={(e) => setDoc((prev) => ({ ...prev, revision: e.target.value }))}
                                                className="w-full border border-slate-200 rounded-2xl p-4 text-sm min-h-[160px]"
                                                placeholder="Quick revision bullets"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <textarea
                                        value={rawContent}
                                        onChange={(e) => setRawContent(e.target.value)}
                                        className="w-full h-[600px] border border-slate-200 rounded-2xl p-6 font-mono text-sm"
                                        placeholder={mode === 'chapters' ? 'Paste chapter JSON array...' : 'Paste topic JSON array...'}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
