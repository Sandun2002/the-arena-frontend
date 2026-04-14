"use client";

import { useRef, useEffect, ReactNode, CSSProperties } from "react";

interface HScrollAreaProps {
    children: ReactNode;
    className?: string;
    style?: CSSProperties;
}

const FRICTION = 0.93; // higher = longer coast, lower = quicker stop

/**
 * Horizontal scroll container with click-drag + momentum inertia.
 * data-lenis-prevent stops Lenis from interfering.
 */
export default function HScrollArea({ children, className, style }: HScrollAreaProps) {
    const ref = useRef<HTMLDivElement>(null);
    const dragging = useRef(false);
    const startX = useRef(0);
    const startScroll = useRef(0);
    const velX = useRef(0);
    const lastX = useRef(0);
    const lastT = useRef(0);
    const rafId = useRef<number | null>(null);

    const cancelMomentum = () => {
        if (rafId.current !== null) {
            cancelAnimationFrame(rafId.current);
            rafId.current = null;
        }
    };

    const coast = () => {
        if (!ref.current || Math.abs(velX.current) < 0.4) {
            velX.current = 0;
            return;
        }
        ref.current.scrollLeft -= velX.current;
        velX.current *= FRICTION;
        rafId.current = requestAnimationFrame(coast);
    };

    useEffect(() => () => cancelMomentum(), []);

    const onMouseDown = (e: React.MouseEvent) => {
        // only main button
        if (e.button !== 0) return;
        cancelMomentum();
        dragging.current = true;
        startX.current = e.pageX;
        startScroll.current = ref.current!.scrollLeft;
        lastX.current = e.pageX;
        lastT.current = performance.now();
        velX.current = 0;
        if (ref.current) ref.current.style.cursor = "grabbing";
        e.preventDefault(); // prevent text selection
    };

    const onMouseMove = (e: React.MouseEvent) => {
        if (!dragging.current) return;
        const now = performance.now();
        const dt = now - lastT.current;
        if (dt > 0) {
            // velocity in px/frame (normalized to 16ms)
            velX.current = ((e.pageX - lastX.current) / dt) * 16;
        }
        lastX.current = e.pageX;
        lastT.current = now;
        ref.current!.scrollLeft = startScroll.current - (e.pageX - startX.current);
    };

    const stopDrag = () => {
        if (!dragging.current) return;
        dragging.current = false;
        if (ref.current) ref.current.style.cursor = "grab";
        // kick off inertia coast
        rafId.current = requestAnimationFrame(coast);
    };

    return (
        <div
            ref={ref}
            className={className}
            style={{ cursor: "grab", userSelect: "none", ...style }}
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
