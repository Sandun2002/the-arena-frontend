"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Clock, ChevronDown } from "lucide-react";

const HEADER_HEIGHT = 72; // px — keep dropdown below sticky nav

interface TimePickerProps {
    value: string;               // "HH:00" 24-hour format
    onChange: (value: string) => void;
    label?: string;
    disablePast?: boolean;
    sameDay?: boolean;
    className?: string;
    id?: string;
}

export default function TimePicker({
    value,
    onChange,
    label,
    disablePast = false,
    sameDay = false,
    className = "",
    id,
}: TimePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
    const [mounted, setMounted] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => { setMounted(true); }, []);

    const parseHour = (t: string) => {
        const h = parseInt((t || "00:00").split(":")[0], 10);
        return isNaN(h) ? 0 : h;
    };

    const selectedHour = parseHour(value);
    const currentHour = new Date().getHours();

    const isHourDisabled = (h: number) => disablePast && sameDay && h <= currentHour;

    const formatDisplay = (h: number) => {
        const ampm = h >= 12 ? "PM" : "AM";
        const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
        return `${h12.toString().padStart(2, "0")}:00 ${ampm}`;
    };

    const handleHourSelect = (h: number) => {
        if (isHourDisabled(h)) return;
        onChange(`${h.toString().padStart(2, "0")}:00`);
    };

    const calculatePosition = useCallback(() => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const DROPDOWN_W = Math.max(rect.width, 280);
        const DROPDOWN_H = 260;

        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top - HEADER_HEIGHT;
        const openUpward = spaceBelow < DROPDOWN_H && spaceAbove > spaceBelow;

        // absolute so it scrolls with page
        const scrollY = window.scrollY;
        let top = openUpward
            ? rect.top + scrollY - DROPDOWN_H - 4
            : rect.bottom + scrollY + 4;

        // Never render above header
        const minTop = HEADER_HEIGHT + scrollY;
        if (top < minTop) top = minTop;

        let left = rect.left + window.scrollX;
        if (left + DROPDOWN_W > window.innerWidth - 8) {
            left = window.innerWidth - DROPDOWN_W - 8;
        }
        if (left < 8) left = 8;

        setDropdownStyle({ position: "absolute", top, left, width: DROPDOWN_W, zIndex: 9999 });
    }, []);

    const handleOpen = () => {
        if (!isOpen) calculatePosition();
        setIsOpen(p => !p);
    };

    useEffect(() => {
        if (!isOpen) return;
        const onOutside = (e: MouseEvent | TouchEvent) => {
            const t = e.target as Node;
            if (!triggerRef.current?.contains(t) && !dropdownRef.current?.contains(t)) setIsOpen(false);
        };
        const onScroll = () => calculatePosition();
        document.addEventListener("mousedown", onOutside);
        document.addEventListener("touchstart", onOutside);
        window.addEventListener("scroll", onScroll, true);
        window.addEventListener("resize", onScroll);
        return () => {
            document.removeEventListener("mousedown", onOutside);
            document.removeEventListener("touchstart", onOutside);
            window.removeEventListener("scroll", onScroll, true);
            window.removeEventListener("resize", onScroll);
        };
    }, [isOpen, calculatePosition]);

    const amHours = Array.from({ length: 12 }, (_, i) => i);
    const pmHours = Array.from({ length: 12 }, (_, i) => i + 12);

    const HourBtn = ({ h }: { h: number }) => {
        const disabled = isHourDisabled(h);
        const active = selectedHour === h;
        const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
        return (
            <button
                type="button"
                disabled={disabled}
                onClick={() => handleHourSelect(h)}
                className={`text-center py-2 rounded-lg text-xs font-bold transition-all ${
                    disabled ? "text-faint cursor-not-allowed"
                    : active ? "bg-emerald-500 text-black shadow-[0_0_10px_rgba(80,200,120,0.4)]"
                    : "text-secondary hover:bg-surface-overlay hover:text-primary"
                }`}
            >
                {h12.toString().padStart(2, "0")}
            </button>
        );
    };

    const dropdown = isOpen && mounted ? createPortal(
        <div ref={dropdownRef} style={dropdownStyle}
            className="bg-surface-raised border border-subtle rounded-2xl shadow-2xl shadow-[var(--shadow-elevation)] overflow-hidden"
            data-lenis-prevent>
            <div className="p-4 space-y-3">
                <p className="text-[10px] font-bold text-muted uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-4 h-px bg-subtle inline-block" />AM<span className="w-full h-px bg-subtle inline-block" />
                </p>
                <div className="grid grid-cols-6 gap-1.5">
                    {amHours.map(h => <HourBtn key={h} h={h} />)}
                </div>
                <p className="text-[10px] font-bold text-muted uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-4 h-px bg-subtle inline-block" />PM<span className="w-full h-px bg-subtle inline-block" />
                </p>
                <div className="grid grid-cols-6 gap-1.5">
                    {pmHours.map(h => <HourBtn key={h} h={h} />)}
                </div>
                <div className="border-t border-default pt-3 flex items-center justify-between">
                    <span className="text-muted text-xs">Selected:</span>
                    <span className="text-emerald-400 font-bold text-sm">{value ? formatDisplay(selectedHour) : "—"}</span>
                    <button type="button" onClick={() => setIsOpen(false)}
                        className="text-xs font-bold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-black px-3 py-1.5 rounded-lg transition-all">
                        Done
                    </button>
                </div>
            </div>
        </div>,
        document.body
    ) : null;

    return (
        <div className={`relative ${className}`}>
            {label && <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-2">{label}</label>}
            <button id={id} ref={triggerRef} type="button" onClick={handleOpen}
                className={`w-full flex items-center gap-3 bg-surface-inset border rounded-xl px-4 py-3 text-primary transition-all group ${
                    isOpen ? "border-emerald-500 shadow-[0_0_12px_rgba(80,200,120,0.15)]" : "border-subtle hover:border-emerald-500/40"
                }`}>
                <Clock className={`w-4 h-4 transition-colors ${isOpen ? "text-emerald-500" : "text-muted group-hover:text-secondary"}`} />
                <span className="flex-1 text-left font-medium text-sm">{value ? formatDisplay(selectedHour) : "Select time"}</span>
                <ChevronDown className={`w-4 h-4 text-muted transition-transform duration-200 ${isOpen ? "rotate-180 text-emerald-500" : ""}`} />
            </button>
            {dropdown}
        </div>
    );
}
