
import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "outline" | "ghost";
  className?: string;
}

export default function Button({
  children,
  href,
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  const buttonRef = useRef<HTMLElement>(null);
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
  const baseStyles = "relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-bold transition-all duration-300 rounded-full group disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-emerald-500 text-black hover:bg-emerald-400 border border-transparent",
    outline: "border border-zinc-700 text-white hover:border-emerald-500 hover:text-emerald-500 bg-transparent",
    ghost: "text-zinc-400 hover:text-white bg-transparent border border-transparent"
  };

  const spanContent = (
    <span ref={textRef} className="relative z-10 flex items-center gap-2 pointer-events-none">
      {children}
    </span>
  );

  if (href) {
    return (
      <Link
        href={href}
        ref={buttonRef as React.RefObject<HTMLAnchorElement>}
        className={cn(baseStyles, variants[variant], className)}
      >
        {spanContent}
      </Link>
    );
  }

  return (
    <button
      ref={buttonRef as React.RefObject<HTMLButtonElement>}
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    >
      {spanContent}
    </button>
  );
}
