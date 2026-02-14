import { useEffect, useState, useCallback, useRef } from 'react';
import Vapi from '@vapi-ai/web';

const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || 'demo-public-key');

export type VapiStatus = 'idle' | 'loading' | 'active' | 'speaking' | 'listening';

export const useVapi = () => {
    const [status, setStatus] = useState<VapiStatus>('idle');
    const [isMuted, setIsMuted] = useState(false);
    const [volumeLevel, setVolumeLevel] = useState(0); // 0 to 1
    const [messages, setMessages] = useState<any[]>([]);

    useEffect(() => {
        // Event Listeners
        vapi.on('call-start', () => setStatus('active'));
        vapi.on('call-end', () => setStatus('idle'));

        vapi.on('speech-start', () => setStatus('speaking')); // User or AI speaking? Vapi events can distinguish, usually generic speech-start
        vapi.on('speech-end', () => setStatus('active'));

        vapi.on('volume-level', (level) => setVolumeLevel(level));

        vapi.on('message', (message) => {
            console.log('Vapi Message:', message);
            if (message.type === 'transcript' && message.transcriptType === 'final') {
                setMessages(prev => [...prev, { role: 'user', text: message.transcript }]);
            }
            if (message.type === 'function-call' && message.functionCall.name === 'modelOutput') {
                // Capture AI response if sent via function call (depends on config)
            }
        });

        vapi.on('error', (e) => {
            console.error('Vapi Error:', e);
            setStatus('idle');
        });

        return () => {
            vapi.removeAllListeners();
        };
    }, []);

    const startInterview = useCallback(async (assistantId: string) => {
        setStatus('loading');
        try {
            await vapi.start(assistantId);
        } catch (error) {
            console.error('Failed to start Vapi:', error);
            setStatus('idle');
        }
    }, []);

    const stopInterview = useCallback(() => {
        vapi.stop();
    }, []);

    const toggleMute = useCallback(() => {
        const newMuteState = !isMuted;
        vapi.setMuted(newMuteState);
        setIsMuted(newMuteState);
    }, [isMuted]);

    return {
        status,
        isMuted,
        volumeLevel,
        messages,
        startInterview,
        stopInterview,
        toggleMute
    };
};
