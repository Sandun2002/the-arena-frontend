"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, RefreshCw, CheckCircle, ArrowRight } from "lucide-react";

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<"idle" | "success" | "error">("idle");
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResend = async () => {
    if (!email || countdown > 0) return;
    setIsResending(true);
    setResendStatus("idle");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setResendStatus("success");
        setCountdown(60);
      } else {
        setResendStatus("error");
      }
    } catch {
      setResendStatus("error");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/">
            <span className="font-black text-3xl text-white tracking-tight">
              ARENA<span className="text-emerald-500">.LK</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 backdrop-blur-sm text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
            <Mail className="w-10 h-10 text-emerald-500" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-3">Check Your Email</h1>
          <p className="text-zinc-400 text-sm leading-relaxed mb-2">
            We&apos;ve sent a verification link to:
          </p>
          {email && (
            <p className="text-emerald-400 font-semibold text-sm mb-6 break-all">
              {email}
            </p>
          )}
          <p className="text-zinc-500 text-xs leading-relaxed mb-8">
            Click the link in the email to verify your account. The link expires in <strong className="text-zinc-400">24 hours</strong>.
          </p>

          {/* Resend status */}
          {resendStatus === "success" && (
            <div className="flex items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-xl mb-6">
              <CheckCircle className="w-4 h-4" />
              New verification email sent!
            </div>
          )}
          {resendStatus === "error" && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-6">
              Failed to resend. Please try again.
            </div>
          )}

          {/* Resend button */}
          <button
            onClick={handleResend}
            disabled={isResending || countdown > 0 || !email}
            className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm mb-4"
          >
            <RefreshCw className={`w-4 h-4 ${isResending ? "animate-spin" : ""}`} />
            {countdown > 0
              ? `Resend again in ${countdown}s`
              : isResending
              ? "Sending..."
              : "Resend Verification Email"}
          </button>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-white text-sm transition-colors"
          >
            Go to Login <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <p className="text-center text-zinc-600 text-xs mt-6">
          Didn&apos;t receive the email? Check your spam folder.
        </p>
      </div>
    </main>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CheckEmailContent />
    </Suspense>
  );
}
