"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found in the URL.");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email?token=${encodeURIComponent(token)}`,
          { method: "POST" }
        );
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "Your email has been verified.");
          // Redirect to login after 3 seconds
          setTimeout(() => router.push("/login"), 3000);
        } else {
          setStatus("error");
          setMessage(data.detail || "Verification failed. The link may have expired.");
        }
      } catch {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      }
    };

    verify();
  }, [token, router]);

  return (
    <main className="min-h-screen bg-surface-base flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div
        className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none transition-colors duration-1000 ${
          status === "success"
            ? "bg-emerald-900/15"
            : status === "error"
            ? "bg-red-900/10"
            : "bg-surface-raised/20"
        }`}
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="inline-block group">
            <img src={resolvedTheme === "dark" ? "/logo-full.png" : "/logo-full-for-light-mode.png"} alt="The Arena" className="h-20 w-auto mx-auto object-contain drop-shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-transform group-hover:scale-105" />
          </Link>
        </div>

        {/* Card */}
        <div className="bg-surface-raised/60 border border-default rounded-3xl p-8 backdrop-blur-sm text-center">
          {/* Loading */}
          {status === "loading" && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8"/><rect x="2" y="6" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
              </div>
              <h1 className="text-2xl font-bold text-primary mb-2">Verifying Your Email</h1>
              <p className="text-secondary text-sm mb-6">Please wait a moment...</p>
              <div className="w-full bg-surface-overlay rounded-full h-1.5 overflow-hidden">
                <div className="h-full w-2/3 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full [animation:progress_2s_ease-in-out_infinite]" />
              </div>
            </>
          )}

          {/* Success */}
          {status === "success" && (
            <>
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
              </div>
              <h1 className="text-2xl font-bold text-primary mb-3">Email Verified!</h1>
              <p className="text-secondary text-sm mb-6 leading-relaxed">{message}</p>
              <p className="text-muted text-xs mb-6">Redirecting to login in 3 seconds...</p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-primary font-bold px-6 py-3 rounded-xl transition-all duration-300 text-sm"
              >
                Go to Login Now
              </Link>
            </>
          )}

          {/* Error */}
          {status === "error" && (
            <>
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-primary mb-3">Verification Failed</h1>
              <p className="text-secondary text-sm mb-8 leading-relaxed">{message}</p>
              <div className="flex flex-col gap-3">
                <Link
                  href="/check-email"
                  className="inline-flex items-center justify-center w-full bg-emerald-600 hover:bg-emerald-500 text-primary font-bold px-6 py-3 rounded-xl transition-colors text-sm"
                >
                  Resend Verification Email
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center w-full bg-surface-overlay hover:bg-surface-overlay text-primary font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
                >
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface-base flex items-center justify-center p-4 animate-pulse">
        <div className="w-full max-w-md bg-surface-raised/60 border border-default rounded-3xl p-8 space-y-6">
          <div className="w-16 h-16 rounded-full bg-surface-overlay mx-auto" />
          <div className="space-y-3">
            <div className="h-6 w-48 rounded-lg bg-surface-overlay mx-auto" />
            <div className="h-4 w-64 rounded bg-surface-overlay/60 mx-auto" />
          </div>
          <div className="h-2 rounded-full bg-surface-overlay" />
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
