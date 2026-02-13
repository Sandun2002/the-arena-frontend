"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Lock, Shield, Smartphone, QrCode, Key, AlertOctagon, Trash2 } from "lucide-react";
import gsap from "gsap";
import Button from "@/components/ui/Button";

// -- Mock Data --
const ACTIVE_SESSIONS = [
    { id: "s1", device: "Chrome on Windows", location: "Colombo, LK", ip: "192.168.1.1", last_active: "Active now", is_current: true },
    { id: "s2", device: "Safari on iPhone", location: "Kandy, LK", ip: "192.168.1.5", last_active: "3 hours ago", is_current: false },
];

export default function SecurityPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mfaEnabled, setMfaEnabled] = useState(false);
    const [showSetup, setShowSetup] = useState(false);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(".page-header",
                { y: -20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
            );
            gsap.fromTo(".security-card",
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out", delay: 0.2 }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const toggleMFA = () => {
        if (!mfaEnabled) {
            setShowSetup(true);
        } else {
            setMfaEnabled(false);
        }
    }

    return (
        <main className="min-h-screen bg-black pt-24 pb-20 relative overflow-hidden" ref={containerRef}>
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute bottom-0 right-[-10%] w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[150px]" />
                <div className="absolute top-0 left-[-10%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[150px]" />
            </div>

            <div className="container mx-auto px-4 max-w-4xl relative z-10">
                <Link href="/profile/settings" className="page-header inline-flex items-center text-zinc-500 hover:text-white mb-8 transition-colors group">
                    <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Settings
                </Link>

                <div className="page-header mb-12">
                    <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">
                        Account <span className="text-transparent bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text">Security</span>
                    </h1>
                    <p className="text-zinc-400 max-w-2xl">Manage your password, 2FA, and active sessions.</p>
                </div>

                <div className="space-y-8">

                    {/* MFA Section */}
                    <div className="security-card rounded-[2rem] border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm p-8">
                        <div className="flex items-start justify-between gap-4 mb-6">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                    <Shield className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Two-Factor Authentication</h2>
                                    <p className="text-sm text-zinc-500">Add an extra layer of security to your account.</p>
                                </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${mfaEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                                {mfaEnabled ? 'Enabled' : 'Disabled'}
                            </div>
                        </div>

                        {showSetup && !mfaEnabled ? (
                            <div className="bg-black/40 rounded-xl p-6 border border-zinc-800 animate-fade-in">
                                <h3 className="font-bold text-white mb-4">Setup Authenticator App</h3>
                                <div className="flex flex-col md:flex-row gap-6 items-center">
                                    <div className="w-32 h-32 bg-white p-2 rounded-lg">
                                        {/* Placeholder QR */}
                                        <div className="w-full h-full bg-black/10 flex items-center justify-center text-xs text-black font-mono text-center p-2">
                                            SCAN ME WITH AUTH APP
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <ol className="list-decimal list-inside text-sm text-zinc-400 space-y-2">
                                            <li>Download Google Authenticator or Authy.</li>
                                            <li>Scan the QR code to the left.</li>
                                            <li>Enter the 6-digit code below.</li>
                                        </ol>
                                        <div className="flex gap-2">
                                            <input type="text" placeholder="123 456" className="w-32 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-center text-white font-mono tracking-widest focus:border-blue-500 outline-none" />
                                            <Button onClick={() => { setMfaEnabled(true); setShowSetup(false); }} className="bg-blue-600 text-white hover:bg-blue-500">Verify</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between bg-black/20 p-4 rounded-xl border border-zinc-800/50">
                                <div className="flex items-center gap-3 text-zinc-300">
                                    <Smartphone className="h-5 w-5" />
                                    <span className="text-sm font-medium">Authenticator App</span>
                                </div>

                                <Button
                                    onClick={toggleMFA}
                                    variant={mfaEnabled ? "outline" : "primary"}
                                    className={mfaEnabled ? "border-red-900/50 text-red-500 hover:bg-red-900/10" : "bg-blue-600 text-white hover:bg-blue-500"}
                                >
                                    {mfaEnabled ? "Disable" : "Setup"}
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Active Sessions */}
                    <div className="security-card rounded-[2rem] border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                                <Key className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Active Sessions</h2>
                                <p className="text-sm text-zinc-500">Devices currently logged into your account.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {ACTIVE_SESSIONS.map(session => (
                                <div key={session.id} className="flex justify-between items-center p-4 rounded-xl bg-black/20 border border-zinc-800">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                                            <Smartphone className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-white font-bold text-sm">{session.device} {session.is_current && <span className="text-emerald-500 text-xs ml-2">(Current)</span>}</p>
                                            <p className="text-zinc-500 text-xs">{session.location} • {session.last_active}</p>
                                        </div>
                                    </div>
                                    {!session.is_current && (
                                        <button className="text-zinc-500 hover:text-red-500 transition-colors p-2">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="security-card rounded-[2rem] border border-red-900/30 bg-red-900/5 backdrop-blur-sm p-8">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                                <AlertOctagon className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white mb-1">Delete Account</h2>
                                <p className="text-sm text-zinc-500 mb-4 max-w-lg">
                                    Permanently remove your account and all associated data. This action is irreversible and cannot be undone.
                                </p>
                                <Button className="bg-red-600 text-white hover:bg-red-500 px-6">
                                    Delete My Account
                                </Button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}
