"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Button from "@/components/ui/Button";
import { 
  Question, 
  User, 
  Buildings, 
  CreditCard, 
  ShieldCheck, 
  EnvelopeSimple, 
  MagnifyingGlass, 
  CaretDown 
} from "@phosphor-icons/react";

gsap.registerPlugin(ScrollTrigger);

interface FAQItem {
  category: "players" | "venues" | "account";
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    category: "players",
    question: "How do I book a court on The Arena?",
    answer: "Booking a court is simple! Browse available venues via the Home or Venues page, select your preferred sport and date, choose an available time slot, and securely pay online. Your booking is instantly confirmed and locked in."
  },
  {
    category: "players",
    question: "Can I cancel or reschedule my booking?",
    answer: "Yes! You can manage your bookings directly from your player profile dashboard under the 'Bookings' tab. Cancellation policies (refunds and rescheduling eligibility) are set individually by each venue and are listed clearly on their center profile page."
  },
  {
    category: "venues",
    question: "How do I list my sports venue on your platform?",
    answer: "We make facility onboarding seamless! Navigate to our 'Partner' page, fill out the basic venue details form, and our onboarding squad will review your center to verify and publish it in no time."
  },
  {
    category: "venues",
    question: "How do cash payouts and bank remittances work?",
    answer: "Payouts are automated settlements processed directly into your registered bank account. You can easily track all bookings, collected platform fees, cash payouts, and complete revenue analytics inside your Venue Owner Dashboard under 'Fees & Payouts'."
  },
  {
    category: "account",
    question: "How do I enable Multi-Factor Authentication (MFA)?",
    answer: "Keep your account fully secure! Go to your profile settings, click on the 'Security' tab, and follow the simple steps to link your preferred authenticator app (such as Google Authenticator or Microsoft Authenticator)."
  },
  {
    category: "account",
    question: "What should I do if I forgot my password?",
    answer: "No worries at all! Just click the 'Forgot Password' link on the login page, enter your registered email address, and we will send a secure password reset link directly to your inbox."
  }
];

