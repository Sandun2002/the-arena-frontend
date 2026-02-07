"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { Mail, Lock, ArrowLeft, User, Building2 } from "lucide-react";
import { useAuth } from "@/services/authContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const handleDemoLogin = (type: "player" | "venue") => {
    login(type);
    if (type === "player") {
      router.push("/bookings");
    } else {
      router.push("/venue-dashboard");
    }
  };

  return (
    <main className="min-h-screen w-full bg-black flex items-center justify-center relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px]" />

      <div className="relative z-10 w-full max-w-md p-4">
        <Link href="/" className="inline-flex items-center text-zinc-500 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8 backdrop-blur-xl shadow-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-zinc-400">Sign in to access your bookings and dashboard.</p>
          </div>

          <form className="space-y-6">
            <div>
              <label className="mb-2 block text-xs font-bold text-zinc-500 uppercase">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                <input 
                  type="email" 
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-zinc-700 bg-black/50 py-3 pl-10 pr-4 text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold text-zinc-500 uppercase">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-zinc-700 bg-black/50 py-3 pl-10 pr-4 text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
            </div>

            <Button className="w-full py-4 bg-emerald-500 text-black hover:bg-white font-bold">
              Sign In
            </Button>
          </form>

          {/* Demo Login Buttons */}
          <div className="mt-8 pt-6 border-t border-zinc-800">
            <p className="text-center text-xs text-zinc-500 uppercase tracking-wider mb-4">Demo Quick Login</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleDemoLogin("player")}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-sm font-medium hover:border-emerald-500 hover:bg-zinc-700 transition-all"
              >
                <User className="h-4 w-4 text-emerald-500" />
                As Player
              </button>
              <button
                onClick={() => handleDemoLogin("venue")}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-sm font-medium hover:border-blue-500 hover:bg-zinc-700 transition-all"
              >
                <Building2 className="h-4 w-4 text-blue-400" />
                As Venue
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-zinc-500">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-bold text-emerald-500 hover:underline">
              Join Arena
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}