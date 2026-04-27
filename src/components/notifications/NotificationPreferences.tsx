"use client";

import { useState, useEffect, useMemo } from "react";
import { Bell, BellOff, Smartphone, Mail, Monitor, Check } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import { useAuth } from "@/services/authContext";
import { NotificationPreferenceItem } from "@/services/notificationService";
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
      x.email_enabled !== y.email_enabled ||
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
  const { preferences, updatePreferences, pushEnabled, pushSupported, requestPushPermission, disablePush } =
    useNotifications();
  const { isCustomer, isVenueOwner, isVenueManager } = useAuth();

  const isBusiness = isVenueOwner || isVenueManager;
  // Always show player groups when user has customer role; show business groups only for owners/managers.
  const visibleGroups = useMemo<GroupDef[]>(
    () =>
      GROUPED_TYPES.filter((g) => {
        if (g.audience === "player") return isCustomer;
        if (g.audience === "business") return isBusiness;
        return true; // system/security: everyone
      }),
    [isCustomer, isBusiness]
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
    <div className="space-y-6 pb-24">
      {/* Global mute — only meaningful for users with player role */}
      {isCustomer && (
        <div className="bg-surface-raised border border-default rounded-2xl p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {mute ? (
                <BellOff size={18} className="text-muted shrink-0" />
              ) : (
                <Bell size={18} className="text-emerald-500 shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-primary">Mute Player Notifications</p>
                <p className="text-xs text-muted mt-0.5">
                  Suppress all push and in-app notifications for player activity (bookings, XP, etc.)
                </p>
              </div>
            </div>
            <ToggleSwitch checked={mute} onChange={setMute} />
          </div>
        </div>
      )}

      {/* Device push toggle */}
      {pushSupported && (
        <div className="bg-surface-raised border border-default rounded-2xl p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Smartphone size={18} className="text-secondary shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-primary">Push Notifications on This Device</p>
                <p className="text-xs text-muted mt-0.5">
                  {pushEnabled
                    ? "Real-time push notifications are enabled on this device."
                    : "Enable real-time browser push notifications for this device."}
                </p>
              </div>
            </div>
            <ToggleSwitch
              checked={pushEnabled}
              onChange={(v) => (v ? requestPushPermission() : disablePush())}
            />
          </div>
        </div>
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
                <ChannelHeader icon={<Smartphone size={11} />} label="Push" />
                <ChannelHeader icon={<Mail size={11} />} label="Email" />
                <ChannelHeader icon={<Monitor size={11} />} label="In-app" />
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
                        checked={p.email_enabled}
                        onChange={(v) => setPref(type.key, "email_enabled", v)}
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

      {/* Sticky save bar */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-30 border-t border-default bg-surface-base/95 backdrop-blur-md transition-transform duration-200",
          isDirty || saved ? "translate-y-0" : "translate-y-full"
        )}
        role="region"
        aria-label="Save preferences"
      >
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <span className="text-sm text-muted">
            {saved ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-500">
                <Check size={14} /> Preferences saved
              </span>
            ) : isDirty ? (
              "You have unsaved changes."
            ) : (
              ""
            )}
          </span>
          <button
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Preferences"}
          </button>
        </div>
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
