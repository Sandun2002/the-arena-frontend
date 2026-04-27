
"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    size?: "sm" | "md" | "lg" | "xl";
}

export default function Modal({ isOpen, onClose, children, title, size = "md" }: ModalProps) {
    const [mounted, setMounted] = useState(false);
    const [animateIn, setAnimateIn] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            requestAnimationFrame(() => setAnimateIn(true));
        } else {
            document.body.style.overflow = "unset";
            setAnimateIn(false);
        }
    }, [isOpen]);

    // Handle escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    if (!mounted || !isOpen) return null;

    const sizeClasses = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-lenis-prevent>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-backdrop backdrop-blur-sm transition-opacity duration-300 ${animateIn ? "opacity-100" : "opacity-0"}`}
                onClick={onClose}
            />

            {/* Content */}
            <div
                className={`
          relative w-full ${sizeClasses[size]} 
          bg-surface-raised border border-default rounded-2xl shadow-2xl 
          transform transition-all duration-300 ease-out 
          ${animateIn ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"}
        `}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-default">
                    <h2 className="text-xl font-bold text-primary">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-muted hover:text-primary hover:bg-surface-overlay rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto max-h-[80vh]">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
}
