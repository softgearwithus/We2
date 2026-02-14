'use client';

import React, { useEffect, useRef } from 'react';

interface Dot {
    x: number;
    y: number;
    baseOpacity: number;
    opacity: number;
    targetOpacity: number;
    speed: number;
}

export default function DotBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: -1000, y: -1000 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let dots: Dot[] = [];

        // Configuration
        const spacing = 25;
        const dotRadius = 1;
        const baseColor = '148, 163, 184'; // Slate-400 equivalent RGB

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        };

        const resize = () => {
            if (!canvas) return;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initDots();
        };

        const initDots = () => {
            dots = [];
            const cols = Math.ceil(canvas.width / spacing);
            const rows = Math.ceil(canvas.height / spacing);

            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    dots.push({
                        x: i * spacing,
                        y: j * spacing,
                        baseOpacity: 0.15,
                        opacity: 0.15,
                        targetOpacity: 0.15,
                        speed: 0.005 + Math.random() * 0.01
                    });
                }
            }
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            dots.forEach(dot => {
                // Distance from mouse
                const dx = mouseRef.current.x - dot.x;
                const dy = mouseRef.current.y - dot.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // Interaction: Slightly higher opacity near mouse
                let isHovered = dist < 120;

                // Update Target Opacity
                if (isHovered) {
                    dot.targetOpacity = 0.5; // Subtle increase
                } else {
                    // Random twinkling
                    if (Math.abs(dot.opacity - dot.targetOpacity) < 0.01) {
                        if (Math.random() < 0.0005) { // Rare twinkle
                            dot.targetOpacity = 0.6;
                        } else {
                            dot.targetOpacity = dot.baseOpacity;
                        }
                    }
                }

                // Smooth transition
                if (dot.opacity < dot.targetOpacity) {
                    dot.opacity += dot.speed * 2;
                } else {
                    dot.opacity -= dot.speed;
                }

                // Clamp
                dot.opacity = Math.max(0, Math.min(1, dot.opacity));

                // Draw
                ctx.beginPath();
                ctx.arc(dot.x, dot.y, dotRadius, 0, Math.PI * 2);

                // Always use base slate color, varying opacity
                ctx.fillStyle = `rgba(${baseColor}, ${dot.opacity})`;

                ctx.fill();
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        resize();
        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);
        draw();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="absolute inset-0 z-0 overflow-hidden bg-[#fafafa]">
            {/* Canvas for Dots ONLY */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
            />
        </div>
    );
}
