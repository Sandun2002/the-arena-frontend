"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Shield, DeviceMobile, QrCode, CheckCircle, XCircle } from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/services/authContext";
import { authService } from "@/services/authService";
import { useToast } from "@/components/ui/Toast";

export default function MfaPage() {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [isSetupOpen, setIsSetupOpen] = useState(false);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [secret, setSecret] = useState<string | null>(null);
    const [verificationCode, setVerificationCode] = useState("");
    const [disablePassword, setDisablePassword] = useState("");
    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

    const handleSetupMfa = async () => {
        try {
            const data = await authService.setupMfa();
            setQrCode(`data:image/png;base64,${data.qr_code}`);
            setSecret(data.secret);
            setRecoveryCodes([]);
            setIsSetupOpen(true);
        } catch {
            addToast("Failed to start MFA setup", "error");
        }
    };

    const handleVerify = async () => {
        if (verificationCode.length !== 6) {
            addToast("Please enter a 6-digit code", "error");
            return;
        }
        try {
            const result = await authService.verifyMfa(verificationCode);
            setRecoveryCodes(result.recovery_codes || []);
            addToast("2FA enabled successfully", "success");
        } catch {
            addToast("Invalid authentication code", "error");
        }
    };

    const handleDisable = async () => {
        if (!disablePassword) {
            addToast("Enter your password to disable 2FA", "error");
            return;
        }
        try {
            await authService.disableMfa(disablePassword);
            addToast("2FA disabled. You were signed out from other devices.", "success");
            setDisablePassword("");
        } catch {
            addToast("Failed to disable 2FA", "error");
        }
    };

    if (!user) return null;

    return (
        <main className="min-h-screen bg-surface-base pt-24 pb-12 px-4 selection:bg-emerald-500/30">
            <div className="container mx-auto max-w-3xl">

                <Link href="/profile" className="inline-flex items-center text-sm font-medium text-muted hover:text-primary mb-8 transition-colors group">
                    <ArrowLeft size={16} weight="bold" className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Profile
                </Link>

                <div className="bg-surface-raised/50 border border-default rounded-3xl p-8 backdrop-blur-md shadow-2xl">
                    <div className="flex gap-4 mb-8">
                        <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500 border border-emerald-500/20">
                            <Shield size={32} weight="duotone" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-primary">Two-Factor Authentication</h1>
                            <p className="text-muted text-sm mt-1">Secure your account with an authenticator app.</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-6 bg-surface-base/40 border border-default rounded-2xl">
                            <div>
                                <h3 className="text-primary font-bold mb-1">Status</h3>
                                <p className="text-muted text-sm">
                                    {user.is_mfa_enabled ? "Your account is protected with 2FA." : "2FA is currently disabled."}
                                </p>
                            </div>
                            <div>
                                {user.is_mfa_enabled ? (
                                    <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20">
                                        <CheckCircle size={16} weight="fill" /> Enabled
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-overlay text-secondary text-xs font-bold border border-subtle">
                                        <XCircle size={16} weight="fill" /> Disabled
                                    </span>
                                )}
                            </div>
                        </div>

                        {!user.is_mfa_enabled ? (
                            !isSetupOpen ? (
                                <Button onClick={handleSetupMfa} className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-6 text-lg shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                                    <DeviceMobile size={20} weight="bold" className="mr-2" /> Setup 2FA Now
                                </Button>
                            ) : (
                                <div className="bg-surface-base/50 p-6 rounded-2xl border border-default animate-in fade-in slide-in-from-top-4 duration-300">
                                    <h3 className="text-primary font-bold mb-4 flex items-center gap-2">
                                        <QrCode size={20} weight="bold" className="text-emerald-500" />
                                        Scan QR Code
                                    </h3>
                                    <div className="flex flex-col md:flex-row gap-8 items-center">
                                        <div className="p-4 bg-white rounded-xl">
                                            {qrCode && <Image src={qrCode} alt="MFA QR code" width={160} height={160} className="h-40 w-40" unoptimized />}
                                        </div>
                                        <div className="flex-1 w-full">
                                            <ol className="list-decimal list-inside text-secondary text-sm space-y-2 mb-6 ml-2">
                                                <li>Open your authenticator app (Google Auth, Authy).</li>
                                                <li>Scan the QR code shown here.</li>
                                                <li>Enter the 6-digit code below.</li>
                                            </ol>
                                            <input
                                                type="text"
                                                placeholder="000 000"
                                                value={verificationCode}
                                                onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                                                className="w-full bg-surface-raised border border-subtle text-primary p-4 rounded-xl mb-4 text-center tracking-[0.5em] font-mono text-2xl focus:border-emerald-500 focus:outline-none transition-colors"
                                                maxLength={6}
                                            />
                                            <div className="flex gap-3">
                                                <Button className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold" onClick={handleVerify}>Verify</Button>
                                                <Button variant="outline" className="flex-1 border-subtle text-secondary hover:text-primary" onClick={() => setIsSetupOpen(false)}>Cancel</Button>
                                            </div>
                                            {secret && (
                                                <p className="mt-4 text-xs text-muted break-all">Backup code seed: {secret}</p>
                                            )}
                                        </div>
                                    </div>
                                    {recoveryCodes.length > 0 && (
                                        <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                                            <p className="mb-3 text-sm font-bold text-primary">Recovery Codes</p>
                                            <div className="grid grid-cols-2 gap-2 text-sm font-mono text-emerald-300">
                                                {recoveryCodes.map((code) => <span key={code}>{code}</span>)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        ) : (
                            <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-2xl">
                                <h3 className="text-red-500 font-bold mb-2">Danger Zone</h3>
                                <p className="text-muted text-sm mb-4">Disabling 2FA makes your account less secure.</p>
                                <input
                                    type="password"
                                    value={disablePassword}
                                    onChange={(e) => setDisablePassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="mb-4 w-full rounded-xl border border-subtle bg-surface-base/40 px-4 py-3 text-primary focus:border-red-500 focus:outline-none"
                                />
                                <Button variant="outline" onClick={handleDisable} className="w-full border-red-900/50 text-red-500 hover:bg-red-500/10">
                                    Disable 2FA
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
