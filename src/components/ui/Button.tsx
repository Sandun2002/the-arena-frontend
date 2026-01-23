"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import { cn } from "@/lib/utils"; // We'll create this utility in a second

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "outline" | "ghost";
  className?: string;
}

export default function Button({ 
  children, 
  href, 
  onClick, 
  variant = "primary", 
  className 
}: ButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const btn = buttonRef.current;
    if (!btn) return;

    // Magnetic Effect Logic
    const xTo = gsap.quickTo(btn, "x", { duration: 0.4, ease: "power3.out" });
    const yTo = gsap.quickTo(btn, "y", { duration: 0.4, ease: "power3.out" });

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { left, top, width, height } = btn.getBoundingClientRect();
      const x = (clientX - (left + width / 2)) * 0.3; // Strength of magnet
      const y = (clientY - (top + height / 2)) * 0.3;
      xTo(x);
      yTo(y);
    };

    const handleMouseLeave = () => {
      xTo(0);
      yTo(0);
    };

    btn.addEventListener("mousemove", handleMouseMove);
    btn.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      btn.removeEventListener("mousemove", handleMouseMove);
      btn.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, { scope: buttonRef });

  // Styles based on variant
  const baseStyles = "relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-bold transition-all duration-300 rounded-full group";
  
  const variants = {
    primary: "bg-emerald-500 text-black hover:bg-emerald-400",
    outline: "border border-zinc-700 text-white hover:border-emerald-500 hover:text-emerald-500",
    ghost: "text-zinc-400 hover:text-white"
  };

  const content = (
    <div ref={buttonRef} className={cn(baseStyles, variants[variant], className)}>
      <span ref={textRef} className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return <button onClick={onClick}>{content}</button>;
}