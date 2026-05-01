"use client";

import { useEffect } from "react";
import { getAccessToken } from "@/services/apiClient";

export default function PWARegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then(() => navigator.serviceWorker.ready)
      .then(async (reg) => {
        const sub = await reg.pushManager.getSubscription();
        if (!sub) return;

        // Skip if user has no access token — they're not logged in.
        // This prevents unauthenticated subscribePush → 401 → refresh loop.
        if (!getAccessToken()) return;

        const { default: notificationService } = await import(
          "@/services/notificationService"
        );
        try {
          const { enabled } = await notificationService.getVapidPublicKey();
          if (!enabled) return;
          await notificationService.subscribePush(sub);
        } catch {
          // Silently no-op: user may not be logged in yet or token expired
        }
      })
      .catch((err) => console.error("[SW] Registration failed:", err));
  }, []);

  return null;
}
