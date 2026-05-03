"use client";

import { useState, useEffect, useMemo } from "react";
import { Bell, BellSlash, DeviceMobile, Monitor, Check, WarningCircle, CircleNotch, PaperPlaneTilt } from "@phosphor-icons/react";
import { useNotifications } from "@/contexts/NotificationContext";
import { useAuth } from "@/services/authContext";
import { NotificationPreferenceItem } from "@/services/notificationService";
import apiClient from "@/services/apiClient";
import { cn } from "@/lib/utils";

type Audience = "player" | "business" | "system";

interface TypeDef { key: string; label: string }
interface GroupDef { group: string; audience: Audience; types: TypeDef[] }

const GROUPED_TYPES: GroupDef[] = [
  {
    group: "Bookings",
    audience: "player",
    types: [
      { key: "booking_confirmed", label: "Booking Confirmed" },
      { key: "booking_reminder_24h", label: "24h Reminder" },
      { key: "booking_reminder_1h", label: "1h Reminder" },
      { key: "booking_rejected_by_owner", label: "Booking Cancelled by Venue" },
      { key: "booking_cancelled_by_self", label: "Self-Cancelled Booking" },
    ],
  },
  {
    group: "Payments",
    audience: "player",
    types: [
      { key: "payment_successful", label: "Payment Successful" },
      { key: "payment_failed", label: "Payment Failed" },
    ],
  },
  {
    group: "Reviews & XP",
    audience: "player",
    types: [
      { key: "review_request", label: "Review Request" },
      { key: "xp_earned", label: "XP Earned" },
      { key: "level_up", label: "Level Up" },
      { key: "challenge_completed", label: "Challenge Completed" },
    ],
  },
  {
    group: "Business",
    audience: "business",
    types: [
      { key: "new_booking_received", label: "New Booking Received" },
      { key: "booking_cancelled_by_player", label: "Player Cancellation" },
      { key: "new_review_received", label: "New Review" },
      { key: "settlement_processed", label: "Settlement Processed" },
      { key: "daily_revenue_summary", label: "Daily Revenue Summary" },
      { key: "venue_verified", label: "Venue Verified" },
      { key: "venue_suspended", label: "Venue Suspended" },
      { key: "manager_invite_received", label: "Manager Invite" },
    ],
  },
  {
    group: "Security",
    audience: "system",
    types: [
      { key: "password_changed", label: "Password Changed" },
      { key: "mfa_changed", label: "MFA Changed" },
      { key: "new_login", label: "New Login Detected" },
    ],
  },
];

function ToggleSwitch({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative w-9 h-5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
        checked ? "bg-emerald-600" : "bg-surface-sunken",
        disabled && "opacity-40 cursor-not-allowed"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform",
          checked && "translate-x-4"
        )}
      />
    </button>
  );
}

function arePrefsEqual(
  a: Record<string, NotificationPreferenceItem>,
  b: Record<string, NotificationPreferenceItem>
): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) {
    const x = a[k];
    const y = b[k];
    if (!x || !y) return false;
    if (
      x.push_enabled !== y.push_enabled ||
      x.in_app_enabled !== y.in_app_enabled
    ) {
      return false;
    }
  }
  return true;
}

function PreferencesSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading preferences">
      <div className="h-20 rounded-2xl bg-surface-raised border border-default" />
      <div className="h-20 rounded-2xl bg-surface-raised border border-default" />
      <div className="h-48 rounded-2xl bg-surface-raised border border-default" />
      <div className="h-48 rounded-2xl bg-surface-raised border border-default" />
    </div>
  );
}

