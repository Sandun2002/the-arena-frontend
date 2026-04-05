
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/components/ui/Button";
import { ArrowLeft, Loader2, Check } from "lucide-react";
import { authService } from "@/services/authService";
import { useToast } from "@/components/ui/Toast";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  console.log("Signup Page Version: 3.1 - Enhanced Diagnostics Active");
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(playerSignupSchema)
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
    <main className="min-h-screen bg-black flex flex-col items-center justify-start pt-24 pb-12 px-4">
      <div className="w-full max-w-md">
        <Link href="/signup" className="mb-8 inline-flex items-center text-sm text-zinc-500 hover:text-white transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Selection
        </Link>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8 backdrop-blur-xl shadow-2xl">
          <h1 className="text-3xl font-bold text-white mb-2">Player Sign Up</h1>
          <p className="text-zinc-400 mb-8">Create your athlete profile to start booking.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-500 uppercase">First Name</label>
                <input
                  {...register("firstName")}
                  className="w-full rounded-xl border border-zinc-700 bg-black/50 p-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                  placeholder="Dilshan"
                />
                {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-500 uppercase">Last Name</label>
                <input
                  {...register("lastName")}
                  className="w-full rounded-xl border border-zinc-700 bg-black/50 p-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                  placeholder="Perera"
                />
                {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-500 uppercase">Email</label>
              <input
                {...register("email")}
                type="email"
                className="w-full rounded-xl border border-zinc-700 bg-black/50 p-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                placeholder="dilshan@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-500 uppercase">
                Phone Number <span className="text-zinc-600 text-[10px] normal-case ml-1">(e.g. 0771234567)</span>
              </label>
              <input
                {...register("phone")}
                type="tel"
                className="w-full rounded-xl border border-zinc-700 bg-black/50 p-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                placeholder="0771234567"
              />
              {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-500 uppercase">Password</label>
              <input
                {...register("password")}
                type="password"
                className="w-full rounded-xl border border-zinc-700 bg-black/50 p-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-500 uppercase">Confirm Password</label>
              <input
                {...register("confirmPassword")}
                type="password"
                className="w-full rounded-xl border border-zinc-700 bg-black/50 p-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                placeholder="••••••••"
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 mt-6 bg-emerald-500 hover:bg-emerald-400 text-black font-bold tracking-wide"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Create Account"}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}