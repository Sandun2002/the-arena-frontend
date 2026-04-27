"use client";

import Link from "next/link";
import { ArrowLeft, Shield, Monitor, ChevronRight } from "lucide-react";
import { useAuth } from "@/services/authContext";

export default function SecurityPage() {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <main className="min-h-screen bg-surface-base pt-24 pb-12 px-4">
            <div className="container mx-auto max-w-3xl">
                <Link href="/profile" className="inline-flex items-center text-sm text-muted hover:text-primary mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Profile
                </Link>

                <h1 className="text-3xl font-bold text-primary mb-2">Security</h1>
                <p className="text-secondary mb-8">Manage authentication, devices, and account hardening.</p>

                <div className="space-y-6">
                    <Link href="/settings/mfa" className="block rounded-3xl border border-default bg-surface-raised/50 p-8 backdrop-blur-sm transition-colors hover:border-emerald-500/30">
                        <div className="flex items-center justify-between gap-6">
                            <div className="flex gap-4">
                                <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-500">
                                    <Shield className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-primary">Two-Factor Authentication</h2>
                                    <p className="mt-1 text-sm text-secondary">
                                        {user.is_mfa_enabled ? "MFA is enabled for this account." : "Add an authenticator app to protect sign-in."}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`rounded-full border px-3 py-1 text-xs font-bold ${user.is_mfa_enabled ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500" : "border-subtle bg-surface-overlay text-secondary"}`}>
                                    {user.is_mfa_enabled ? "Enabled" : "Disabled"}
                                </span>
                                <ChevronRight className="h-5 w-5 text-muted" />
                            </div>
                        </div>
                    </Link>

                    <Link href="/settings/sessions" className="block rounded-3xl border border-default bg-surface-raised/50 p-8 backdrop-blur-sm transition-colors hover:border-blue-500/30">
                        <div className="flex items-center justify-between gap-6">
                            <div className="flex gap-4">
                                <div className="rounded-xl bg-blue-500/10 p-3 text-blue-500">
                                    <Monitor className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-primary">Active Sessions</h2>
                                    <p className="mt-1 text-sm text-secondary">Inspect current devices and sign out other sessions.</p>
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted" />
                        </div>
                    </Link>
                </div>
            </div>
        </main>
    );
}
