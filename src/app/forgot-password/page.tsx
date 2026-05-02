
"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, EnvelopeSimple, CircleNotch } from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import { authService } from "@/services/authService";
import { useToast } from "@/components/ui/Toast";

export default function ForgotPasswordPage() {
    const { addToast } = useToast();
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsSubmitting(true);
        try {
            await authService.requestPasswordReset(email);
            setIsSent(true);
            addToast("Reset link sent to your email", "success");
        } catch (error) {
            addToast("Failed to send reset link", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-surface-base flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Link href="/login" className="mb-8 inline-flex items-center text-sm text-muted hover:text-primary transition-colors">
                    <ArrowLeft size={16} weight="bold" className="mr-2" /> Back to Login
                </Link>

                <div className="rounded-3xl border border-default bg-surface-raised/50 p-8 backdrop-blur-xl shadow-2xl">
                    <h1 className="text-2xl font-bold text-primary mb-2">Reset Password</h1>
                    <p className="text-secondary mb-6">Enter your email to receive recovery instructions.</p>

                    {!isSent ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-muted uppercase">Email Address</label>
                                <div className="relative group">
                                    <EnvelopeSimple size={20} weight="duotone" className="absolute left-4 top-3.5 text-muted group-focus-within:text-emerald-500 transition-colors" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full rounded-xl border border-subtle bg-surface-base/50 pl-12 pr-4 py-3 text-primary focus:border-emerald-500 focus:outline-none transition-colors"
                                        placeholder="john@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold"
                            >
                                {isSubmitting ? <CircleNotch size={20} weight="bold" className="animate-spin mx-auto" /> : "Send Reset Link"}
                            </Button>
                        </form>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <EnvelopeSimple size={32} weight="duotone" className="text-emerald-500" />
                            </div>
                            <h3 className="text-xl font-bold text-primary mb-2">Check your email</h3>
                            <p className="text-secondary text-sm mb-6">
                                We have sent a password reset link to <span className="text-primary font-bold">{email}</span>.
                            </p>
                            <Button
                                onClick={() => setIsSent(false)}
                                variant="outline"
                                className="w-full"
                            >
                                Try another email
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
