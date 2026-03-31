
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/components/ui/Button";
import { ArrowLeft, Loader2, Building2 } from "lucide-react";
import { authService } from "@/services/authService";
import { useToast } from "@/components/ui/Toast";

const venueSignupSchema = z.object({
  fullName: z.string().min(2, "Owner name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^(?:\+94|0)[0-9]{2}[0-9]{7}$/, "Invalid Sri Lankan phone number"),
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

type FormData = z.infer<typeof venueSignupSchema>;

export default function VenueSignupPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(venueSignupSchema)
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await authService.signup({
        full_name: data.fullName,
        email: data.email,
        phone_number: data.phone,
        password: data.password,
        role: "venue_owner"
      });

      // Note: In real app, we might also create the Venue object here or in onboarding
      // For now just creating the owner account

      addToast("Owner account created! Please log in to setup your venue.", "success");
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
    <main className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/signup" className="mb-8 inline-flex items-center text-sm text-zinc-500 hover:text-white transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Selection
        </Link>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8 backdrop-blur-xl shadow-blue-900/10 shadow-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-500" />
            </div>
            <h1 className="text-3xl font-bold text-white">Venue Owner</h1>
          </div>
          <p className="text-zinc-400 mb-8">Register to list and manage your sports venue.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-500 uppercase">Owner Full Name</label>
              <input
                {...register("fullName")}
                className="w-full rounded-xl border border-zinc-700 bg-black/50 p-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="Sanjeewa Silva"
              />
              {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName.message}</p>}
            </div>



            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-500 uppercase">Business Email</label>
              <input
                {...register("email")}
                type="email"
                className="w-full rounded-xl border border-zinc-700 bg-black/50 p-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="owner@arena.lk"
              />
              {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-500 uppercase">Phone Number</label>
              <input
                {...register("phone")}
                type="tel"
                className="w-full rounded-xl border border-zinc-700 bg-black/50 p-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="0771234567"
              />
              {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-500 uppercase">Password</label>
              <input
                {...register("password")}
                type="password"
                className="w-full rounded-xl border border-zinc-700 bg-black/50 p-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-500 uppercase">Confirm Password</label>
              <input
                {...register("confirmPassword")}
                type="password"
                className="w-full rounded-xl border border-zinc-700 bg-black/50 p-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="••••••••"
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold border-none"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Register Owner Account"}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}