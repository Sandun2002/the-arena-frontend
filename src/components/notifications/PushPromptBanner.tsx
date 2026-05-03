"use client";

import { useState, useEffect } from "react";
import { Bell, X } from "@phosphor-icons/react";
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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100vw-32px)] max-w-md animate-in slide-in-from-bottom-4 fade-in-0 duration-300">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-2xl shadow-black/60 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-950/60 border border-emerald-900/40 flex items-center justify-center flex-shrink-0">
          <Bell size={16} weight="duotone" className="text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-100">Enable Push Notifications</p>
          <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
            Get instant alerts for bookings, reminders, and venue updates.
          </p>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleEnable}
              disabled={requesting}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors disabled:opacity-60"
            >
              {requesting ? "Enabling..." : "Enable"}
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 text-xs transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 text-zinc-600 hover:text-zinc-400 transition-colors flex-shrink-0"
          aria-label="Dismiss"
        >
          <X size={14} weight="bold" />
        </button>
      </div>
    </div>
  );
}
