"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/services/authContext";

export function AuthLoadingSpinner() {
  return (
    <div className="min-h-screen bg-surface-base flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      <p className="text-faint text-sm font-medium">Loading…</p>
    </div>
  );
}

export function useRequireAuth() {
  const { isLoggedIn, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.replace(`/login?next=${encodeURIComponent(pathname ?? "/")}`);
    }
  }, [loading, isLoggedIn, router, pathname]);

  return loading || !isLoggedIn;
}

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuthPending = useRequireAuth();
  if (isAuthPending) return <AuthLoadingSpinner />;
  return <>{children}</>;
}
