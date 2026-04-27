"use client";

import { Bell } from "lucide-react";
import { NotificationPreferences } from "@/components/notifications/NotificationPreferences";
import { useAuth } from "@/services/authContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function NotificationSettingsPage() {
  const { isLoggedIn, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.replace("/login");
    }
  }, [isLoggedIn, loading, router]);

  if (loading || !isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-surface-base py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Bell size={16} className="text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold text-primary">Notification Settings</h1>
          </div>
          <p className="text-sm text-muted ml-12">
            Control how and when TheArena.lk notifies you.
          </p>
        </div>

        <NotificationPreferences />
      </div>
    </div>
  );
}
