
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Shield, Smartphone, Monitor, Laptop, Globe, Clock, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/services/authContext";
import { authService } from "@/services/authService";
import { useToast } from "@/components/ui/Toast";
import { Session } from "@/types";
import { formatDistanceToNow } from "date-fns";

export default function SecurityPage() {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [isMfaSetupOpen, setIsMfaSetupOpen] = useState(false);
    const [qrCode, setQrCode] = useState<string | null>(null);

    const loadSessions = async () => {
        try {
            const data = await authService.getSessions();
            setSessions(data);
        } catch (error) {
            console.error("Failed to load sessions");
        }
    };

    useEffect(() => {
        loadSessions();
    }, []);

    const handleSetupMfa = async () => {
        setIsMfaSetupOpen(true);
        const data: any = await authService.setupMfa();
        // In real app, we'd render the QR code from data.qr_code_uri
        // For mock, we'll just show a placeholder
        setQrCode(data.qr_code_uri);
    };

    const handleRevokeSession = async (jti: string) => {
        addToast("Session revoked", "success");
        setSessions(prev => prev.filter(s => s.jti !== jti));
        // Call service in real app
    };

    if (!user) return null;

    return (
        <main className="min-h-screen bg-black pt-24 pb-12 px-4">
            <div className="container mx-auto max-w-3xl">

                <Link href="/profile" className="inline-flex items-center text-sm text-zinc-500 hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Profile
                </Link>

                <h1 className="text-3xl font-bold text-white mb-2">Security</h1>
                <p className="text-zinc-400 mb-8">Manage your account security and active sessions.</p>

                {/* MFA Section */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-sm mb-8">
                    <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                            <div className="p-3 bg-emerald-500/10 rounded-xl h-fit">
                                <Shield className="w-6 h-6 text-emerald-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1">Two-Factor Authentication</h3>
                                <p className="text-zinc-400 text-sm max-w-md">
                                    Add an extra layer of security to your account by requiring a code from your authenticator app.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {user.is_mfa_enabled ? (
                                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20">Enabled</span>
                            ) : (
                                <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 text-xs font-bold border border-zinc-700">Disabled</span>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-zinc-800">
                        {!user.is_mfa_enabled ? (
                            !isMfaSetupOpen ? (
                                <Button onClick={handleSetupMfa} className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold">
                                    Setup 2FA
                                </Button>
                            ) : (
                                <div className="bg-black/50 p-6 rounded-xl border border-zinc-800">
                                    <p className="text-white font-bold mb-4">Scan QR Code</p>
                                    <div className="w-48 h-48 bg-white mx-auto mb-4 flex items-center justify-center">
                                        {/* Placeholder for QR */}
                                        <div className="text-black text-xs text-center p-2 break-all">{qrCode}</div>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Enter 6-digit code"
                                        className="w-full bg-zinc-900 border border-zinc-700 text-white p-3 rounded-lg mb-4 text-center tracking-widest font-mono"
                                        maxLength={6}
                                    />
                                    <div className="flex gap-3">
                                        <Button className="w-full" onClick={() => addToast("MFA Enabled (Mock)", "success")}>Verify & Enable</Button>
                                        <Button variant="outline" className="w-full" onClick={() => setIsMfaSetupOpen(false)}>Cancel</Button>
                                    </div>
                                </div>
                            )
                        ) : (
                            <Button variant="outline" className="text-red-400 border-red-900/50 hover:bg-red-900/20">Disable 2FA</Button>
                        )}
                    </div>
                </div>

                {/* Active Sessions */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-sm">
                    <div className="flex gap-4 mb-8">
                        <div className="p-3 bg-blue-500/10 rounded-xl h-fit">
                            <Monitor className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-1">Active Sessions</h3>
                            <p className="text-zinc-400 text-sm">Devices currently logged into your account.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {sessions.map((session) => (
                            <div key={session.jti} className="flex items-center justify-between p-4 bg-black/30 border border-zinc-800 rounded-xl">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center">
                                        {session.user_agent.toLowerCase().includes("mobile") ? <Smartphone className="w-5 h-5 text-zinc-400" /> : <Laptop className="w-5 h-5 text-zinc-400" />}
                                    </div>
                                    <div>
                                        <p className="text-white font-medium text-sm flex items-center gap-2">
                                            {session.user_agent.split(")")[0] + ")"}
                                            {session.is_current && <span className="bg-emerald-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded">THIS DEVICE</span>}
                                        </p>
                                        <div className="flex items-center gap-4 mt-1">
                                            <span className="text-xs text-zinc-500 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> Active {formatDistanceToNow(new Date(session.created_at))} ago
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {!session.is_current && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-zinc-500 hover:text-red-400"
                                        onClick={() => handleRevokeSession(session.jti)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </main>
    );
}
