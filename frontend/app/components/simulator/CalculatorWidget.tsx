'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Calculator as CalcIcon, GripHorizontal } from 'lucide-react';

interface CalculatorWidgetProps {
    onClose: () => void;
}

export default function CalculatorWidget({ onClose }: CalculatorWidgetProps) {
    const [display, setDisplay] = useState('0');
    const [equation, setEquation] = useState('');
    const [position, setPosition] = useState({ x: 100, y: 100 });
    const [isDragging, setIsDragging] = useState(false);

    const dragRef = useRef<{ startX: number; startY: number; initX: number; initY: number } | null>(null);

    // Draggable functionality
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            initX: position.x,
            initY: position.y
        };
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || !dragRef.current) return;
            const dx = e.clientX - dragRef.current.startX;
            const dy = e.clientY - dragRef.current.startY;
            setPosition({
                x: dragRef.current.initX + dx,
                y: dragRef.current.initY + dy
            });
        };

        const handleMouseUp = () => setIsDragging(false);

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    // Calculator Logic
    const handleNumber = (num: string) => {
        setDisplay(prev => prev === '0' || prev === 'Error' ? num : prev + num);
    };

    const handleOperator = (op: string) => {
        setEquation(display + ' ' + op + ' ');
        setDisplay('0');
    };

    const calculate = () => {
        try {
            // Safe eval approximation
            const fullEquation = equation + display;
            // eslint-disable-next-line no-new-func
            const result = new Function('return ' + fullEquation)();
            if (!isFinite(result) || isNaN(result)) throw new Error('Invalid');

            // Format to avoid long decimals
            const formatted = String(Math.round(result * 1000000) / 1000000);
            setDisplay(formatted);
            setEquation('');
        } catch (e) {
            setDisplay('Error');
            setEquation('');
        }
    };

    const handleClear = () => {
        setDisplay('0');
        setEquation('');
    };

    const handleDelete = () => {
        setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
    };

    return (
        <div
            className="fixed z-50 w-64 bg-[#f8f9fa] border border-[#ced4da] rounded-xl shadow-2xl overflow-hidden select-none"
            style={{ left: position.x, top: position.y }}
        >
            {/* Header / Drag Handle */}
            <div
                className="bg-[#343a40] text-white px-3 py-2 flex items-center justify-between cursor-move"
                onMouseDown={handleMouseDown}
            >
                <div className="flex items-center gap-2">
                    <CalcIcon size={14} />
                    <span className="text-xs font-bold tracking-wide uppercase">Calculator</span>
                </div>
                <div className="flex items-center gap-2">
                    <GripHorizontal size={14} className="opacity-50" />
                    <button onClick={onClose} className="hover:bg-red-500 rounded-full p-1 transition-colors">
                        <X size={14} />
                    </button>
                </div>
            </div>

            {/* Display */}
            <div className="p-4 bg-white border-b border-[#e9ecef]">
                <div className="text-right text-xs text-slate-400 h-4 mb-1 font-mono tracking-wider">{equation}</div>
                <div className="text-right text-3xl font-mono text-slate-800 tracking-tight truncate">{display}</div>
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-4 gap-[1px] bg-[#dee2e6] p-1">
                <button onClick={handleClear} className="bg-[#e9ecef] hover:bg-[#ced4da] transition p-3 font-bold text-rose-600 col-span-2 rounded-tl border">C</button>
                <button onClick={handleDelete} className="bg-[#e9ecef] hover:bg-[#ced4da] transition p-3 font-bold text-slate-800 border">Del</button>
                <button onClick={() => handleOperator('/')} className="bg-[#e9ecef] hover:bg-[#ced4da] transition p-3 font-bold text-slate-800 rounded-tr border">÷</button>

                <button onClick={() => handleNumber('7')} className="bg-white hover:bg-[#f8f9fa] transition p-3 font-bold text-slate-700 border">7</button>
                <button onClick={() => handleNumber('8')} className="bg-white hover:bg-[#f8f9fa] transition p-3 font-bold text-slate-700 border">8</button>
                <button onClick={() => handleNumber('9')} className="bg-white hover:bg-[#f8f9fa] transition p-3 font-bold text-slate-700 border">9</button>
                <button onClick={() => handleOperator('*')} className="bg-[#e9ecef] hover:bg-[#ced4da] transition p-3 font-bold text-slate-800 border">×</button>

                <button onClick={() => handleNumber('4')} className="bg-white hover:bg-[#f8f9fa] transition p-3 font-bold text-slate-700 border">4</button>
                <button onClick={() => handleNumber('5')} className="bg-white hover:bg-[#f8f9fa] transition p-3 font-bold text-slate-700 border">5</button>
                <button onClick={() => handleNumber('6')} className="bg-white hover:bg-[#f8f9fa] transition p-3 font-bold text-slate-700 border">6</button>
                <button onClick={() => handleOperator('-')} className="bg-[#e9ecef] hover:bg-[#ced4da] transition p-3 font-bold text-slate-800 border">−</button>

                <button onClick={() => handleNumber('1')} className="bg-white hover:bg-[#f8f9fa] transition p-3 font-bold text-slate-700 border">1</button>
                <button onClick={() => handleNumber('2')} className="bg-white hover:bg-[#f8f9fa] transition p-3 font-bold text-slate-700 border">2</button>
                <button onClick={() => handleNumber('3')} className="bg-white hover:bg-[#f8f9fa] transition p-3 font-bold text-slate-700 border">3</button>
                <button onClick={() => handleOperator('+')} className="bg-[#e9ecef] hover:bg-[#ced4da] transition p-3 font-bold text-slate-800 border">+</button>

                <button onClick={() => handleNumber('0')} className="bg-white hover:bg-[#f8f9fa] transition p-3 font-bold text-slate-700 col-span-2 rounded-bl border">0</button>
                <button onClick={() => handleNumber('.')} className="bg-white hover:bg-[#f8f9fa] transition p-3 font-bold text-slate-700 border">.</button>
                <button onClick={calculate} className="bg-slate-800 hover:bg-slate-900 transition p-3 font-bold text-white rounded-br border border-slate-700">=</button>
            </div>
        </div>
    );
}
