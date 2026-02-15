import { useEffect, useState, useCallback, useRef } from 'react';
import Vapi from '@vapi-ai/web';

const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || '');

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
            // console.log('Vapi Message:', message); 

            // Only use transcript for immediate user feedback if it's new
            if (message.type === 'transcript' && message.transcriptType === 'final') {
                setMessages(prev => {
                    const lastMsg = prev[prev.length - 1];
                    // Strict deduplication: Don't add if exact same text exists at end
                    if (lastMsg && lastMsg.role === 'user' && lastMsg.text === message.transcript) {
                        return prev;
                    }
                    return [...prev, { role: 'user', text: message.transcript }];
                });
            }

            // Sync with full conversation history when available to ensure consistency
            if (message.type === 'conversation-update') {
                const conversation = message.conversation;
                if (conversation && conversation.length > 0) {
                    // We'll trust Vapi's history but map it to our format
                    // This cleans up any partial/duplicate states
                    const formattedMessages = conversation.map((m: any) => ({
                        role: m.role,
                        text: m.content
                    }));
                    setMessages(formattedMessages);
                }
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
