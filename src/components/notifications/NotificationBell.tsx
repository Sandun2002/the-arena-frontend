"use client";

import { Bell } from "@phosphor-icons/react";
import { useNotifications } from "@/contexts/NotificationContext";
import { cn } from "@/lib/utils";

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const { unreadCount, openPanel, closePanel, panelOpen } = useNotifications();

  return (
    <button
      data-notification-bell
      onClick={panelOpen ? closePanel : openPanel}
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      className={cn(
        "relative flex items-center justify-center w-9 h-9 rounded-xl transition-colors",
        "text-zinc-400 hover:text-white hover:bg-white/5",
        panelOpen && "text-white bg-white/5",
        className
      )}
    >
      <Bell size={18} weight="bold" />
      {unreadCount > 0 && (
        <span
          className={cn(
            "absolute top-1 right-1 flex items-center justify-center",
            "min-w-[16px] h-4 px-1 rounded-full",
            "bg-emerald-500 text-white text-[10px] font-bold leading-none",
            "ring-2 ring-zinc-950"
          )}
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
}
