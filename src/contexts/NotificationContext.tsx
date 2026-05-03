"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  FunctionComponent,
} from "react";
import notificationService, {
  AppNotification,
  NotificationPreferences,
} from "@/services/notificationService";
import { useAuth } from "@/services/authContext";

const POLL_INTERVAL_MS = 30_000; // 30 seconds

// Module-level VAPID key cache — fetched once per session, not on every login.
let _vapidCache: { vapid_public_key: string | null; enabled: boolean } | null = null;
async function getCachedVapidKey() {
  if (_vapidCache) return _vapidCache;
  _vapidCache = await notificationService.getVapidPublicKey();
  return _vapidCache;
}

type PushPermission = "default" | "granted" | "denied" | "unsupported";

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  panelOpen: boolean;
  activeTab: "player" | "business" | "system";
  pushEnabled: boolean;
  pushSupported: boolean;
  pushAvailable: boolean; // server VAPID configured + browser supports
  pushPermission: PushPermission;
  preferences: NotificationPreferences | null;
  openPanel: () => void;
  closePanel: () => void;
  setActiveTab: (tab: "player" | "business" | "system") => void;
  markRead: (ids: string[]) => Promise<void>;
  markAllRead: (roleContext?: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  requestPushPermission: () => Promise<boolean>;
  disablePush: () => Promise<void>;
  updatePreferences: (prefs: NotificationPreferences) => Promise<void>;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>(
  {} as NotificationContextType
);

export const NotificationProvider: FunctionComponent<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { isLoggedIn } = useAuth();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"player" | "business" | "system">("player");
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushAvailable, setPushAvailable] = useState(false);
  const [pushPermission, setPushPermission] = useState<PushPermission>("default");
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);

  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const swRegRef = useRef<ServiceWorkerRegistration | null>(null);

  const pushSupport = typeof window !== "undefined"
    && "serviceWorker" in navigator
    && "PushManager" in window;

  // ── Fetch feed ──────────────────────────────────────────────────────────────
  const refresh = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      setLoading(true);
      const feed = await notificationService.getFeed({ page_size: 50 });
      setNotifications(feed.items);
      setUnreadCount(feed.unread_count);
    } catch {
      // silently fail — polling will retry
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  // ── Poll unread count (lightweight) ─────────────────────────────────────────
  const pollUnread = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // ignore
    }
  }, [isLoggedIn]);

  // ── Panel open: full refresh ─────────────────────────────────────────────────
  const openPanel = useCallback(() => {
    setPanelOpen(true);
    refresh();
  }, [refresh]);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
  }, []);

  // ── Mark read ────────────────────────────────────────────────────────────────
  const markRead = useCallback(async (ids: string[]) => {
    await notificationService.markRead(ids);
    setNotifications((prev) =>
      prev.map((n) => (ids.includes(n.id) ? { ...n, is_read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - ids.filter((id) => {
      const n = notifications.find((x) => x.id === id);
      return n && !n.is_read;
    }).length));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications]);

  const markAllRead = useCallback(async (roleContext?: string) => {
    await notificationService.markAllRead(roleContext);
    setNotifications((prev) =>
      prev.map((n) =>
        !roleContext || n.role_context === roleContext ? { ...n, is_read: true } : n
      )
    );
    if (!roleContext) setUnreadCount(0);
    else setUnreadCount((c) => {
      const stillUnread = notifications.filter(
        (n) => !n.is_read && n.role_context !== roleContext
      ).length;
      return stillUnread;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications]);

  const deleteNotification = useCallback(async (id: string) => {
    const n = notifications.find((x) => x.id === id);
    await notificationService.deleteNotification(id);
    setNotifications((prev) => prev.filter((x) => x.id !== id));
    if (n && !n.is_read) setUnreadCount((c) => Math.max(0, c - 1));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications]);

  // ── Preferences ─────────────────────────────────────────────────────────────
  const updatePreferences = useCallback(async (prefs: NotificationPreferences) => {
    const updated = await notificationService.updatePreferences(prefs);
    setPreferences(updated);
  }, []);

  // ── Push subscription ────────────────────────────────────────────────────────
  const requestPushPermission = useCallback(async (): Promise<boolean> => {
    if (!pushSupport) {
      setPushPermission("unsupported");
      return false;
    }
    try {
      const permission = await Notification.requestPermission();
      setPushPermission(permission as PushPermission);
      if (permission !== "granted") return false;

      const { vapid_public_key, enabled } = await getCachedVapidKey();
      if (!enabled || !vapid_public_key) {
        setPushAvailable(false);
        return false;
      }
      setPushAvailable(true);

      const reg = swRegRef.current || await navigator.serviceWorker.ready;
      swRegRef.current = reg;

      const existing = await reg.pushManager.getSubscription();
      if (existing) {
        await notificationService.subscribePush(existing);
        setPushEnabled(true);
        return true;
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapid_public_key) as unknown as ArrayBuffer,
      });

      await notificationService.subscribePush(sub, navigator.userAgent.slice(0, 100));
      setPushEnabled(true);
      return true;
    } catch (e) {
      console.error("Push subscription failed:", e);
      return false;
    }
  }, [pushSupport]);

  const disablePush = useCallback(async () => {
    if (!pushSupport) return;
    try {
      const reg = swRegRef.current || await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await notificationService.unsubscribePush(sub.endpoint);
        await sub.unsubscribe();
      }
      setPushEnabled(false);
    } catch (e) {
      console.error("Push unsubscribe failed:", e);
    }
  }, [pushSupport]);

  // ── Detect push state on mount (only when logged in) ─────────────────────
  useEffect(() => {
    if (!pushSupport) {
      setPushSupported(false);
      setPushPermission("unsupported");
      setPushAvailable(false);
      return;
    }
    setPushSupported(true);
    setPushPermission((Notification.permission as PushPermission) ?? "default");

    // Only check VAPID + subscription state if the user is logged in.
    // Without this guard, unauthenticated subscribePush calls trigger 401s
    // that feed into the apiClient refresh interceptor, causing a loop.
    if (!isLoggedIn) return;

    // Check VAPID availability on the server (cached)
    getCachedVapidKey()
      .then(({ enabled, vapid_public_key }) => {
        setPushAvailable(!!enabled && !!vapid_public_key);
      })
      .catch(() => setPushAvailable(false));

    navigator.serviceWorker.ready
      .then(async (reg) => {
        swRegRef.current = reg;
        const sub = await reg.pushManager.getSubscription();
        setPushEnabled(!!sub);
      })
      .catch(() => {});
  }, [pushSupport, isLoggedIn]);

  // ── Init + polling ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoggedIn) {
      setNotifications([]);
      setUnreadCount(0);
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      // On logout, remove the backend subscription record so the server stops
      // sending pushes to this device. The browser subscription itself is kept
      // intact — PWARegister will silently re-register it on the next login so
      // the user never has to click "Enable Push" again.
      if (pushSupport) {
        navigator.serviceWorker.ready
          .then(async (reg) => {
            const sub = await reg.pushManager.getSubscription();
            if (sub) {
              notificationService.unsubscribePush(sub.endpoint).catch(() => {});
            }
          })
          .catch(() => {});
      }
      setPushEnabled(false);
      return;
    }

    refresh();
    notificationService.getPreferences().then(setPreferences).catch(() => {});

    pollTimerRef.current = setInterval(pollUnread, POLL_INTERVAL_MS);
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [isLoggedIn, refresh, pollUnread, pushSupport]);

  // ── Refresh unread count when the tab regains focus ───────────────────────
  useEffect(() => {
    if (!isLoggedIn) return;
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        pollUnread();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isLoggedIn, pollUnread]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        panelOpen,
        activeTab,
        pushEnabled,
        pushSupported,
        pushAvailable,
        pushPermission,
        preferences,
        openPanel,
        closePanel,
        setActiveTab,
        markRead,
        markAllRead,
        deleteNotification,
        requestPushPermission,
        disablePush,
        updatePreferences,
        refresh,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);

// ── Utility ──────────────────────────────────────────────────────────────────
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
