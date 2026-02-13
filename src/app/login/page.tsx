"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mail, Lock, ShieldCheck, Loader2, ArrowLeft } from "lucide-react";
import gsap from "gsap";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Login State
  const [step, setStep] = useState<"credentials" | "mfa">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".login-box",
        { y: 20, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: "power3.out" }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (email && password) {
        setLoading(false);
        setStep("mfa");
        // Animate transition
        gsap.fromTo(".mfa-content",
          { x: 20, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.4 }
        );
      } else {
        setLoading(false);
        setError("Please enter both email and password.");
      }
    }, 1000);
  };

  const handleMfaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate Verification
    setTimeout(() => {
      setLoading(false);
      // Determine redirect based on email (mock logic)
      if (email.includes("venue")) {
        router.push("/venue-dashboard");
      } else {
        router.push("/dashboard");
      }
    }, 1500);
  };

  const handleMfaChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple chars
    const newCode = [...mfaCode];
    newCode[index] = value;
    setMfaCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`mfa-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <main className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden" ref={containerRef}>

      {/* Background Ambience */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=2669&auto=format&fit=crop"
          alt="Background"
          fill
          className="object-cover opacity-20 blur-sm"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />
      </div>

      <div className="login-box w-full max-w-md p-8 relative z-10">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center overflow-hidden border border-white/10 group-hover:border-emerald-500/50 transition-colors">
              <span className="font-bold text-white text-xl">A</span>
            </div>
            <span className="font-black text-2xl text-white tracking-tight">
              ARENA<span className="text-emerald-500">.LK</span>
            </span>
          </Link>
          <h2 className="text-zinc-400 font-medium">
            {step === 'credentials' ? "Welcome back, Player." : "Two-Factor Authentication"}
          </h2>
        </div>

        <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">

          {step === 'credentials' ? (
            <form onSubmit={handleCredentialsSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/40 border border-zinc-700 rounded-xl pl-12 pr-4 py-4 text-white focus:border-emerald-500 focus:outline-none focus:bg-emerald-500/5 transition-all"
                  />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/40 border border-zinc-700 rounded-xl pl-12 pr-4 py-4 text-white focus:border-emerald-500 focus:outline-none focus:bg-emerald-500/5 transition-all"
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-sm text-center font-medium bg-red-500/10 py-2 rounded-lg border border-red-500/20">{error}</p>}

              <div className="flex justify-between items-center text-sm">
                <label className="flex items-center gap-2 cursor-pointer text-zinc-400 hover:text-white">
                  <input type="checkbox" className="rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-emerald-500" />
                  Remember me
                </label>
                <Link href="#" className="text-emerald-500 hover:text-emerald-400 font-bold">Forgot Password?</Link>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-4 text-lg font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="animate-spin h-6 w-6" /> : "Sign In"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleMfaSubmit} className="mfa-content space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500 border border-emerald-500/20">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <p className="text-zinc-400 text-sm">
                  We sent a 6-digit code to <span className="text-white font-bold">{email}</span>. Enter it below to continue.
                </p>
              </div>

              <div className="flex justify-between gap-2">
                {mfaCode.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`mfa-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleMfaChange(idx, e.target.value)}
                    className="w-12 h-14 bg-black/40 border border-zinc-700 rounded-xl text-center text-2xl font-bold text-white focus:border-emerald-500 focus:outline-none focus:bg-emerald-500/5 transition-all"
                  />
                ))}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-4 text-lg font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="animate-spin h-6 w-6" /> : "Verify & Login"}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep("credentials")}
                  className="text-zinc-500 hover:text-white text-sm flex items-center justify-center gap-1 mx-auto"
                >
                  <ArrowLeft className="h-3 w-3" /> Back to Login
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="text-center mt-8">
          <p className="text-zinc-500">
            Don't have an account? <Link href="/signup" className="text-white font-bold hover:text-emerald-500 transition-colors">Sign Up</Link>
          </p>
        </div>
      </div>
    </main>
  );
}