export default function HelpPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | "players" | "venues" | "account">("all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    // Set document title
    document.title = "Help Center | The Arena";

    // Hero Text Animation
    gsap.fromTo(".help-hero-anim",
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power2.out", delay: 0.1 }
    );

    // Section Reveals
    const sections = gsap.utils.toArray<HTMLElement>(".reveal-section");
    sections.forEach((section) => {
      gsap.fromTo(section,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 90%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });
  }, []);

  // Filter FAQs based on active category & search query
  const filteredFaqs = FAQS.filter((faq) => {
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    const matchesQuery = 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <main ref={containerRef} className="min-h-screen bg-surface-base text-primary selection:bg-emerald-500/30">
      
      {/* 1. Hero Section */}
      <section className="relative pt-32 pb-16 md:pt-48 md:pb-24 overflow-hidden">
        {/* Decorative background glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[130px] pointer-events-none" />
        
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="help-hero-anim inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-surface-raised border border-default text-emerald-600 dark:text-emerald-400 text-xs font-bold tracking-widest uppercase shadow-sm">
              <Question size={14} weight="fill" className="text-emerald-500 animate-pulse" />
              Help Center
            </div>
            
            <h1 className="help-hero-anim text-5xl md:text-7xl font-black text-primary mb-6 tracking-tighter leading-[0.9] uppercase">
              WE&apos;RE HERE TO <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-400 dark:to-emerald-500">HELP YOU</span>
            </h1>
            
            <p className="help-hero-anim text-lg text-secondary leading-relaxed max-w-lg mx-auto mb-8">
              Search frequently asked questions or select a category below to get instant answers.
            </p>

            {/* Interactive Search Bar */}
            <div className="help-hero-anim relative max-w-xl mx-auto">
              <MagnifyingGlass size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input 
                type="text" 
                placeholder="Type keywords (e.g. refund, payouts, MFA)..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-surface-raised border border-default text-primary placeholder:text-muted focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/50 outline-none transition-all shadow-sm text-sm md:text-base"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Help Categories (Filters) */}
      <section className="pb-12 reveal-section">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Tab: All */}
            <button
              onClick={() => { setActiveCategory("all"); setOpenIndex(null); }}
              className={`p-5 rounded-2xl border text-center transition-all duration-300 ${
                activeCategory === "all"
                  ? "bg-surface-raised border-brand-accent/50 shadow-md scale-[1.02]"
                  : "bg-surface-base border-default hover:border-brand-accent/30"
              }`}
            >
              <div className="w-10 h-10 mx-auto rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                <Question size={20} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="font-bold text-sm">All Topics</div>
            </button>

            {/* Tab: Players */}
            <button
              onClick={() => { setActiveCategory("players"); setOpenIndex(null); }}
              className={`p-5 rounded-2xl border text-center transition-all duration-300 ${
                activeCategory === "players"
                  ? "bg-surface-raised border-brand-accent/50 shadow-md scale-[1.02]"
                  : "bg-surface-base border-default hover:border-brand-accent/30"
              }`}
            >
              <div className="w-10 h-10 mx-auto rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                <User size={20} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="font-bold text-sm">For Players</div>
            </button>

            {/* Tab: Venues */}
            <button
              onClick={() => { setActiveCategory("venues"); setOpenIndex(null); }}
              className={`p-5 rounded-2xl border text-center transition-all duration-300 ${
                activeCategory === "venues"
                  ? "bg-surface-raised border-brand-accent/50 shadow-md scale-[1.02]"
                  : "bg-surface-base border-default hover:border-brand-accent/30"
              }`}
            >
              <div className="w-10 h-10 mx-auto rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                <Buildings size={20} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="font-bold text-sm">For Venues</div>
            </button>

            {/* Tab: Account */}
            <button
              onClick={() => { setActiveCategory("account"); setOpenIndex(null); }}
              className={`p-5 rounded-2xl border text-center transition-all duration-300 ${
                activeCategory === "account"
                  ? "bg-surface-raised border-brand-accent/50 shadow-md scale-[1.02]"
                  : "bg-surface-base border-default hover:border-brand-accent/30"
              }`}
            >
              <div className="w-10 h-10 mx-auto rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                <ShieldCheck size={20} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="font-bold text-sm">Account & Auth</div>
            </button>

          </div>
        </div>
      </section>

      {/* 3. FAQ Accordion Section */}
      <section className="py-12 bg-surface-raised/20 border-y border-default/50 reveal-section">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-2">Frequently Asked Questions</h2>
            <p className="text-sm text-secondary">
              Showing {filteredFaqs.length} {filteredFaqs.length === 1 ? "answer" : "answers"}
            </p>
          </div>

          <div className="space-y-4">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, idx) => {
                const isOpen = openIndex === idx;
                return (
                  <div 
                    key={idx}
                    className="bg-surface-base border border-default rounded-2xl overflow-hidden transition-all duration-300 shadow-sm"
                  >
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full flex items-center justify-between p-5 text-left font-bold text-sm md:text-base text-primary hover:text-brand-accent transition-colors"
                    >
                      <span>{faq.question}</span>
                      <CaretDown 
                        size={18} 
                        weight="bold" 
                        className={`text-muted transition-transform duration-300 flex-shrink-0 ml-4 ${
                          isOpen ? "rotate-180 text-brand-accent" : ""
                        }`}
                      />
                    </button>

                    {/* Expandable Answer Box */}
                    <div 
                      className={`transition-all duration-300 ease-in-out ${
                        isOpen ? "max-h-[300px] border-t border-default p-5 bg-surface-raised/20" : "max-h-0 pointer-events-none"
                      } overflow-hidden`}
                    >
                      <p className="text-secondary text-sm leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 bg-surface-base border border-default rounded-2xl text-muted text-sm shadow-sm">
                No matching questions found. Try adjusting your search query!
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. Support Contact CTA */}
      <section className="py-20 pb-32 reveal-section">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <EnvelopeSimple size={32} weight="fill" className="text-emerald-600 dark:text-emerald-400" />
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-primary mb-4 uppercase tracking-tight">
            Still Stuck?
          </h2>
          
          <p className="text-secondary mb-8">
            Can&apos;t find what you are looking for? Our dedicated customer support squad is 
            available 24/7 to get you back in the game.
          </p>

          <Button 
            href="mailto:support@thearena.lk?subject=Support%20Request%20-%20The%20Arena"
            className="px-10 py-4 text-lg font-bold flex items-center gap-2 mx-auto shadow-md dark:shadow-none hover:shadow-lg dark:hover:shadow-[0_0_30px_rgba(80,200,120,0.3)] transition-all"
          >
            <EnvelopeSimple size={20} weight="bold" />
            support@thearena.lk
          </Button>
        </div>
      </section>

    </main>
  );
}
