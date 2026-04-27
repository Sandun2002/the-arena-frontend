"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface ThemeToggleProps {
  className?: string;
  size?: number;
}

/**
 * Theme toggle button.
 *
 * Icon visibility is CSS-driven via the `dark:` variant (bound to `html.dark`
 * by our @custom-variant in globals.css). This means the icon shown matches
 * the class set by the FOUC bootstrap script at first paint — there is no
 * post-hydration flicker even if React's initial state disagrees with the
 * resolved theme.
 *
 * JS state is used only for the aria-label, title, and click handler.
 */
export default function ThemeToggle({
  className = "",
  size = 18,
}: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={`relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-default text-secondary hover:text-primary hover:bg-surface-overlay/40 transition-colors duration-200 ${className}`}
    >
      {/* Sun: visible in LIGHT mode (default when no .dark class). */}
      <span
        className="absolute inset-0 flex items-center justify-center transition-all duration-300 opacity-100 rotate-0 scale-100 dark:opacity-0 dark:rotate-90 dark:scale-50"
        aria-hidden="true"
      >
        <Sun size={size} strokeWidth={1.75} />
      </span>
      {/* Moon: visible in DARK mode (when html has .dark class). */}
      <span
        className="absolute inset-0 flex items-center justify-center transition-all duration-300 opacity-0 -rotate-90 scale-50 dark:opacity-100 dark:rotate-0 dark:scale-100"
        aria-hidden="true"
      >
        <Moon size={size} strokeWidth={1.75} />
      </span>
    </button>
  );
}
