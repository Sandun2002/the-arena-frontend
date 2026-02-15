"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, Check, Clock, CreditCard, Lock, MapPin, ShieldCheck, Trophy, User } from "lucide-react";
import gsap from "gsap";
import Button from "@/components/ui/Button";

// -- Mock Pricing Data --
const MOCK_PRICING = {
    venue_name: "Emerald Turf Arena",
    court_name: "Court A - Futsal",
    image: "https://images.unsplash.com/photo-1522778119026-d647f0565c6a?q=80&w=2670&auto=format&fit=crop",
    hourly_rate: 1800,
    service_fee: 150,
    tax: 0,
};


import { Suspense } from "react";

function CheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);

    // Parse query params
    const date = searchParams.get("date") || new Date().toISOString().split('T')[0];
    const startTime = searchParams.get("start") || "18:00";
    const endTime = searchParams.get("end") || "19:00";

    // State
    const [step, setStep] = useState<"summary" | "payment" | "success">("summary");
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">("card");
    const [bookingId, setBookingId] = useState("");

    useEffect(() => {
        setBookingId(`BK-${Math.floor(Math.random() * 10000)}`);
    }, []);

    const totalDuration = 1; // Simplify to 1 hour for now
    const subtotal = MOCK_PRICING.hourly_rate * totalDuration;
    const total = subtotal + MOCK_PRICING.service_fee;

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(".checkout-container",
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const handlePayment = async () => {
        setIsProcessing(true);
        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsProcessing(false);
        setStep("success");

        // Final success animation
        gsap.fromTo(".success-card",
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
        );
    };

    return (
        <main className="min-h-screen bg-black pt-24 pb-20 relative overflow-hidden" ref={containerRef}>
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="container mx-auto px-4 max-w-4xl relative z-10">

                {/* Back Link (only visible in summary step) */}
                {step === "summary" && (
                    <Link href="/search" className="inline-flex items-center text-zinc-500 hover:text-white mb-8 transition-colors group">
                        <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Search results
                    </Link>
                )}

                <div className="checkout-container grid md:grid-cols-3 gap-8">

                    {/* -- Left Column: Booking Summary -- */}
                    <div className="md:col-span-2 space-y-6">
                        {step === "success" ? (
                            // SUCCESS STATE
                            <div className="success-card bg-zinc-900/40 border border-emerald-500 rounded-[2rem] p-10 text-center backdrop-blur-sm">
                                <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                                    <Check className="h-10 w-10 text-black" />
                                </div>
                                <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Booking Confirmed!</h2>
                                <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                                    Your slot at <span className="text-white font-bold">{MOCK_PRICING.venue_name}</span> has been successfully reserved. A confirmation email has been sent.
                                </p>

                                <div className="bg-black/40 rounded-xl p-6 mb-8 border border-zinc-800 text-left relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-2 opacity-50">
                                        <Trophy className="h-24 w-24 text-zinc-800 rotate-12 -mr-6 -mt-6" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 relative z-10">
                                        <div>
                                            <p className="text-xs text-zinc-500 uppercase font-bold">Booking ID</p>
                                            <p className="text-white font-mono">#BK-{bookingId}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-zinc-500 uppercase font-bold">Date</p>
                                            <p className="text-white">{date}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-zinc-500 uppercase font-bold">Time</p>
                                            <p className="text-white">{startTime} - {endTime}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-zinc-500 uppercase font-bold">Venue</p>
                                            <p className="text-white truncate">{MOCK_PRICING.venue_name}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link href="/bookings">
                                        <Button className="w-full sm:w-auto bg-emerald-500 text-black font-bold hover:bg-emerald-400 px-8">
                                            View My Bookings
                                        </Button>
                                    </Link>
                                    <Link href="/">
                                        <Button variant="outline" className="w-full sm:w-auto border-zinc-700 text-white hover:bg-zinc-800">
                                            Return Home
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            // SUMMARY & PAYMENT STEPS
                            <>
                                <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm overflow-hidden">
                                    <div className="relative h-48 w-full">
                                        <Image
                                            src={MOCK_PRICING.image}
                                            alt={MOCK_PRICING.venue_name}
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />
                                        <div className="absolute bottom-6 left-6 right-6">
                                            <h1 className="text-3xl font-black text-white mb-1 uppercase tracking-tight">{MOCK_PRICING.venue_name}</h1>
                                            <div className="flex items-center gap-2 text-zinc-300 text-sm font-medium">
                                                <MapPin className="h-4 w-4 text-emerald-500" />
                                                Colombo 07 • {MOCK_PRICING.court_name}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <div className="bg-black/40 p-4 rounded-xl border border-zinc-800 flex items-center gap-3">
                                                <Calendar className="h-5 w-5 text-emerald-500" />
                                                <div>
                                                    <p className="text-xs text-zinc-500 font-bold uppercase">Date</p>
                                                    <p className="text-white font-medium">{date}</p>
                                                </div>
                                            </div>
                                            <div className="bg-black/40 p-4 rounded-xl border border-zinc-800 flex items-center gap-3">
                                                <Clock className="h-5 w-5 text-emerald-500" />
                                                <div>
                                                    <p className="text-xs text-zinc-500 font-bold uppercase">Time</p>
                                                    <p className="text-white font-medium">{startTime} - {endTime}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3 border-t border-zinc-800 pt-6">
                                            <div className="flex justify-between text-zinc-400">
                                                <span>Court Rental ({totalDuration} hr)</span>
                                                <span>LKR {subtotal.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-zinc-400">
                                                <span>Service Fee</span>
                                                <span>LKR {MOCK_PRICING.service_fee.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-white text-xl font-bold pt-3 border-t border-zinc-800/50">
                                                <span>Total</span>
                                                <span>LKR {total.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Method Selection */}
                                {step === "payment" && (
                                    <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm p-6 animate-fade-in">
                                        <h3 className="text-xl font-bold text-white mb-4">Payment Method</h3>
                                        <div className="space-y-3">
                                            <button
                                                onClick={() => setPaymentMethod("card")}
                                                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${paymentMethod === "card"
                                                    ? "bg-emerald-500/10 border-emerald-500 text-white"
                                                    : "bg-black/20 border-zinc-800 text-zinc-400 hover:bg-zinc-900"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <CreditCard className="h-5 w-5" />
                                                    <span className="font-bold">PayHere Checkout</span>
                                                </div>
                                                <div className="flex gap-1">
                                                    {/* Mock Card Icons */}
                                                    <div className="w-8 h-5 bg-white/10 rounded"></div>
                                                    <div className="w-8 h-5 bg-white/10 rounded"></div>
                                                </div>
                                            </button>

                                            <button
                                                onClick={() => setPaymentMethod("cash")}
                                                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${paymentMethod === "cash"
                                                    ? "bg-emerald-500/10 border-emerald-500 text-white"
                                                    : "bg-black/20 border-zinc-800 text-zinc-400 hover:bg-zinc-900"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="h-5 w-5 rounded-full border-2 border-current flex items-center justify-center font-serif font-bold text-xs">$</div>
                                                    <span className="font-bold">Pay at Venue</span>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* -- Right Column: Action Card -- */}
                    {step !== "success" && (
                        <div className="md:col-span-1">
                            <div className="sticky top-24 space-y-4">
                                <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900/60 backdrop-blur-xl p-6 shadow-xl">
                                    <h3 className="text-lg font-bold text-white mb-4">
                                        {step === "summary" ? "Review & Confirm" : "Complete Payment"}
                                    </h3>

                                    <div className="mb-6 space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                                            <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                            <span>Secure Transaction</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                                            <User className="h-4 w-4 text-emerald-500" />
                                            <span>Instant Confirmation</span>
                                        </div>
                                    </div>

                                    {step === "summary" ? (
                                        <Button
                                            onClick={() => setStep("payment")}
                                            className="w-full py-4 text-sm bg-emerald-500 text-black hover:bg-emerald-400 font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all"
                                        >
                                            Continue to Payment
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handlePayment}
                                            disabled={isProcessing}
                                            className="w-full py-4 text-sm bg-emerald-500 text-black hover:bg-emerald-400 font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-2"
                                        >
                                            {isProcessing ? (
                                                <>Processing...</>
                                            ) : (
                                                <>
                                                    <Lock className="h-4 w-4" /> Pay LKR {total.toLocaleString()}
                                                </>
                                            )}
                                        </Button>
                                    )}

                                    <p className="text-xs text-zinc-500 text-center mt-4">
                                        By confirming, you agree to the <Link href="/terms" className="underline hover:text-white">Terms of Service</Link>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    );
}
