'use client';

import React from 'react';
import { cn } from '@/app/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export default function Button({
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props
}: ButtonProps) {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

    const variants = {
        primary: "bg-brand-orange text-white hover:bg-brand-orange-hover shadow-subtle hover:shadow-md border border-transparent rounded-lg",
        secondary: "bg-brand-black text-white hover:bg-gray-800 shadow-subtle hover:shadow-md border border-transparent rounded-lg",
        outline: "bg-white text-brand-black border border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-lg",
        ghost: "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-brand-black rounded-lg",
        danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-transparent rounded-lg"
    };

    const sizes = {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-5 text-sm",
        lg: "h-14 px-8 text-base font-bold"
    };

    return (
        <button
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            disabled={isLoading || disabled}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
        </button>
    );
}
