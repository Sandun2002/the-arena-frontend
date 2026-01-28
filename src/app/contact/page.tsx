"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Button from "@/components/ui/Button";
import { Mail, MapPin, Phone, MessageSquare, Send } from "lucide-react";

export default function ContactPage() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Animations
        const ctx = gsap.context(() => {
            gsap.fromTo(".contact-anim",
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power2.out", delay: 0.2 }
            );
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <main ref={containerRef} className="min-h-screen bg-black pt-32 pb-20 relative overflow-hidden">

            {/* Background Ambience */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">

                {/* Header */}
                <div className="text-center mb-16 md:mb-24">
                    <div className="contact-anim inline-block mb-4 px-4 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-emerald-400 text-xs font-bold tracking-widest uppercase">
                        Contact Us
                    </div>
                    <h1 className="contact-anim text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter">
                        GET IN <span className="text-emerald-500">TOUCH</span>
                    </h1>
                    <p className="contact-anim text-xl text-zinc-400 max-w-2xl mx-auto">
                        Have a question about a booking or want to report an issue? Our team is available 24/7 to help you get back in the game.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start max-w-6xl mx-auto">

                    {/* Info Side */}
                    <div className="space-y-8">
                        <div className="contact-anim group p-8 rounded-3xl bg-zinc-900/30 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-900/50 transition-all duration-300">
                            <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Mail className="h-6 w-6 text-emerald-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Email Us</h3>
                            <p className="text-zinc-400 mb-4">For general inquiries and support.</p>
                            <a href="mailto:support@thearena.com" className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors">
                                support@thearena.com
                            </a>
                        </div>

                        <div className="contact-anim group p-8 rounded-3xl bg-zinc-900/30 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-900/50 transition-all duration-300">
                            <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Phone className="h-6 w-6 text-emerald-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Call Us</h3>
                            <p className="text-zinc-400 mb-4">Mon-Fri from 8am to 5pm.</p>
                            <a href="tel:+15550000000" className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors">
                                +1 (555) 000-0000
                            </a>
                        </div>

                        <div className="contact-anim group p-8 rounded-3xl bg-zinc-900/30 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-900/50 transition-all duration-300">
                            <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <MapPin className="h-6 w-6 text-emerald-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Visit HQ</h3>
                            <p className="text-zinc-400">
                                123 Sports Complex Blvd,<br />New York, NY 10001
                            </p>
                        </div>
                    </div>

                    {/* Form Side */}
                    <div className="contact-anim relative">
                        <div className="absolute inset-0 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />

                        <div className="relative bg-zinc-900/80 border border-zinc-800 rounded-3xl p-8 md:p-10 backdrop-blur-xl shadow-2xl">
                            <div className="flex items-center gap-3 mb-8">
                                <MessageSquare className="w-6 h-6 text-emerald-500" />
                                <h3 className="text-2xl font-bold text-white">Send a Message</h3>
                            </div>

                            <form className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">First Name</label>
                                        <input
                                            type="text"
                                            className="w-full bg-black/50 border border-zinc-700 rounded-xl p-4 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-zinc-700"
                                            placeholder="John"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Last Name</label>
                                        <input
                                            type="text"
                                            className="w-full bg-black/50 border border-zinc-700 rounded-xl p-4 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-zinc-700"
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Email Address</label>
                                    <input
                                        type="email"
                                        className="w-full bg-black/50 border border-zinc-700 rounded-xl p-4 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-zinc-700"
                                        placeholder="john@example.com"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Message</label>
                                    <textarea
                                        rows={5}
                                        className="w-full bg-black/50 border border-zinc-700 rounded-xl p-4 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-zinc-700 resize-none"
                                        placeholder="How can we help you?"
                                    ></textarea>
                                </div>

                                <Button className="w-full py-5 text-lg font-bold bg-emerald-500 text-black hover:bg-white transition-colors group">
                                    <span className="flex items-center justify-center gap-2">
                                        Send Message
                                        <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </Button>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}