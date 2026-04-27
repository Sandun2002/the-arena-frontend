"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/components/ui/Button";
import { ArrowLeft, Loader2, Check } from "lucide-react";
import { authService } from "@/services/authService";
import { useToast } from "@/components/ui/Toast";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/services/authContext";

// Zod Schema matching backend
const playerSignupSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^(?:\+94|0)[0-9]{2}[0-9]{7}$/, "Invalid Sri Lankan phone number (e.g. 0771234567)"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[a-z]/, "Must contain a lowercase letter")
    .regex(/[0-9]/, "Must contain a number")
    .regex(/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\/~`]/, "Must contain a special character"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof playerSignupSchema>;

export default function PlayerSignupPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { loginWithGoogle } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  console.log("Signup Page Version: 3.1 - Enhanced Diagnostics Active");
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(playerSignupSchema)
  });

  const handleGoogleSignup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsGoogleLoading(true);
      try {
        await loginWithGoogle(tokenResponse.access_token);
        addToast("Account created! Welcome to The Arena.", "success");
        router.push("/profile");
      } catch (error: any) {
        const detail = error?.response?.data?.detail || "";
        if (detail === "Google login is not configured on this server") {
          addToast("Google sign-in is not available right now.", "error");
        } else {
          addToast("Google sign-up failed. Please try again.", "error");
        }
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: () => {
      addToast("Google sign-up was cancelled or failed.", "error");
    },
    flow: "implicit",
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await authService.signup({
        full_name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phone_number: data.phone,
        password: data.password,
        role: "customer"
      });

      addToast("Account created successfully! Please log in.", "success");
      router.push("/check-email?email=" + encodeURIComponent(data.email));
    } catch (error: any) {
      console.error("Signup error details:", error);
      let errorMessage = "Failed to create account.";
      
      if (error.response) {
        const errorData = error.response.data?.error;
        if (errorData?.details && errorData.details.length > 0) {
          errorMessage = errorData.details[0].message;
        } else {
          errorMessage = errorData?.message || error.response.data?.detail || `Server Error (${error.response.status})`;
        }
      } else if (error.request) {
        errorMessage = "No response from server. Check your connection or backend status.";
      } else {
        errorMessage = error.message;
      }
      addToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-surface-base flex flex-col items-center justify-start pt-16 pb-24 px-4">
      <div className="w-full max-w-md">
        <Link href="/signup" className="mb-6 inline-flex items-center text-sm text-muted hover:text-primary transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Selection
        </Link>

        <div className="rounded-3xl border border-default bg-surface-raised/50 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-1">Player Sign Up</h1>
          <p className="text-secondary text-sm mb-6">Create your athlete profile to start booking.</p>

          {/* Google Sign-Up — TOP for best UX and visibility */}
          {mounted && (
            <div className="mb-6">
              <button
                type="button"
                onClick={() => handleGoogleSignup()}
                disabled={isGoogleLoading}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border border-subtle bg-surface-overlay/60 hover:bg-surface-overlay hover:border-subtle text-primary text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {isGoogleLoading ? (
                  <div className="w-4 h-4 border-2 border-zinc-500 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                )}
                <span>{isGoogleLoading ? "Connecting..." : "Continue with Google"}</span>
              </button>
            </div>
          )}

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-default" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-surface-raised/50 px-3 text-xs text-muted">or sign up with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-muted uppercase">First Name</label>
                <input
                  {...register("firstName")}
                  className="w-full rounded-xl border border-subtle bg-surface-base/50 p-3 text-primary placeholder-muted focus:border-emerald-500 focus:outline-none transition-colors"
                  placeholder="Dilshan"
                />
                {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-muted uppercase">Last Name</label>
                <input
                  {...register("lastName")}
                  className="w-full rounded-xl border border-subtle bg-surface-base/50 p-3 text-primary placeholder-muted focus:border-emerald-500 focus:outline-none transition-colors"
                  placeholder="Perera"
                />
                {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-muted uppercase">Email</label>
              <input
                {...register("email")}
                type="email"
                className="w-full rounded-xl border border-subtle bg-surface-base/50 p-3 text-primary placeholder-muted focus:border-emerald-500 focus:outline-none transition-colors"
                placeholder="dilshan@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-muted uppercase">
                Phone Number <span className="text-faint text-[10px] normal-case ml-1">(e.g. 0771234567)</span>
              </label>
              <input
                {...register("phone")}
                type="tel"
                className="w-full rounded-xl border border-subtle bg-surface-base/50 p-3 text-primary placeholder-muted focus:border-emerald-500 focus:outline-none transition-colors"
                placeholder="0771234567"
              />
              {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-muted uppercase">Password</label>
              <input
                {...register("password")}
                type="password"
                className="w-full rounded-xl border border-subtle bg-surface-base/50 p-3 text-primary placeholder-muted focus:border-emerald-500 focus:outline-none transition-colors"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-muted uppercase">Confirm Password</label>
              <input
                {...register("confirmPassword")}
                type="password"
                className="w-full rounded-xl border border-subtle bg-surface-base/50 p-3 text-primary placeholder-muted focus:border-emerald-500 focus:outline-none transition-colors"
                placeholder="••••••••"
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 mt-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold tracking-wide"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Create Account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-muted text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-bold hover:text-emerald-500 transition-colors">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}