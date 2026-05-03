"use client";

import { useState, useEffect } from "react";
import { Bell, X, Notification } from "@phosphor-icons/react";
import { useNotifications } from "@/contexts/NotificationContext";
import { useAuth } from "@/services/authContext";

const DISMISSED_KEY = "arena_push_prompt_dismissed";

export function PushPromptBanner() {
  const { pushSupported, pushAvailable, pushEnabled, pushPermission, requestPushPermission } = useNotifications();
  const { isLoggedIn } = useAuth();
  const [visible, setVisible] = useState(false);
  const [requesting, setRequesting] = useState(false);

  // Clear stale dismissed flag only when VAPID becomes available and the user
  // hasn't already enabled push — so users who dismissed before the server had
  // VAPID configured get re-prompted, but users with push enabled are left alone.
  useEffect(() => {
    if (pushAvailable && !pushEnabled) localStorage.removeItem(DISMISSED_KEY);
  }, [pushAvailable, pushEnabled]);

  useEffect(() => {
    if (!isLoggedIn || !pushSupported || !pushAvailable || pushEnabled || pushPermission === "denied") return;
    if (typeof window === "undefined") return;
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed) return;
    // Delay a bit so it doesn't flash immediately on load
    const timer = setTimeout(() => setVisible(true), 4000);
    return () => clearTimeout(timer);
  }, [isLoggedIn, pushSupported, pushAvailable, pushEnabled, pushPermission]);

  const handleEnable = async () => {
    setRequesting(true);
    const granted = await requestPushPermission();
    setRequesting(false);
    if (granted) setVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-0 right-0 z-50 px-4 sm:px-6 pointer-events-none">
      <div className="mx-auto w-full max-w-sm sm:max-w-md animate-in slide-in-from-bottom-4 fade-in-0 duration-300 pointer-events-auto">
        {/* Glassmorphism card with semantic theme tokens */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-glass-bg border border-glass-border backdrop-blur-xl shadow-2xl shadow-black/20 dark:shadow-black/40">
          {/* Top highlight line */}
          <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-brand-accent/50 to-transparent" />
          
          {/* Content */}
          <div className="relative p-4 sm:p-5">
            {/* Close button - positioned absolute */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-full text-muted hover:text-primary hover:bg-surface-overlay transition-colors"
              aria-label="Dismiss"
            >
              <X size={18} weight="bold" />
            </button>

            <div className="flex items-start gap-3 sm:gap-4 pr-10">
              {/* Icon with gradient background */}
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-brand-accent/20 to-brand-accent/5 border border-brand-accent/20 flex items-center justify-center">
                  <Notification size={24} weight="fill" className="text-brand-accent" />
                </div>
                {/* Pulse animation dot */}
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-brand-accent animate-pulse" />
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <h3 className="text-sm sm:text-base font-semibold text-primary leading-tight">
                  Stay in the loop
                </h3>
                <p className="text-xs sm:text-sm text-muted mt-1 leading-relaxed">
                  Get instant alerts for bookings, reminders, and venue updates — even when the app is closed.
                </p>
              </div>
            </div>

            {/* Action buttons - mobile optimized touch targets */}
            <div className="flex items-center gap-2 sm:gap-3 mt-4 sm:mt-5">
              <button
                onClick={handleEnable}
                disabled={requesting}
                className="flex-1 sm:flex-none sm:min-w-[120px] px-4 sm:px-6 py-3 sm:py-2.5 rounded-xl sm:rounded-lg bg-brand-accent hover:bg-brand-accent-hover text-inverted text-sm font-semibold transition-all active:scale-95 disabled:opacity-60 disabled:active:scale-100 shadow-lg shadow-brand-accent/25 flex items-center justify-center gap-2"
              >
                {requesting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-inverted/30 border-t-inverted rounded-full animate-spin" />
                    <span>Enabling...</span>
                  </>
                ) : (
                  <>
                    <Bell size={18} weight="bold" />
                    <span>Enable Push</span>
                  </>
                )}
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 sm:px-5 py-3 sm:py-2.5 rounded-xl sm:rounded-lg text-sm font-medium text-secondary hover:text-primary hover:bg-surface-overlay transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
