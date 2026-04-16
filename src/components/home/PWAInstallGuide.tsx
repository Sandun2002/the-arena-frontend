"use client";

import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { X, Check, Smartphone, Share2, MoreVertical, Download } from "lucide-react";

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

const STORAGE_KEY = "pwa-guide-dismissed";

export default function PWAInstallGuide() {
  const [isVisible, setIsVisible] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop">("desktop");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Check if already dismissed
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed === "true") return;

    // Check if already installed (standalone mode)
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    setIsStandalone(standalone);
    if (standalone) return;

    // Detect platform
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);

    if (isIOS) setPlatform("ios");
    else if (isAndroid) setPlatform("android");
    else setPlatform("desktop");

    // Listen for beforeinstallprompt (Chrome/Edge Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Show the section
    setIsVisible(true);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  // GSAP animation
  useEffect(() => {
    if (isVisible && sectionRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          sectionRef.current,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      }, sectionRef);

      return () => ctx.revert();
    }
  }, [isVisible]);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsVisible(false);
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  if (!isVisible || isStandalone) return null;

  return (
    <section
      ref={sectionRef}
      className="py-16 bg-zinc-900/20 border-y border-zinc-800/50 relative"
    >
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <Smartphone className="w-5 h-5 text-emerald-500" />
            <span className="text-xs font-black tracking-[0.2em] uppercase text-zinc-500">
              Progressive Web App
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
            Take The Arena{" "}
            <span className="text-transparent bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text">
              Everywhere
            </span>
          </h2>
          <p className="text-zinc-400 text-sm max-w-md mx-auto">
            No App Store needed. Install in seconds and get instant access to your bookings.
          </p>
        </div>

        {/* Platform-specific instructions */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-8">
          {/* iOS Instructions */}
          {(platform === "ios" || platform === "desktop") && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🍎</span>
                <span className="text-sm font-bold text-white">iPhone / iPad</span>
              </div>
              <div className="space-y-3">
                <Step number={1} icon={<span className="text-zinc-400">Safari</span>}>
                  Open in Safari browser
                </Step>
                <Step number={2} icon={<Share2 className="w-4 h-4" />}>
                  Tap the <strong className="text-white">Share</strong> button
                </Step>
                <Step number={3} text="Add to Home Screen">
                  Scroll and tap <strong className="text-white">Add to Home Screen</strong>
                </Step>
                <Step number={4} text="Add">
                  Tap <strong className="text-white">Add</strong> in the top right
                </Step>
              </div>
            </div>
          )}

          {/* Android Instructions */}
          {(platform === "android" || platform === "desktop") && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🤖</span>
                <span className="text-sm font-bold text-white">Android</span>
              </div>
              
              {canInstall ? (
                <div className="text-center py-4">
                  <p className="text-zinc-400 text-sm mb-4">
                    One-tap install available for your browser
                  </p>
                  <button
                    onClick={handleInstall}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Install The Arena
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Step number={1} icon={<MoreVertical className="w-4 h-4" />}>
                    Tap the <strong className="text-white">⋮</strong> menu (top right)
                  </Step>
                  <Step number={2} text="Install App">
                    Tap <strong className="text-white">Install App</strong> or{" "}
                    <strong className="text-white">Add to Home Screen</strong>
                  </Step>
                  <Step number={3} text="Install">
                    Tap <strong className="text-white">Install</strong> in the prompt
                  </Step>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-3">
          <FeaturePill>✓ Instant loading</FeaturePill>
          <FeaturePill>✓ Push notifications</FeaturePill>
          <FeaturePill>✓ No storage used</FeaturePill>
        </div>
      </div>
    </section>
  );
}

function Step({
  number,
  icon,
  text,
  children,
}: {
  number: number;
  icon?: React.ReactNode;
  text?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-white">
        {number}
      </div>
      <div className="text-sm text-zinc-400">
        {icon && <span className="inline-flex items-center gap-1.5">{icon}</span>}
        {text && <strong className="text-white font-medium">{text}</strong>}
        {children}
      </div>
    </div>
  );
}

function FeaturePill({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-1.5 bg-zinc-900/70 border border-zinc-800 rounded-full px-3 py-1.5 text-xs text-zinc-300">
      <Check className="w-3 h-3 text-emerald-500" />
      {children}
    </div>
  );
}
