/* eslint-disable react/no-unescaped-entities */
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { List, X } from "@phosphor-icons/react";

export interface TocItem {
  id: string;
  label: string;
}

interface LegalTOCProps {
  items: TocItem[];
}

/**
 * LegalTOC — shared Table of Contents component for legal pages.
 *
 * Desktop: fixed sticky sidebar (260 px) with active-section highlighting
 *          driven by IntersectionObserver. The active item smoothly scrolls
 *          into view inside the sidebar.
 *
 * Mobile:  floating action button (bottom-right) that opens a slide-in
 *          drawer from the right side with all TOC items.
 *
 * Mobile FAB + drawer are rendered via a React portal into document.body
 * so they don't create extra grid children in the parent two-column layout.
 * All scroll calls use window.scrollTo (which Lenis patches) instead of
 * scrollIntoView (which Lenis does NOT patch, causing scroll fights).
 */
export default function LegalTOC({ items }: LegalTOCProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false); // controls CSS transition
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const navRef = useRef<HTMLElement>(null);

  // ── Client-only portal target ────────────────────────────────────────────
  useEffect(() => {
    setPortalRoot(document.body);
  }, []);

  // ── Active-section tracker via IntersectionObserver ──────────────────────
  useEffect(() => {
    if (items.length === 0) return;

    const headingEls = items
      .map((item) => document.getElementById(item.id))
      .filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the topmost intersecting heading
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        // Fire when 10 % of the heading enters the viewport from below, or
        // when the section occupies most of the top half of the viewport.
        rootMargin: "-100px 0px -60% 0px",
        threshold: 0,
      }
    );

    headingEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  // ── Auto-scroll active TOC item into view inside the sidebar ─────────────
  // Uses direct scrollTop on the nav container to avoid Lenis intercepting
  // a page-level scrollIntoView call.
  useEffect(() => {
    if (!navRef.current || !activeId) return;
    const activeEl = navRef.current.querySelector(
      `[data-id="${activeId}"]`
    ) as HTMLElement | null;
    if (activeEl) {
      const nav = navRef.current;
      const elOffsetTop = activeEl.offsetTop - nav.offsetTop;
      const target = elOffsetTop - nav.clientHeight / 2 + activeEl.clientHeight / 2;
      nav.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
    }
  }, [activeId]);

  // ── Drawer open/close with CSS transition ────────────────────────────────
  const openDrawer = useCallback(() => {
    setDrawerOpen(true);
    // Small delay so the drawer is mounted before we add the visible class
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setDrawerVisible(true));
    });
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerVisible(false);
    // Wait for the transition to finish before unmounting
    setTimeout(() => setDrawerOpen(false), 300);
  }, []);

  // Close drawer on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [closeDrawer]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  // ── Lenis-compatible scroll: uses window.scrollTo which Lenis patches ────
  const scrollToId = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 112;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }, []);

  const scrollToSection = (id: string) => {
    closeDrawer();
    // Small delay so drawer starts closing before we jump
    setTimeout(() => scrollToId(id), 50);
  };

  // ── Shared link styles ────────────────────────────────────────────────────
  const linkClass = (id: string) =>
    `block text-sm transition-all duration-200 py-1 pl-3 border-l-2 ${
      activeId === id
        ? "text-emerald-400 border-emerald-400 font-medium"
        : "text-muted hover:text-secondary border-transparent hover:border-surface-raised"
    }`;

  // ── Mobile FAB + Drawer (portalled to body to avoid breaking grid) ───────
  const mobileElements = portalRoot
    ? createPortal(
        <>
          {/* ── Mobile FAB ─────────────────────────────────────────────── */}
          <button
            onClick={openDrawer}
            className="lg:hidden fixed bottom-24 right-4 z-50 w-14 h-14 rounded-2xl bg-emerald-500 text-black shadow-lg shadow-emerald-500/30 flex items-center justify-center hover:bg-emerald-400 transition-all duration-200 active:scale-95"
            aria-label="Open table of contents"
          >
            <List size={24} weight="bold" />
          </button>

          {/* ── Mobile Drawer ──────────────────────────────────────────── */}
          {drawerOpen && (
            <div className="lg:hidden fixed inset-0 z-[100]">
              {/* Backdrop */}
              <div
                className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
                  drawerVisible ? "opacity-100" : "opacity-0"
                }`}
                onClick={closeDrawer}
              />

              {/* Panel — data-lenis-prevent lets the drawer scroll freely */}
              <div
                data-lenis-prevent
                className={`absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-surface-base border-l border-default shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
                  drawerVisible ? "translate-x-0" : "translate-x-full"
                }`}
              >
                {/* Panel header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-default flex-shrink-0">
                  <p className="text-sm font-bold text-primary">Contents</p>
                  <button
                    onClick={closeDrawer}
                    className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-surface-raised transition-colors"
                    aria-label="Close"
                  >
                    <X size={20} weight="bold" />
                  </button>
                </div>

                {/* Nav — overscroll-contain prevents scroll chaining to Lenis */}
                <nav className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 space-y-0.5" style={{ WebkitOverflowScrolling: "touch" }}>
                  {items.map((item) => (
                    <button
                      key={`drawer-${item.id}`}
                      onClick={() => scrollToSection(item.id)}
                      className={`w-full text-left text-sm transition-all duration-200 py-2 pl-3 border-l-2 ${
                        activeId === item.id
                          ? "text-emerald-400 border-emerald-400 font-medium bg-emerald-500/5 rounded-r-md"
                          : "text-secondary hover:text-emerald-400 border-transparent hover:border-emerald-400/40"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </nav>

                {/* Bottom safe area */}
                <div className="h-6 flex-shrink-0" />
              </div>
            </div>
          )}
        </>,
        portalRoot
      )
    : null;

  return (
    <>
      {/* ── Desktop Sidebar ──────────────────────────────────────────────── */}
      <aside
        data-lenis-prevent
        className="hidden lg:flex flex-col sticky top-28 h-fit max-h-[calc(100vh-8rem)]"
      >
        {/* Header */}
        <p className="text-xs text-muted uppercase tracking-[0.18em] font-bold border-b border-default pb-3 mb-4 flex-shrink-0">
          Contents
        </p>

        {/* Scrollable nav */}
        <nav
          ref={navRef}
          className="overflow-y-auto overscroll-contain space-y-0.5 pr-2 scrollbar-hide flex-1"
        >
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              data-id={item.id}
              className={linkClass(item.id)}
              onClick={(e) => {
                e.preventDefault();
                scrollToId(item.id);
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Progress hint — bottom fade */}
        <div className="h-8 flex-shrink-0 bg-gradient-to-t from-surface-base to-transparent -mt-8 pointer-events-none" />
      </aside>

      {mobileElements}
    </>
  );
}
