"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { ArrowLeft, Save, Loader2, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/services/authContext";
import { playerService } from "@/services/playerService";
import { useToast } from "@/components/ui/Toast";

export default function ChangePasswordPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { addToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
        defaultValues: {
            current_password: "",
            new_password: "",
            confirm_password: ""
        }
    });

    const newPassword = watch("new_password");

    const onSubmit = async (data: any) => {
        if (!user) return;
        setIsSubmitting(true);
        try {
            await playerService.changePassword(user.id, data.current_password, data.new_password);
            addToast("Password changed successfully", "success");
            reset();
            setTimeout(() => router.push("/profile"), 1500);
        } catch (error: any) {
            addToast(error.message || "Failed to change password", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) return null;

    return (
        <main className="min-h-screen bg-black pt-24 pb-12 px-4 selection:bg-emerald-500/30">
            <div className="container mx-auto max-w-xl">

                <Link href="/profile" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-white mb-8 transition-colors group">
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Profile
                </Link>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-md shadow-2xl">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500 border border-emerald-500/20">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Change Password</h1>
                            <p className="text-zinc-500 text-sm mt-1">Enhance your account security</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Current Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-zinc-500" />
                                <input
                                    type={showCurrent ? "text" : "password"}
                                    {...register("current_password", { required: "Current password is required" })}
                                    className="w-full bg-black/50 border border-zinc-800 rounded-xl pl-10 pr-12 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all"
                                    placeholder="Enter current password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrent(!showCurrent)}
                                    className="absolute right-4 top-3.5 text-zinc-500 hover:text-white transition-colors"
                                >
                                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.current_password && <p className="text-red-500 text-xs mt-1">{errors.current_password.message as string}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-zinc-500" />
                                <input
                                    type={showNew ? "text" : "password"}
                                    {...register("new_password", {
                                        required: "New password is required",
                                        minLength: { value: 8, message: "Must be at least 8 characters" }
                                    })}
                                    className="w-full bg-black/50 border border-zinc-800 rounded-xl pl-10 pr-12 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all"
                                    placeholder="Enter new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNew(!showNew)}
                                    className="absolute right-4 top-3.5 text-zinc-500 hover:text-white transition-colors"
                                >
                                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.new_password && <p className="text-red-500 text-xs mt-1">{errors.new_password.message as string}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Confirm New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-zinc-500" />
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    {...register("confirm_password", {
                                        validate: value => value === newPassword || "Passwords do not match"
                                    })}
                                    className="w-full bg-black/50 border border-zinc-800 rounded-xl pl-10 pr-12 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all"
                                    placeholder="Confirm new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-4 top-3.5 text-zinc-500 hover:text-white transition-colors"
                                >
                                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.confirm_password && <p className="text-red-500 text-xs mt-1">{errors.confirm_password.message as string}</p>}
                        </div>

                        <div className="pt-6 flex items-center justify-end gap-4 border-t border-zinc-800/50 mt-8">
                            <Link href="/profile">
                                <Button type="button" variant="ghost" className="hover:bg-zinc-800 text-zinc-400 hover:text-white">Cancel</Button>
                            </Link>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-8 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                Update Password
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}
