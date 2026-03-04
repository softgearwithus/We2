import { useEffect, useState, useCallback } from 'react';
import Vapi from '@vapi-ai/web';

const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || '');

type VapiEventHandler = (...args: any[]) => void;

const onVapiEvent = (event: string, handler: VapiEventHandler) => {
    (vapi as unknown as { on: (event: string, handler: VapiEventHandler) => void }).on(event, handler);
};

export type VapiStatus = 'idle' | 'loading' | 'active' | 'speaking' | 'listening';

export const useVapi = () => {
    const [status, setStatus] = useState<VapiStatus>('idle');
    const [isMuted, setIsMuted] = useState(false);
    const [volumeLevel, setVolumeLevel] = useState(0); // 0 to 1
    const [messages, setMessages] = useState<any[]>([]);
    const [callId, setCallId] = useState<string | null>(null);

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Event Listeners
        onVapiEvent('call-start', (payload) => {
            setStatus('active');
            setError(null);
            const id = payload?.call?.id || payload?.id;
            if (id) setCallId(id);
        });
        onVapiEvent('call-end', () => setStatus('idle'));

        onVapiEvent('speech-start', (payload) => {
            setStatus(payload?.role === 'user' ? 'listening' : 'speaking');
        });
        onVapiEvent('speech-end', () => setStatus('active'));

        onVapiEvent('volume-level', (level) => setVolumeLevel(level));

        onVapiEvent('message', (message) => {
            // console.log('Vapi Message:', message); 

            const messageCallId = message?.call?.id || message?.callId;
            if (messageCallId) {
                setCallId(prev => prev || messageCallId);
            }

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
                    // Keep only user/assistant turns and ignore system prompt echoes
                    const formattedMessages = conversation
                        .filter((m: any) => m?.role === 'user' || m?.role === 'assistant')
                        .map((m: any) => ({
                            role: m.role,
                            text: m.content
                        }));
                    setMessages(formattedMessages);
                }
            }
        });

        onVapiEvent('error', (e) => {
            console.error('Vapi Error:', e);
            setStatus('idle');
            // Check for specific "ejection" or common Vapi errors
            const errorMessage = typeof e === 'string' ? e : (e?.message || JSON.stringify(e));
            if (errorMessage.includes('ejection') || errorMessage.includes('ended')) {
                setError('Call ended remotely.');
            } else {
                setError(errorMessage);
            }
        });

        return () => {
            vapi.removeAllListeners();
        };
    }, []);

    const startInterview = useCallback(async (assistantId: string, metadata?: Record<string, any>) => {
        setStatus('loading');
        setError(null);
        try {
            await vapi.start(assistantId, metadata ? { metadata } : undefined);
        } catch (error: any) {
            console.error('Failed to start Vapi:', error);
            setStatus('idle');
            setError(error.message || 'Failed to start interview');
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
        callId,
        error,
        startInterview,
        stopInterview,
        toggleMute
    };
};
