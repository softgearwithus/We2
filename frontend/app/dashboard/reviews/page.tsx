'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Star, User } from 'lucide-react';

interface Review {
    id: string;
    title: string;
    description: string;
    type: string;
    score: number;
    isFeatured: boolean;
    createdAt: string;
}

export default function ReviewsPage() {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const response = await fetch(`${apiBase}/reviews/published`);
            if (response.ok) {
                const data = await response.json();
                setReviews(data || []);
            }
            setLoading(false);
        };
        load();
    }, [apiBase]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-indigo-600" size={40} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 lg:p-10">
            <div className="max-w-5xl mx-auto">
                <div className="mb-10">
                    <h1 className="text-3xl font-black text-slate-900">Code Reviews</h1>
                    <p className="text-slate-500">Published reviews from mentors and admins.</p>
                </div>

                {reviews.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500">
                        No reviews published yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {reviews.map((review) => (
                            <div key={review.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
                                        {review.type.replace('_', ' ')}
                                    </div>
                                    {review.isFeatured && (
                                        <div className="inline-flex items-center gap-1 text-amber-600 text-xs font-bold">
                                            <Star size={14} /> Featured
                                        </div>
                                    )}
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 mb-2">{review.title}</h2>
                                <p className="text-slate-500 text-sm mb-4">{review.description}</p>
                                <div className="flex items-center justify-between text-sm text-slate-500">
                                    <div className="inline-flex items-center gap-2">
                                        <CheckCircle2 size={16} className="text-emerald-500" /> Score {review.score}
                                    </div>
                                    <div className="inline-flex items-center gap-2">
                                        <User size={14} /> {new Date(review.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
