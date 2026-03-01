import { useState, useEffect } from 'react';
import { getActiveToken } from '../lib/auth-storage';

export interface UserCredits {
    plan: string;
    audioDrills: { used: number; limit: number; remaining: number };
    videoSimulations: { used: number; limit: number; remaining: number };
    resumeScans: { used: number; limit: number; remaining: number };
}

export function useCredits() {
    const [credits, setCredits] = useState<UserCredits | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchCredits = async () => {
        try {
            setIsLoading(true);
            const token = getActiveToken();
            if (!token) throw new Error('No auth token');

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/credits`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error('Failed to fetch credits');

            const data = await res.json();
            setCredits(data);
        } catch (err: any) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCredits();
    }, []);

    return { credits, isLoading, error, refetch: fetchCredits };
}
