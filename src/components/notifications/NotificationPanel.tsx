"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Check, CheckCheck, Trash2, ExternalLink, Bell, BellOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/contexts/NotificationContext";
import { useAuth } from "@/services/authContext";
import { AppNotification } from "@/services/notificationService";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const TABS = [
  { key: "player" as const, label: "Player" },
  { key: "business" as const, label: "Business" },
  { key: "system" as const, label: "System" },
];

function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
}: {
  notification: AppNotification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const router = useRouter();

  const handleClick = () => {
    if (!notification.is_read) onMarkRead(notification.id);
    if (notification.action_url) router.push(notification.action_url);
  };

  return (
    <div
      className={cn(
        "group relative flex gap-3 px-4 py-3 transition-colors cursor-pointer",
        "hover:bg-surface-overlay border-b border-default last:border-0",
        !notification.is_read && "bg-emerald-500/10"
      )}
      onClick={handleClick}
    >
      {!notification.is_read && (
        <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0 pl-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn(
            "text-sm leading-snug line-clamp-1",
            notification.is_read ? "text-muted font-normal" : "text-primary font-medium"
          )}>
            {notification.icon && <span className="mr-1.5">{notification.icon}</span>}
            {notification.title}
          </p>
          <span className="text-[11px] text-faint whitespace-nowrap flex-shrink-0">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </span>
        </div>
        <p className="text-xs text-secondary mt-0.5 line-clamp-2 leading-relaxed">
          {notification.body}
        </p>
      </div>
      <div
        className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 sm:flex"
        onClick={(e) => e.stopPropagation()}
      >
        {!notification.is_read && (
          <button
            onClick={() => onMarkRead(notification.id)}
            className="p-1.5 rounded text-muted hover:text-emerald-500 hover:bg-emerald-500/20 transition-colors"
            aria-label="Mark as read"
          >
            <Check size={13} />
          </button>
        )}
        {notification.action_url && (
          <button
            onClick={() => { if (notification.action_url) window.open(notification.action_url, "_self"); }}
            className="p-1.5 rounded text-muted hover:text-primary hover:bg-surface-overlay transition-colors"
            aria-label="Open"
          >
            <ExternalLink size={13} />
          </button>
        )}
        <button
          onClick={() => onDelete(notification.id)}
          className="p-1.5 rounded text-muted hover:text-red-500 hover:bg-red-500/20 transition-colors"
          aria-label="Delete"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

export function NotificationPanel() {
  const {
    notifications,
    unreadCount,
    loading,
    panelOpen,
    activeTab,
    setActiveTab,
    closePanel,
    markRead,
    markAllRead,
    deleteNotification,
  } = useNotifications();

  const { isVenueOwner, isVenueManager } = useAuth();
  const router = useRouter();

  const showBusinessTab = isVenueOwner || isVenueManager;

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!panelOpen) return;
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") closePanel(); };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [panelOpen, closePanel]);

  if (!panelOpen || !mounted) return null;

  const filteredNotifications = notifications.filter(
    (n) => n.role_context === activeTab
  );
  const tabUnread = filteredNotifications.filter((n) => !n.is_read).length;

  const handleMarkRead = (id: string) => markRead([id]);
  const handleDelete = (id: string) => deleteNotification(id);

  const panelContent = (
    <div
      className={cn(
        "flex flex-col min-h-0",
        "bg-surface-raised border border-default shadow-2xl",
        "md:rounded-2xl md:w-[380px] md:max-h-[580px]",
        "w-full max-h-[85vh] rounded-t-2xl overflow-hidden"
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-default">
        <div className="flex items-center gap-2">
          <Bell size={15} className="text-secondary" />
          <span className="text-sm font-semibold text-primary">Notifications</span>
          {unreadCount > 0 && (
            <span className="text-xs bg-emerald-500/20 text-emerald-500 px-1.5 py-0.5 rounded-full font-medium">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {tabUnread > 0 && (
            <button
              onClick={() => markAllRead(activeTab)}
              className="flex items-center gap-1 px-2 py-1 text-xs text-muted hover:text-emerald-500 hover:bg-emerald-500/20 rounded-lg transition-colors"
            >
              <CheckCheck size={13} />
              <span>Mark all read</span>
            </button>
          )}
          <button
            onClick={closePanel}
            className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-surface-overlay transition-colors"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-4 pt-2 pb-0 border-b border-default/60">
        {TABS.filter((t) => t.key !== "business" || showBusinessTab).map((tab) => {
          const count = notifications.filter(
            (n) => n.role_context === tab.key && !n.is_read
          ).length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-3 pb-2 pt-1 text-xs font-medium rounded-t transition-colors border-b-2 -mb-px",
                activeTab === tab.key
                  ? "text-primary border-emerald-500"
                  : "text-muted hover:text-primary border-transparent"
              )}
            >
              {tab.label}
              {count > 0 && (
                <span className="min-w-[16px] h-4 px-1 rounded-full bg-emerald-500/20 text-emerald-500 text-[10px] font-bold flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {loading && filteredNotifications.length === 0 ? (
          <div className="flex flex-col gap-1 p-2 animate-pulse">
            {[1,2,3,4].map(i => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-surface-raised flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-3/4 rounded bg-surface-raised" />
                  <div className="h-2.5 w-1/2 rounded bg-surface-raised/60" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-faint">
            <BellOff size={24} strokeWidth={1.5} />
            <span className="text-sm">No notifications</span>
          </div>
        ) : (
          filteredNotifications.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onMarkRead={handleMarkRead}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-default/60">
        <button
          className="text-xs text-muted hover:text-primary transition-colors"
          onClick={() => { closePanel(); router.push("/settings/notifications"); }}
        >
          Notification settings →
        </button>
      </div>
    </div>
  );

  const mobileOverlay = (
    <div
      className="md:hidden fixed inset-0 z-[200] flex flex-col justify-end bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-150"
      onClick={closePanel}
    >
      <div className="flex flex-col animate-in slide-in-from-bottom-4 duration-200">
        {panelContent}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile: portal to body to escape backdrop-filter containing block on MobileTopBar */}
      {createPortal(mobileOverlay, document.body)}

      {/* Desktop: dropdown anchored to bell */}
      <div className="hidden md:block absolute right-0 top-full mt-2 z-50 animate-in fade-in-0 slide-in-from-top-2 duration-150">
        <div className="fixed inset-0 z-[-1]" onClick={closePanel} />
        {panelContent}
      </div>
    </>
  );
}
