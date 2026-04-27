
"use client";

import { Clock, Info, CheckCircle2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { format } from "date-fns";
import { Venue } from "@/types";

interface VenuePendingVerificationProps {
    venue: Venue;
}

export default function VenuePendingVerification({ venue }: VenuePendingVerificationProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Ambient Background Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg aspect-square bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="w-full max-w-2xl bg-surface-raised/40 border border-default rounded-[2.5rem] p-8 md:p-12 backdrop-blur-md relative overflow-hidden">
                {/* Decorative particles */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px] rounded-full" />
                
                <div className="flex flex-col items-center text-center relative z-10">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mb-8 ring-1 ring-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                        <Clock className="w-10 h-10 text-emerald-500 animate-pulse" />
                    </div>

                    <h1 className="text-3xl md:text-4xl font-black text-primary uppercase tracking-tight mb-4 leading-tight">
                        Verification <span className="text-emerald-500">In Progress</span>
                    </h1>
                    
                    <p className="text-secondary text-lg mb-8 max-w-md">
                        Great work, <strong>{venue.name}</strong> is now in our verification queue.
                    </p>

                    <div className="w-full space-y-4 mb-10">
                        <div className="bg-surface-base/40 border border-default/50 rounded-2xl p-4 flex gap-4 items-start text-left">
                            <div className="mt-1 p-1 bg-blue-500/20 rounded-lg">
                                <Info className="w-4 h-4 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-primary mb-1">Why is this required?</p>
                                <p className="text-xs text-muted leading-relaxed">
                                    To maintain the highest quality and security on TheArena.lk, all venues must undergo a manual verification process before they can accept public bookings.
                                </p>
                            </div>
                        </div>

                        <div className="bg-surface-base/40 border border-default/50 rounded-2xl p-4 flex gap-4 items-start text-left">
                            <div className="mt-1 p-1 bg-emerald-500/20 rounded-lg">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-primary mb-1">What's next?</p>
                                <p className="text-xs text-muted leading-relaxed">
                                    Our admin team will review your Business Registration (BR) document. Once approved, your full dashboard will be unlocked automatically.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <Button 
                            className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-8 h-12 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] shadow-emerald-500/20"
                            onClick={() => window.location.reload()}
                        >
                            Refresh Status
                        </Button>
                        <Button 
                            variant="ghost" 
                            className="text-secondary hover:text-primary font-bold h-12"
                            onClick={() => window.location.href = '/'}
                        >
                            Back to Home
                        </Button>
                    </div>

                    <p className="mt-12 text-[10px] text-faint font-bold uppercase tracking-widest">
                        Submitted on {format(new Date(venue.created_at || new Date()), 'MMMM dd, yyyy')}
                    </p>
                </div>
            </div>
        </div>
    );
}
