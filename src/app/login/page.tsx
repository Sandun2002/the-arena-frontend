"use client";

import { useState, useRef, useEffect, Suspense, Fragment } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import gsap from "gsap";
import { ArrowRight, Lock, Mail, Shield } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/services/authContext";
import { useToast } from "@/components/ui/Toast";
import { useGoogleLogin } from "@react-oauth/google";
import { useTheme } from "@/contexts/ThemeContext";

function LoginContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loginWithGoogle } = useAuth();
  const { addToast } = useToast();
  const { resolvedTheme } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".login-card",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      addToast("Please enter email and password", "warning");
      return;
    }

    setIsLoading(true);
    setEmailNotVerified(false);
    try {
      const userData = await login(email, password);
      addToast("Welcome back!", "success");
      const next = searchParams?.get("next");
      const isOwnerOrManager = userData.roles.some((r) => r.slug === "venue_owner" || r.slug === "venue_manager");
      if (next && next.startsWith("/")) {
        router.push(next);
      } else if (isOwnerOrManager) {
        router.push("/venue-dashboard");
      } else {
        router.push("/profile");
      }
    } catch (error: any) {
      const detail = error?.response?.data?.detail || error?.message || "";
      if (detail === "email_not_verified") {
        setEmailNotVerified(true);
      } else {
        addToast("Invalid email or password", "error");
      }
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsGoogleLoading(true);
      try {
        const userData = await loginWithGoogle(tokenResponse.access_token);
        addToast("Welcome!", "success");
        const next = searchParams?.get("next");
        const isOwnerOrManager = userData.roles.some((r) => r.slug === "venue_owner" || r.slug === "venue_manager");
        if (next && next.startsWith("/")) {
          router.push(next);
        } else if (isOwnerOrManager) {
          router.push("/venue-dashboard");
        } else {
          router.push("/profile");
        }
      } catch {
        addToast("Google sign-in failed. Please try again.", "error");
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: () => {
      addToast("Google sign-in was cancelled or failed.", "error");
    },
    flow: "implicit",
  });

  const handleResendVerification = async () => {
    if (!email) {
      addToast("Enter your email address above first.", "warning");
      return;
    }
    setIsResendingVerification(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      addToast("Verification email sent! Please check your inbox.", "success");
    } catch {
      addToast("Failed to resend. Please try again.", "error");
    } finally {
      setIsResendingVerification(false);
    }
  };

  return (
    <main className="min-h-screen bg-surface-base flex items-center justify-center p-4 relative overflow-hidden" ref={containerRef}>
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-emerald-900/20 to-transparent pointer-events-none" />
        <div className="absolute -top-[200px] -right-[200px] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-surface-base to-transparent pointer-events-none" />
      </div>

      <div className="login-card w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6 group">
            <img src={resolvedTheme === "dark" ? "/logo-full.png" : "/logo-full-for-light-mode.png"} alt="The Arena" className="h-20 w-auto mx-auto object-contain drop-shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-transform group-hover:scale-105" />
          </Link>
          <h1 className="text-2xl font-bold text-primary mb-2">Welcome Back</h1>
          <p className="text-secondary text-sm">Sign in to access your account</p>
        </div>

        <div className="bg-surface-raised/50 backdrop-blur-xl border border-default rounded-3xl p-8 shadow-2xl">

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted uppercase ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-muted group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-base/40 border border-subtle rounded-xl pl-12 pr-4 py-3 text-primary placeholder-muted focus:border-emerald-500 focus:outline-none transition-all"
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-muted uppercase">Password</label>
                <Link href="/forgot-password" className="text-xs text-emerald-500 hover:text-emerald-400 font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-muted group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-base/40 border border-subtle rounded-xl pl-12 pr-4 py-3 text-primary placeholder-muted focus:border-emerald-500 focus:outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 mt-6 bg-emerald-500 hover:bg-emerald-400 text-black font-bold tracking-wide relative overflow-hidden"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  <span>Signing In...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Log In</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>
          </form>

          {mounted && (
            <>
              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-default" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-surface-raised px-3 text-xs text-muted">or continue with</span>
                </div>
              </div>

              {/* Google Sign-In */}
              <button
                type="button"
                onClick={() => handleGoogleLogin()}
                disabled={isGoogleLoading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-subtle bg-surface-base/30 hover:bg-surface-overlay hover:border-subtle text-primary text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGoogleLoading ? (
                  <div className="w-4 h-4 border-2 border-subtle border-t-white rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                )}
                <span>{isGoogleLoading ? "Connecting..." : "Continue with Google"}</span>
              </button>
            </>
          )}

          {/* Email Not Verified Banner */}
          {emailNotVerified && (
            <div className="mt-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-amber-300 text-sm font-semibold mb-1">Email Not Verified</p>
                  <p className="text-secondary text-xs leading-relaxed mb-3">
                    Please verify your email address before logging in.
                    Check your inbox or click below to resend the link.
                  </p>
                  <button
                    onClick={handleResendVerification}
                    disabled={isResendingVerification}
                    className="text-xs bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold px-4 py-2 rounded-lg transition-colors"
                  >
                    {isResendingVerification ? "Sending..." : "Resend Verification Email"}
                  </button>
                </div>
              </div>
            </div>
          )}

          <p className="mt-8 text-center text-muted text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary font-bold hover:text-emerald-500 transition-colors">
              Sign Up
            </Link>
          </p>
        </div>

        {/* Security Badge */}
        <div className="mt-8 flex justify-center gap-6 opacity-50">
          <div className="flex items-center gap-2 text-faint text-xs">
            <Shield className="w-3 h-3" /> Secure SSL
          </div>
          <div className="flex items-center gap-2 text-faint text-xs">
            <Lock className="w-3 h-3" /> Encrypted
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}