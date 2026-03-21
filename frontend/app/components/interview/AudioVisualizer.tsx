'use client';

import { useEffect, useRef } from 'react';

export default function AudioVisualizer({ isActive }: { isActive: boolean }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        let bars = 20;

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (!isActive) {
                // Static Line
                ctx.fillStyle = '#cbd5e1'; // slate-300
                for (let i = 0; i < bars; i++) {
                    const height = 4;
                    const x = (canvas.width / bars) * i;
                    const y = (canvas.height - height) / 2;
                    ctx.fillRect(x, y, 10, height);
                }
                return;
            }

            // Animated Bars
            ctx.fillStyle = '#6366f1'; // slate-500
            for (let i = 0; i < bars; i++) {
                // Random height for simulation
                const height = Math.random() * 40 + 10;
                const x = (canvas.width / bars) * i;
                const y = (canvas.height - height) / 2;

                // Rounded rect
                ctx.beginPath();
                ctx.roundRect(x, y, 8, height, 4);
                ctx.fill();
            }

            animationId = requestAnimationFrame(animate);
        };

        // Slow down animation for cleaner look
        const loop = () => {
            setTimeout(() => {
                if (isActive) requestAnimationFrame(animate);
            }, 100);
        }

        if (isActive) {
            animate();
        } else {
            // Draw static once
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#cbd5e1';
            for (let i = 0; i < bars; i++) {
                const height = 4;
                const x = (canvas.width / bars) * i;
                const y = (canvas.height - height) / 2;
                ctx.roundRect(x, y, 8, height, 4);
                ctx.fill();
            }
        }

        return () => cancelAnimationFrame(animationId);
    }, [isActive]);

    return (
        <canvas
            ref={canvasRef}
            width={300}
            height={60}
            className="w-full h-16"
        />
    );
}
