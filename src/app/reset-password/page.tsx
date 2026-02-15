
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2, CheckCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { authService } from "@/services/authService";
import { useToast } from "@/components/ui/Toast";

export default function ResetPasswordPage() {
    const router = useRouter();
    const { addToast } = useToast();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            addToast("Passwords do not match", "error");
            return;
        }
        if (password.length < 8) {
            addToast("Password must be at least 8 characters", "error");
            return;
        }

        setIsSubmitting(true);
        try {
            // Mock token usage
            await authService.resetPassword("mock-token", password);
            setIsSuccess(true);
            addToast("Password reset successfully", "success");

            setTimeout(() => {
                router.push("/login");
            }, 2000);
        } catch (error) {
            addToast("Failed to reset password", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8 backdrop-blur-xl shadow-2xl">

                    {!isSuccess ? (
                        <>
                            <h1 className="text-2xl font-bold text-white mb-2">Set New Password</h1>
                            <p className="text-zinc-400 mb-6">Your new password must be different from previously used passwords.</p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-zinc-500 uppercase">New Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-3.5 h-5 w-5 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full rounded-xl border border-zinc-700 bg-black/50 pl-12 pr-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                                            placeholder="••••••••"
                                            required
                                            minLength={8}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-zinc-500 uppercase">Confirm Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-3.5 h-5 w-5 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full rounded-xl border border-zinc-700 bg-black/50 pl-12 pr-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold mt-4"
                                >
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Reset Password"}
                                </Button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-emerald-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Password Reset!</h3>
                            <p className="text-zinc-400 text-sm mb-6">
                                Your password has been successfully updated. You will be redirected to the login page shortly.
                            </p>
                            <Button
                                onClick={() => router.push("/login")}
                                className="w-full bg-emerald-500 text-black font-bold"
                            >
                                Go to Login
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
