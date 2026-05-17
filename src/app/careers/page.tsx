"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Button from "@/components/ui/Button";
import { 
  Briefcase, 
  RocketLaunch, 
  Sparkle, 
  EnvelopeSimple, 
  UserPlus, 
  Trophy 
} from "@phosphor-icons/react";

gsap.registerPlugin(ScrollTrigger);

export default function CareersPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set document title
    document.title = "Careers | The Arena";

    // Hero Text Animation
    gsap.fromTo(".careers-hero-anim",
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power2.out", delay: 0.2 }
    );

    // Section Reveals
    const sections = gsap.utils.toArray<HTMLElement>(".reveal-section");
    sections.forEach((section) => {
      gsap.fromTo(section,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });
  }, []);

  return (
    <main ref={containerRef} className="min-h-screen bg-surface-base text-primary selection:bg-emerald-500/30">
      
      {/* 1. Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Decorative background glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="careers-hero-anim inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-surface-raised/80 border border-default text-emerald-400 text-xs font-bold tracking-widest uppercase">
              <RocketLaunch size={14} weight="fill" className="animate-bounce" />
              Careers at The Arena
            </div>
            
            <h1 className="careers-hero-anim text-5xl md:text-7xl font-black text-primary mb-8 tracking-tighter leading-[0.9] uppercase">
              Build the Future <br />
              of <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">Sports Tech</span>
            </h1>
            
            <p className="careers-hero-anim text-lg md:text-xl text-secondary leading-relaxed max-w-2xl mx-auto">
              We are a passionate, fast-moving team redefining the sports experience in Sri Lanka.
              While we are currently heads-down building and don&apos;t have active job openings, 
              we are always seeking exceptional talent for our talent network.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Culture & Values Section */}
      <section className="py-24 bg-surface-raised/30 reveal-section">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-bold text-emerald-500 uppercase tracking-widest mb-3">Our DNA</h2>
            <h3 className="text-4xl font-bold text-primary mb-6">What We Stand For</h3>
            <p className="text-lg text-secondary">
              We are a remote-friendly, high-performance team driven by speed, visual craftsmanship, and health.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Value 1 */}
            <div className="bg-surface-base border border-default p-8 rounded-3xl hover:border-emerald-500/30 transition-colors group">
              <div className="w-12 h-12 bg-surface-raised rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sparkle size={24} weight="fill" className="text-emerald-400" />
              </div>
              <h4 className="text-xl font-bold text-primary mb-3">UX & Craftsmanship</h4>
              <p className="text-secondary text-sm leading-relaxed">
                We care about the pixel-perfect layouts, the responsive grids, and the premium micro-interactions. If it looks standard, we iterate until it looks premium.
              </p>
            </div>

            {/* Value 2 */}
            <div className="bg-surface-base border border-default p-8 rounded-3xl hover:border-emerald-500/30 transition-colors group">
              <div className="w-12 h-12 bg-surface-raised rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Trophy size={24} weight="fill" className="text-emerald-400" />
              </div>
              <h4 className="text-xl font-bold text-primary mb-3">Autonomy & Speed</h4>
              <p className="text-secondary text-sm leading-relaxed">
                We minimize meetings and maximize builders&apos; focus. You will own your features end-to-end, ship code directly to production, and learn at lightning speeds.
              </p>
            </div>

            {/* Value 3 */}
            <div className="bg-surface-base border border-default p-8 rounded-3xl hover:border-emerald-500/30 transition-colors group">
              <div className="w-12 h-12 bg-surface-raised rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Briefcase size={24} weight="fill" className="text-emerald-400" />
              </div>
              <h4 className="text-xl font-bold text-primary mb-3">Sports First</h4>
              <p className="text-secondary text-sm leading-relaxed">
                We believe playing sports breeds team synergy and sharp minds. We stay active, offer weekly sports allowances, and run regular internal games.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Startup Status (Glowing Glassmorphic Card) */}
      <section className="py-20 reveal-section">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="relative rounded-3xl bg-gradient-to-br from-surface-raised to-surface-base border border-default p-10 md:p-14 text-center overflow-hidden">
            {/* Neon Status Badge */}
            <div className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Heads-down building
            </div>

            <h3 className="text-2xl md:text-3xl font-bold text-primary mb-4 pt-4">
              Current Openings
            </h3>
            
            <p className="text-secondary mb-8 max-w-2xl mx-auto">
              We are in our early startup phase, running lean with a tight-knit squad of builders. 
              As a result, we do not have open roles right now. However, things change quickly in a startup!
            </p>

            <div className="inline-block px-6 py-4 bg-surface-raised rounded-2xl border border-subtle/50 text-left max-w-lg mx-auto text-sm text-secondary">
              <p className="font-bold text-primary mb-1">💡 What we look for in future teammates:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Full-Stack React / Next.js / Python Developers</li>
                <li>Highly visual Product Designers (Figma & UX lovers)</li>
                <li>Growth Marketers obsessed with sports & community building</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Open Application / Call to Action */}
      <section className="py-16 pb-32 reveal-section">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <UserPlus size={32} weight="fill" className="text-emerald-400" />
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-primary mb-4">
            Join Our Talent Network
          </h2>
          
          <p className="text-secondary mb-8">
            Are you an A-Player looking for a challenge in the future? Introduce yourself today! 
            Drop us your resume, portfolio, or a side-project you are incredibly proud of.
          </p>

          <Button 
            href="mailto:careers@thearena.lk?subject=Open%20Application%20-%20The%20Arena"
            className="px-10 py-4 text-lg font-bold flex items-center gap-2 mx-auto hover:shadow-[0_0_30px_rgba(80,200,120,0.3)] transition-shadow"
          >
            <EnvelopeSimple size={20} weight="bold" />
            careers@thearena.lk
          </Button>
        </div>
      </section>

    </main>
  );
}
