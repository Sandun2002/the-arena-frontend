"use client";

import { useEffect } from "react";
import { getAccessToken } from "@/services/apiClient";

export default function PWARegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let reloading = false;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        // If a new SW is waiting, activate it immediately so push events
        // are handled by the latest service worker version.
        if (registration.waiting) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
        }

        // When an updated SW moves into waiting, force it active.
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              newWorker.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });

        return navigator.serviceWorker.ready;
      })
      .then(async (reg) => {
        if (!reg) return;

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

    // Reload once when a new SW takes control so the page runs fresh code.
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    });
  }, []);

  return null;
}
