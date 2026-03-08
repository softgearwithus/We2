import { Problem } from '@/app/lib/problems';
import { ThumbsUp, ThumbsDown, Star, Share2 } from 'lucide-react';

const platformLabel = (platform?: string | null) => {
    if (platform === 'hackerrank') return 'HackerRank';
    if (platform === 'codeforces') return 'Codeforces';
    return 'LeetCode';
};

export default function ProblemDescription({ problem }: { problem: Problem }) {
    const getDifficultyColor = (diff: string) => {
        switch (diff) {
            case 'Easy': return 'text-emerald-500 bg-emerald-50';
            case 'Medium': return 'text-yellow-500 bg-yellow-50';
            case 'Hard': return 'text-red-500 bg-red-50';
            default: return 'text-slate-500';
        }
    };

    const externalUrl = problem.externalUrl || problem.leetcodeUrl;

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-xl font-bold text-slate-900 truncate mr-2">{problem.title}</h2>
                <div className="flex gap-2">
                    <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                        <Star size={18} />
                    </button>
                    <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                        <Share2 size={18} />
                    </button>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="flex items-center gap-4 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty}
                    </span>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                        <button className="flex items-center gap-1 hover:text-slate-700">
                            <ThumbsUp size={16} /> {problem.likes?.toLocaleString()}
                        </button>
                        <button className="flex items-center gap-1 hover:text-slate-700">
                            <ThumbsDown size={16} /> {problem.dislikes?.toLocaleString()}
                        </button>
                    </div>
                </div>

                {externalUrl && (
                    <a
                        href={externalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 mb-4"
                    >
                        Solve on {platformLabel(problem.platform)} <span className="material-symbols-outlined text-sm">open_in_new</span>
                    </a>
                )}

                {problem.companies && problem.companies.length > 0 && (
                    <div className="mb-6">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-2">Asked by</div>
                        <div className="flex flex-wrap gap-1.5">
                            {problem.companies.map((c) => (
                                <span key={c} className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                                    {c}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div
                    className="prose prose-slate max-w-none text-sm leading-relaxed mb-8 whitespace-pre-wrap break-words"
                    dangerouslySetInnerHTML={{ __html: problem.description }}
                />

                {problem.examples.map((ex, i) => (
                    <div key={i} className="mb-6">
                        <h3 className="text-sm font-bold text-slate-900 mb-2">Example {i + 1}:</h3>
                        <div className="bg-slate-50 border-l-4 border-slate-200 p-3 rounded-r-lg font-mono text-xs text-slate-700 whitespace-pre-wrap break-words">
                            <div className="mb-1"><span className="font-bold text-slate-900">Input:</span> {ex.input}</div>
                            <div className="mb-1"><span className="font-bold text-slate-900">Output:</span> {ex.output}</div>
                            {ex.explanation && (
                                <div><span className="font-bold text-slate-900">Explanation:</span> {ex.explanation}</div>
                            )}
                        </div>
                    </div>
                ))}

                <div className="mb-8">
                    <h3 className="text-sm font-bold text-slate-900 mb-2">Constraints:</h3>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            {problem.constraints.map((c, i) => (
                                <li key={i} className="text-xs font-mono text-slate-600 bg-slate-50 px-2 py-0.5 rounded whitespace-pre-wrap break-words">
                                    {c}
                                </li>
                            ))}
                        </ul>
                </div>
            </div>
        </div>
    );
}

