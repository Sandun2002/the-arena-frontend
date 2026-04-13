"use client";

import { useRef, useEffect, ReactNode, CSSProperties } from "react";

interface HScrollAreaProps {
    children: ReactNode;
    className?: string;
    style?: CSSProperties;
}

/**
 * Horizontal scroll container that:
 * - Converts vertical mouse-wheel delta to horizontal scroll (non-passive wheel listener)
 * - Enables click-drag scrolling with a grab cursor
 * - Carries data-lenis-prevent so Lenis doesn't swallow wheel events
 */
export default function HScrollArea({ children, className, style }: HScrollAreaProps) {
    const ref = useRef<HTMLDivElement>(null);
    const dragging = useRef(false);
    const startX = useRef(0);
    const startScroll = useRef(0);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const onWheel = (e: WheelEvent) => {
            // If the user is scrolling more horizontally already, let it pass
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
            e.preventDefault();
            el.scrollLeft += e.deltaY;
        };

        el.addEventListener("wheel", onWheel, { passive: false });
        return () => el.removeEventListener("wheel", onWheel);
    }, []);

    const onMouseDown = (e: React.MouseEvent) => {
        dragging.current = true;
        startX.current = e.pageX;
        startScroll.current = ref.current!.scrollLeft;
        if (ref.current) ref.current.style.cursor = "grabbing";
    };

    const onMouseMove = (e: React.MouseEvent) => {
        if (!dragging.current) return;
        const dx = e.pageX - startX.current;
        if (ref.current) ref.current.scrollLeft = startScroll.current - dx;
    };

    const stopDrag = () => {
        dragging.current = false;
        if (ref.current) ref.current.style.cursor = "grab";
    };

    return (
        <div
            ref={ref}
            className={className}
            style={{ cursor: "grab", ...style }}
            data-lenis-prevent
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={stopDrag}
            onMouseLeave={stopDrag}
        >
            {children}
        </div>
    );
}
