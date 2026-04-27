"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, Smartphone, Mail, Monitor } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import { NotificationPreferenceItem } from "@/services/notificationService";
import { cn } from "@/lib/utils";

const GROUPED_TYPES: { group: string; types: { key: string; label: string }[] }[] = [
  {
    group: "Bookings",
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
    types: [
      { key: "payment_successful", label: "Payment Successful" },
      { key: "payment_failed", label: "Payment Failed" },
    ],
  },
  {
    group: "Reviews & XP",
    types: [
      { key: "review_request", label: "Review Request" },
      { key: "xp_earned", label: "XP Earned" },
      { key: "level_up", label: "Level Up" },
      { key: "challenge_completed", label: "Challenge Completed" },
    ],
  },
  {
    group: "Business",
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
        checked ? "bg-emerald-600" : "bg-zinc-700",
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

export function NotificationPreferences() {
  const { preferences, updatePreferences, pushEnabled, pushSupported, requestPushPermission, disablePush } =
    useNotifications();

  const [mute, setMute] = useState(false);
  const [prefMap, setPrefMap] = useState<Record<string, NotificationPreferenceItem>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!preferences) return;
    setMute(preferences.mute_player_notifications);
    const map: Record<string, NotificationPreferenceItem> = {};
    preferences.preferences.forEach((p) => { map[p.notification_type] = p; });
    setPrefMap(map);
  }, [preferences]);

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

  const handleSave = async () => {
    setSaving(true);
    await updatePreferences({
      mute_player_notifications: mute,
      preferences: Object.values(prefMap),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Global mute */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {mute ? (
              <BellOff size={18} className="text-zinc-500" />
            ) : (
              <Bell size={18} className="text-emerald-400" />
            )}
            <div>
              <p className="text-sm font-semibold text-zinc-200">Mute Player Notifications</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Suppress all push and in-app notifications for player activity (bookings, XP, etc.)
              </p>
            </div>
          </div>
          <ToggleSwitch checked={mute} onChange={setMute} />
        </div>
      </div>

      {/* Push toggle */}
      {pushSupported && (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone size={18} className="text-zinc-400" />
              <div>
                <p className="text-sm font-semibold text-zinc-200">Push Notifications</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {pushEnabled
                    ? "Push notifications are enabled on this device."
                    : "Enable real-time push notifications for this device."}
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
      {GROUPED_TYPES.map((group) => (
        <div key={group.group} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-800/60">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{group.group}</h3>
          </div>
          <div className="divide-y divide-zinc-900/60">
            {group.types.map((type) => {
              const p = getPref(type.key);
              return (
                <div key={type.key} className="flex items-center px-5 py-3 gap-4">
                  <span className="flex-1 text-sm text-zinc-300">{type.label}</span>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center gap-1">
                      <Smartphone size={12} className="text-zinc-600" />
                      <ToggleSwitch
                        checked={p.push_enabled}
                        onChange={(v) => setPref(type.key, "push_enabled", v)}
                      />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Mail size={12} className="text-zinc-600" />
                      <ToggleSwitch
                        checked={p.email_enabled}
                        onChange={(v) => setPref(type.key, "email_enabled", v)}
                      />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Monitor size={12} className="text-zinc-600" />
                      <ToggleSwitch
                        checked={p.in_app_enabled}
                        onChange={(v) => setPref(type.key, "in_app_enabled", v)}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Save */}
      <div className="flex items-center justify-end gap-3">
        {saved && <span className="text-sm text-emerald-400">Saved!</span>}
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Preferences"}
        </button>
      </div>
    </div>
  );
}
