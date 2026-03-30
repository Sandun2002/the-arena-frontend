"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

const HEADER_HEIGHT = 72;
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

interface DatePickerProps {
    /** YYYY-MM-DD string or empty string */
    value: string;
    onChange: (value: string) => void;
    label?: string;
    /** Block dates before today */
    disablePast?: boolean;
    /** Block dates after today */
    disableFuture?: boolean;
    /** Minimum selectable date (YYYY-MM-DD) */
    minDate?: string;
    placeholder?: string;
    className?: string;
    id?: string;
}

function toYMD(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseYMD(s: string): Date | null {
    if (!s) return null;
    const [y, m, d] = s.split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
}

export default function DatePicker({
    value,
    onChange,
    label,
    disablePast = false,
    disableFuture = false,
    minDate,
    placeholder = "Select date",
    className = "",
    id,
}: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
    const [mounted, setMounted] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayYMD = toYMD(today);

    const selectedDate = parseYMD(value);
    const [viewYear, setViewYear] = useState(selectedDate?.getFullYear() ?? today.getFullYear());
    const [viewMonth, setViewMonth] = useState(selectedDate?.getMonth() ?? today.getMonth());

    useEffect(() => { setMounted(true); }, []);

    // Sync calendar view when value changes externally
    useEffect(() => {
        const d = parseYMD(value);
        if (d) { setViewYear(d.getFullYear()); setViewMonth(d.getMonth()); }
    }, [value]);

    const formatDisplay = (ymd: string) => {
        const d = parseYMD(ymd);
        if (!d) return placeholder;
        return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
    };

    const isDayDisabled = (ymd: string) => {
        if (disablePast && ymd < todayYMD) return true;
        if (disableFuture && ymd > todayYMD) return true;
        if (minDate && ymd < minDate) return true;
        return false;
    };

    const handleDaySelect = (ymd: string) => {
        if (isDayDisabled(ymd)) return;
        onChange(ymd);
        setIsOpen(false);
    };

    // Build calendar grid
    const buildDays = () => {
        const first = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
        const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
        const cells: (string | null)[] = Array(first).fill(null);
        for (let d = 1; d <= daysInMonth; d++) {
            cells.push(`${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
        }
        // Pad to complete last week row
        while (cells.length % 7 !== 0) cells.push(null);
        return cells;
    };

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    const calculatePosition = useCallback(() => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const DROPDOWN_W = Math.max(rect.width, 300);
        const DROPDOWN_H = 340;

        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top - HEADER_HEIGHT;
        const openUpward = spaceBelow < DROPDOWN_H && spaceAbove > spaceBelow;

        const scrollY = window.scrollY;
        let top = openUpward ? rect.top + scrollY - DROPDOWN_H - 4 : rect.bottom + scrollY + 4;
        const minTop = HEADER_HEIGHT + scrollY;
        if (top < minTop) top = minTop;

        let left = rect.left + window.scrollX;
        if (left + DROPDOWN_W > window.innerWidth - 8) left = window.innerWidth - DROPDOWN_W - 8;
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

    const cells = buildDays();

    const dropdown = isOpen && mounted ? createPortal(
        <div ref={dropdownRef} style={dropdownStyle}
            className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden"
            data-lenis-prevent>
            <div className="p-4">

                {/* Month/Year Navigation */}
                <div className="flex items-center justify-between mb-4">
                    <button type="button" onClick={prevMonth}
                        className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-bold text-white">
                        {MONTHS[viewMonth]} {viewYear}
                    </span>
                    <button type="button" onClick={nextMonth}
                        className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Day-of-week headers */}
                <div className="grid grid-cols-7 mb-1">
                    {DAYS.map(d => (
                        <div key={d} className="text-center text-[10px] font-bold text-zinc-600 uppercase py-1">{d}</div>
                    ))}
                </div>

                {/* Day Grid */}
                <div className="grid grid-cols-7 gap-0.5">
                    {cells.map((ymd, i) => {
                        if (!ymd) return <div key={`empty-${i}`} />;
                        const disabled = isDayDisabled(ymd);
                        const isSelected = ymd === value;
                        const isToday = ymd === todayYMD;
                        const day = parseInt(ymd.split("-")[2], 10);
                        return (
                            <button
                                key={ymd}
                                type="button"
                                disabled={disabled}
                                onClick={() => handleDaySelect(ymd)}
                                className={`relative text-center py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    disabled
                                        ? "text-zinc-700 cursor-not-allowed"
                                        : isSelected
                                        ? "bg-emerald-500 text-black shadow-[0_0_10px_rgba(80,200,120,0.4)]"
                                        : isToday
                                        ? "text-emerald-400 ring-1 ring-emerald-500/40 hover:bg-zinc-800"
                                        : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                                }`}
                            >
                                {day}
                                {isToday && !isSelected && (
                                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="border-t border-zinc-800 mt-4 pt-3 flex items-center justify-between">
                    <span className="text-zinc-500 text-xs">Selected:</span>
                    <span className="text-emerald-400 font-bold text-xs">{value ? formatDisplay(value) : "—"}</span>
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
            {label && <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-2">{label}</label>}
            <button id={id} ref={triggerRef} type="button" onClick={handleOpen}
                className={`w-full flex items-center gap-3 bg-black/50 border rounded-xl px-4 py-3 text-white transition-all group ${
                    isOpen ? "border-emerald-500 shadow-[0_0_12px_rgba(80,200,120,0.15)]" : "border-zinc-700 hover:border-zinc-600"
                }`}>
                <Calendar className={`w-4 h-4 transition-colors flex-shrink-0 ${isOpen ? "text-emerald-500" : "text-zinc-500 group-hover:text-zinc-400"}`} />
                <span className={`flex-1 text-left font-medium text-sm ${!value ? "text-zinc-500" : "text-white"}`}>
                    {value ? formatDisplay(value) : placeholder}
                </span>
                <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-200 flex-shrink-0 ${isOpen ? "rotate-180 text-emerald-500" : ""}`} />
            </button>
            {dropdown}
        </div>
    );
}
