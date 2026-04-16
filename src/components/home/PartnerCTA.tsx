"use client";

import Link from "next/link";
import { CalendarDays, BarChart3, CreditCard, Building2, ArrowRight } from "lucide-react";

// Set to true when ready to show the partner CTA
const SHOW_PARTNER_CTA = false;

const FEATURES = [
  {
    icon: CalendarDays,
    title: "Booking System",
    description: "Automated scheduling with real-time availability",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track bookings, revenue, and court utilization",
  },
  {
    icon: CreditCard,
    title: "Auto Payments",
    description: "Secure payments with instant settlement",
  },
];

export default function PartnerCTA() {
  // Hidden by default - flip SHOW_PARTNER_CTA to true when ready
  if (!SHOW_PARTNER_CTA) return null;

  return (
    <section className="py-16 md:py-20 bg-black">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="bg-gradient-to-br from-zinc-900 via-zinc-900/80 to-emerald-950/20 border border-zinc-800 rounded-3xl p-6 md:p-10">
          {/* Header */}
          <div className="text-center mb-8 md:mb-10">
            <div className="inline-flex items-center gap-2 mb-3">
              <Building2 className="w-5 h-5 text-emerald-500" />
              <span className="text-xs font-black tracking-[0.2em] uppercase text-zinc-500">
                For Venue Owners
              </span>
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-white mb-3">
              Own a Sports{" "}
              <span className="text-transparent bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text">
                Venue?
              </span>
            </h2>
            <p className="text-zinc-400 max-w-lg mx-auto">
              Join Sri Lanka&apos;s fastest-growing sports platform. Fill empty slots, track revenue, 
              and get discovered by thousands of players.
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
            {FEATURES.map((feature, idx) => (
              <div
                key={idx}
                className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 text-center hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(80,200,120,0.1)] transition-all duration-300 group"
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">
                  {feature.title}
                </h3>
                <p className="text-xs text-zinc-400">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/partner"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold hover:shadow-[0_0_30px_rgba(80,200,120,0.4)] hover:scale-105 transition-all duration-300 group"
            >
              List Your Venue
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-zinc-700 text-white font-bold hover:bg-zinc-800 hover:border-zinc-600 transition-all duration-300"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
