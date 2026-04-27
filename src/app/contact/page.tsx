"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import gsap from "gsap";
import apiClient from "@/services/apiClient";
import Button from "@/components/ui/Button";
import { Mail, MapPin, Phone, MessageSquare, Send, CheckCircle, Loader2 } from "lucide-react";

const contactSchema = z.object({
    first_name: z.string().min(1, "First name is required").max(50),
    last_name: z.string().min(1, "Last name is required").max(50),
    email: z.string().email("Enter a valid email address"),
    message: z.string().min(10, "Message must be at least 10 characters").max(2000),
});

type ContactFormValues = z.infer<typeof contactSchema>;


export default function ContactPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [submitted, setSubmitted] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ContactFormValues>({
        resolver: zodResolver(contactSchema),
    });

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(".contact-anim",
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power2.out", delay: 0.2 }
            );
        }, containerRef);

        return () => ctx.revert();
    }, []);

    async function onSubmit(data: ContactFormValues) {
        setServerError(null);
        try {
            await apiClient.post("/contact", data);
            setSubmitted(true);
        } catch (err: unknown) {
            setServerError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        }
    }

    return (
        <main ref={containerRef} className="min-h-screen bg-surface-base pt-32 pb-20 relative overflow-hidden">

            {/* Background Ambience */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">

                {/* Header */}
                <div className="text-center mb-16 md:mb-24">
                    <div className="contact-anim inline-block mb-4 px-4 py-1.5 rounded-full bg-surface-raised/80 border border-default text-emerald-400 text-xs font-bold tracking-widest uppercase">
                        Contact Us
                    </div>
                    <h1 className="contact-anim text-5xl md:text-7xl font-black text-primary mb-6 tracking-tighter">
                        GET IN <span className="text-emerald-500">TOUCH</span>
                    </h1>
                    <p className="contact-anim text-xl text-secondary max-w-2xl mx-auto">
                        Have a question about a booking or want to report an issue? Our team is available 24/7 to help you get back in the game.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start max-w-6xl mx-auto">

                    {/* Info Side */}
                    <div className="space-y-8">
                        <div className="contact-anim group p-8 rounded-3xl bg-surface-raised/30 border border-default hover:border-emerald-500/50 hover:bg-surface-raised/50 transition-all duration-300">
                            <div className="w-12 h-12 bg-surface-overlay rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Mail className="h-6 w-6 text-emerald-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-primary mb-2">Email Us</h3>
                            <p className="text-secondary mb-4">For general inquiries and support.</p>
                            <div className="flex flex-col gap-1">
                                <a href="mailto:admin@thearena.lk" className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors">
                                    admin@thearena.lk
                                </a>
                                <a href="mailto:support@thearena.lk" className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors">
                                    support@thearena.lk
                                </a>
                                <a href="mailto:info@thearena.lk" className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors">
                                    info@thearena.lk
                                </a>
                            </div>
                        </div>

                        <div className="contact-anim group p-8 rounded-3xl bg-surface-raised/30 border border-default hover:border-emerald-500/50 hover:bg-surface-raised/50 transition-all duration-300">
                            <div className="w-12 h-12 bg-surface-overlay rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Phone className="h-6 w-6 text-emerald-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-primary mb-2">Call Us</h3>
                            <p className="text-secondary mb-4">Available during business hours.</p>
                            <div className="flex flex-col gap-1">
                                <a href="tel:+94710509041" className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors">
                                    +94 71 050 9041
                                </a>
                                <a href="tel:+94743629173" className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors">
                                    +94 74 362 9173
                                </a>
                            </div>
                        </div>

                        <div className="contact-anim group p-8 rounded-3xl bg-surface-raised/30 border border-default hover:border-emerald-500/50 hover:bg-surface-raised/50 transition-all duration-300">
                            <div className="w-12 h-12 bg-surface-overlay rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <MapPin className="h-6 w-6 text-emerald-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-primary mb-2">Visit HQ</h3>
                            <p className="text-secondary">
                                26/12b Station Road,<br />Dehiwala, Sri Lanka
                            </p>
                        </div>
                    </div>

                    {/* Form Side */}
                    <div className="contact-anim relative">
                        <div className="absolute inset-0 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />

                        <div className="relative bg-surface-raised/80 border border-default rounded-3xl p-8 md:p-10 backdrop-blur-xl shadow-2xl">
                            {submitted ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center gap-6">
                                    <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center">
                                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-primary mb-2">Message Sent!</h3>
                                        <p className="text-secondary">Thanks for reaching out. Our team will get back to you shortly.</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3 mb-8">
                                        <MessageSquare className="w-6 h-6 text-emerald-500" />
                                        <h3 className="text-2xl font-bold text-primary">Send a Message</h3>
                                    </div>

                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-muted uppercase tracking-wider">First Name</label>
                                                <input
                                                    type="text"
                                                    {...register("first_name")}
                                                    className="w-full bg-surface-base/50 border border-subtle rounded-xl p-4 text-primary focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-faint"
                                                    placeholder="John"
                                                />
                                                {errors.first_name && (
                                                    <p className="text-red-400 text-xs mt-1">{errors.first_name.message}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-muted uppercase tracking-wider">Last Name</label>
                                                <input
                                                    type="text"
                                                    {...register("last_name")}
                                                    className="w-full bg-surface-base/50 border border-subtle rounded-xl p-4 text-primary focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-faint"
                                                    placeholder="Doe"
                                                />
                                                {errors.last_name && (
                                                    <p className="text-red-400 text-xs mt-1">{errors.last_name.message}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-muted uppercase tracking-wider">Email Address</label>
                                            <input
                                                type="email"
                                                {...register("email")}
                                                className="w-full bg-surface-base/50 border border-subtle rounded-xl p-4 text-primary focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-faint"
                                                placeholder="john@example.com"
                                            />
                                            {errors.email && (
                                                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-muted uppercase tracking-wider">Message</label>
                                            <textarea
                                                rows={5}
                                                {...register("message")}
                                                className="w-full bg-surface-base/50 border border-subtle rounded-xl p-4 text-primary focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-faint resize-none"
                                                placeholder="How can we help you?"
                                            ></textarea>
                                            {errors.message && (
                                                <p className="text-red-400 text-xs mt-1">{errors.message.message}</p>
                                            )}
                                        </div>

                                        {serverError && (
                                            <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-red-400 text-sm">
                                                {serverError}
                                            </div>
                                        )}

                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full py-5 text-lg font-bold bg-emerald-500 text-black hover:bg-emerald-300 transition-colors group disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            <span className="flex items-center justify-center gap-2">
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        Sending…
                                                    </>
                                                ) : (
                                                    <>
                                                        Send Message
                                                        <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                    </>
                                                )}
                                            </span>
                                        </Button>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}