export function NotificationPreferences() {
  const {
    preferences,
    updatePreferences,
    pushEnabled,
    pushSupported,
    pushAvailable,
    pushPermission,
    requestPushPermission,
    disablePush,
  } = useNotifications();
  const { isVenueOwner, isVenueManager } = useAuth();

  const isBusiness = isVenueOwner || isVenueManager;
  // Every account is a player by default (any user can book courts).
  // Player groups are shown to everyone; Business groups only to owners/managers.
  const visibleGroups = useMemo<GroupDef[]>(
    () =>
      GROUPED_TYPES.filter((g) => {
        if (g.audience === "business") return isBusiness;
        return true; // player + system/security: everyone
      }),
    [isBusiness]
  );

  const [mute, setMute] = useState(false);
  const [initialMute, setInitialMute] = useState(false);
  const [prefMap, setPrefMap] = useState<Record<string, NotificationPreferenceItem>>({});
  const [initialPrefMap, setInitialPrefMap] = useState<Record<string, NotificationPreferenceItem>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!preferences) return;
    setMute(preferences.mute_player_notifications);
    setInitialMute(preferences.mute_player_notifications);
    const map: Record<string, NotificationPreferenceItem> = {};
    preferences.preferences.forEach((p) => {
      map[p.notification_type] = p;
    });
    // Hydrate defaults for visible types so dirty-detection works
    visibleGroups.forEach((g) =>
      g.types.forEach((t) => {
        if (!map[t.key]) {
          map[t.key] = {
            notification_type: t.key,
            push_enabled: true,
            email_enabled: true,
            in_app_enabled: true,
          };
        }
      })
    );
    setPrefMap(map);
    setInitialPrefMap(JSON.parse(JSON.stringify(map)));
  }, [preferences, visibleGroups]);

  const getPref = (type: string): NotificationPreferenceItem =>
    prefMap[type] ?? {
      notification_type: type,
      push_enabled: true,
      email_enabled: true,
      in_app_enabled: true,
    };

  const setPref = (type: string, field: keyof NotificationPreferenceItem, value: boolean) => {
    setPrefMap((prev) => ({
      ...prev,
      [type]: { ...getPref(type), [field]: value },
    }));
  };

  const isDirty = mute !== initialMute || !arePrefsEqual(prefMap, initialPrefMap);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePreferences({
        mute_player_notifications: mute,
        preferences: Object.values(prefMap),
      });
      setInitialMute(mute);
      setInitialPrefMap(JSON.parse(JSON.stringify(prefMap)));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // updatePreferences logs internally; keep dirty so user can retry
    } finally {
      setSaving(false);
    }
  };

  if (!preferences) return <PreferencesSkeleton />;

  return (
    <div className="space-y-6">
      {/* Global mute — every account is a player by default; owners/managers can suppress player-side noise */}
      <div className="bg-surface-raised border border-default rounded-2xl p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {mute ? (
              <BellSlash size={18} weight="duotone" className="text-muted shrink-0" />
            ) : (
              <Bell size={18} weight="duotone" className="text-emerald-500 shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-primary">Mute Player Notifications</p>
              <p className="text-xs text-muted mt-0.5">
                {isBusiness
                  ? "Suppress all player-side push and in-app notifications (bookings, XP, etc.). Business notifications stay on."
                  : "Suppress all push and in-app notifications for player activity (bookings, XP, etc.)."}
              </p>
            </div>
          </div>
          <ToggleSwitch checked={mute} onChange={setMute} />
        </div>
      </div>

      {/* Device push — context-aware: hidden if unsupported/unavailable */}
      {pushSupported && pushAvailable && (
        <DevicePushCard
          pushEnabled={pushEnabled}
          permission={pushPermission}
          onEnable={requestPushPermission}
          onDisable={disablePush}
        />
      )}

      {/* Per-type preferences */}
      {visibleGroups.map((group) => {
        const isPlayerGroup = group.audience === "player";
        const groupMuted = isPlayerGroup && mute;
        return (
          <div
            key={group.group}
            className={cn(
              "bg-surface-raised border border-default rounded-2xl overflow-hidden",
              groupMuted && "opacity-60"
            )}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-default/60">
              <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider">
                {group.group}
              </h3>
              <div className="flex items-center gap-4 pr-1">
                <ChannelHeader icon={<DeviceMobile size={12} weight="bold" />} label="Push" />
                <ChannelHeader icon={<Monitor size={12} weight="bold" />} label="In-app" />
              </div>
            </div>
            {groupMuted && (
              <div className="px-5 py-2 text-[11px] text-muted bg-surface-sunken/40 border-b border-default/60">
                Muted globally — toggle “Mute Player Notifications” off to use these settings.
              </div>
            )}
            <div className="divide-y divide-default/60">
              {group.types.map((type) => {
                const p = getPref(type.key);
                return (
                  <div key={type.key} className="flex items-center px-5 py-3 gap-4">
                    <span className="flex-1 text-sm text-primary truncate">{type.label}</span>
                    <div className="flex items-center gap-4 shrink-0">
                      <ToggleSwitch
                        checked={p.push_enabled}
                        onChange={(v) => setPref(type.key, "push_enabled", v)}
                      />
                      <ToggleSwitch
                        checked={p.in_app_enabled}
                        onChange={(v) => setPref(type.key, "in_app_enabled", v)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Email policy note */}
      <p className="text-xs text-muted px-1">
        Critical emails (account verification, booking confirmations, payment receipts, security
        alerts) are always sent and cannot be disabled here.
      </p>

      {/* Inline save bar — sits in normal flow above the footer */}
      <div
        className="rounded-2xl border border-default bg-surface-raised p-4 flex items-center justify-between gap-3"
        role="region"
        aria-label="Save preferences"
      >
        <span className="text-sm text-muted min-w-0 truncate">
          {saved ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-500">
              <Check size={14} weight="bold" /> Preferences saved
            </span>
          ) : isDirty ? (
            <span className="inline-flex items-center gap-1.5 text-amber-500">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              You have unsaved changes.
            </span>
          ) : (
            "All changes saved."
          )}
        </span>
        <button
          onClick={handleSave}
          disabled={saving || !isDirty}
          className="shrink-0 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Preferences"}
        </button>
      </div>
    </div>
  );
}

function ChannelHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 w-9" aria-hidden="true">
      <span className="text-faint">{icon}</span>
      <span className="text-[9px] uppercase tracking-wider text-faint">{label}</span>
    </div>
  );
}

function DevicePushCard({
  pushEnabled,
  permission,
  onEnable,
  onDisable,
}: {
  pushEnabled: boolean;
  permission: "default" | "granted" | "denied" | "unsupported";
  onEnable: () => Promise<boolean>;
  onDisable: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);

  const handleTest = async () => {
    if (testing) return;
    setTesting(true);
    setTestResult(null);
    try {
      const { data } = await apiClient.post('/notifications/push/test');
      setTestResult(data.sent > 0 ? "success" : "error");
    } catch (e) {
      console.error('[push] Test failed:', e);
      setTestResult("error");
    } finally {
      setTesting(false);
      setTimeout(() => setTestResult(null), 5000);
    }
  };

  // Permission denied at the browser level — we cannot re-prompt programmatically.
  if (permission === "denied") {
    return (
      <div className="bg-surface-raised border border-amber-500/30 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <WarningCircle size={18} weight="fill" className="text-amber-500 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-primary">Push Blocked in Browser</p>
            <p className="text-xs text-muted mt-1">
              Your browser is blocking push notifications for this site. To enable them, click the
              lock icon in the address bar, set <strong>Notifications</strong> to <strong>Allow</strong>,
              then reload this page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleClick = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (pushEnabled) await onDisable();
      else await onEnable();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-surface-raised border border-default rounded-2xl p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Icon + Text - stacked on mobile, row on desktop */}
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-9 sm:h-9 rounded-xl bg-surface-sunken border border-default flex items-center justify-center shrink-0">
            <DeviceMobile size={20} weight="duotone" className="text-brand-accent" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-primary leading-tight">Push Notifications</p>
            <p className="text-xs text-muted mt-0.5 leading-relaxed">
              {pushEnabled
                ? "Real-time push notifications are enabled on this device."
                : "Get real-time alerts on this browser even when the tab is closed."}
            </p>
          </div>
        </div>

        {/* Buttons - full width on mobile, auto on desktop */}
        <div className="flex items-center gap-2 sm:shrink-0">
          {pushEnabled && (
            <button
              type="button"
              onClick={handleTest}
              disabled={testing}
              title="Send a test push notification to verify delivery"
              className={cn(
                "flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-1.5 rounded-lg text-xs font-semibold transition-colors border min-w-[80px]",
                testResult === "success" && "border-emerald-500/50 text-emerald-400 bg-emerald-950/30",
                testResult === "error" && "border-red-500/50 text-red-400 bg-red-950/30",
                testResult === null && "border-default bg-surface-sunken hover:bg-surface-overlay text-secondary",
                testing && "opacity-60 cursor-wait"
              )}
            >
              {testing
                ? <CircleNotch size={12} weight="bold" className="animate-spin" />
                : testResult === "success"
                ? <Check size={12} weight="bold" />
                : <PaperPlaneTilt size={12} weight="bold" />}
              {testing ? "Sending..." : testResult === "success" ? "Sent!" : testResult === "error" ? "Failed" : "Test"}
            </button>
          )}
          <button
            type="button"
            onClick={handleClick}
            disabled={busy}
            className={cn(
              "flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-1.5 rounded-lg text-xs font-semibold transition-colors min-w-[120px]",
              pushEnabled
                ? "bg-surface-sunken hover:bg-surface-overlay text-primary border border-default"
                : "bg-brand-accent hover:bg-brand-accent-hover text-inverted",
              busy && "opacity-60 cursor-wait"
            )}
          >
            {busy && <CircleNotch size={12} weight="bold" className="animate-spin" />}
            {pushEnabled ? "Disable" : "Enable Push"}
          </button>
        </div>
      </div>
    </div>
  );
}
