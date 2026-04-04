
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ArrowRight, Lock, Mail, Shield } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/services/authContext";
import { useToast } from "@/components/ui/Toast";

export default function LoginPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { login, loading } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);

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
      const isOwnerOrManager = userData.roles.some((r) => r.slug === "venue_owner" || r.slug === "venue_manager");
      if (isOwnerOrManager) {
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
    <main className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden" ref={containerRef}>
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-emerald-900/20 to-transparent pointer-events-none" />
        <div className="absolute -top-[200px] -right-[200px] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-black to-transparent pointer-events-none" />
      </div>

      <div className="login-card w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6 group">
            <img src="/logo-full.png" alt="The Arena" className="h-20 w-auto mx-auto object-contain drop-shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-transform group-hover:scale-105" />
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-zinc-400 text-sm">Sign in to access your account</p>
        </div>

        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 shadow-2xl">

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/40 border border-zinc-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none transition-all"
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-zinc-500 uppercase">Password</label>
                <Link href="/forgot-password" className="text-xs text-emerald-500 hover:text-emerald-400 font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-zinc-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none transition-all"
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

          {/* Email Not Verified Banner */}
          {emailNotVerified && (
            <div className="mt-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-amber-300 text-sm font-semibold mb-1">Email Not Verified</p>
                  <p className="text-zinc-400 text-xs leading-relaxed mb-3">
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

          <p className="mt-8 text-center text-zinc-500 text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-white font-bold hover:text-emerald-500 transition-colors">
              Sign Up
            </Link>
          </p>
        </div>

        {/* Security Badge */}
        <div className="mt-8 flex justify-center gap-6 opacity-50">
          <div className="flex items-center gap-2 text-zinc-600 text-xs">
            <Shield className="w-3 h-3" /> Secure SSL
          </div>
          <div className="flex items-center gap-2 text-zinc-600 text-xs">
            <Lock className="w-3 h-3" /> Encrypted
          </div>
        </div>
      </div>
    </main>
  );
}