"use client";

import Link from "next/link";
import { CalendarBlank, ChartBar, CreditCard, Buildings, ArrowRight } from "@phosphor-icons/react";

// Set to true when ready to show the partner CTA
const SHOW_PARTNER_CTA = false;

const FEATURES = [
  {
    icon: CalendarBlank,
    title: "Booking System",
    description: "Automated scheduling with real-time availability",
  },
  {
    icon: ChartBar,
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
    <section className="py-16 md:py-20 bg-surface-base">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="bg-gradient-to-br from-surface-raised via-surface-raised/80 to-emerald-950/20 border border-default rounded-3xl p-6 md:p-10">
          {/* Header */}
          <div className="text-center mb-8 md:mb-10">
            <div className="inline-flex items-center gap-2 mb-3">
              <Buildings size={20} weight="fill" className="text-emerald-500" />
              <span className="text-xs font-black tracking-[0.2em] uppercase text-muted">
                For Venue Owners
              </span>
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-primary mb-3">
              Own a Sports{" "}
              <span className="text-transparent bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text">
                Venue?
              </span>
            </h2>
            <p className="text-secondary max-w-lg mx-auto">
              Join Sri Lanka&apos;s fastest-growing sports platform. Fill empty slots, track revenue, 
              and get discovered by thousands of players.
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
            {FEATURES.map((feature, idx) => (
              <div
                key={idx}
                className="bg-surface-raised/50 border border-default rounded-2xl p-5 text-center hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(80,200,120,0.1)] transition-all duration-300 group"
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <feature.icon size={24} weight="bold" className="text-emerald-500" />
                </div>
                <h3 className="text-sm font-bold text-primary mb-1">
                  {feature.title}
                </h3>
                <p className="text-xs text-secondary">{feature.description}</p>
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
              <ArrowRight size={16} weight="bold" className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-subtle text-primary font-bold hover:bg-surface-overlay hover:border-secondary transition-all duration-300"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
