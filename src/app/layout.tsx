import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Syne } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import MobileMainWrapper from "@/components/layout/MobileMainWrapper";
import MobileTopBar from "@/components/layout/MobileTopBar";
// Import the new smooth scroll wrapper
import SmoothScrolling from "@/components/layout/SmoothScrolling";
import Providers from "@/components/Providers";
import PWARegister from "@/components/layout/PWARegister";

// ── Premium Font Stack ────────────────────────────────────────────────────────
// Plus Jakarta Sans — modern, geometric sans-serif for body & UI text.
// Very readable at small sizes, premium feel at large sizes.
const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

// Syne — geometric display font for headings and brand moments.
// Sharp, distinctive, unmistakably premium.
const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Arena | Premium Sports Booking",
  description: "Book high-end sports venues with ease.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // themeColor intentionally omitted — it is managed dynamically by the
  // theme bootstrap script + ThemeContext (light/dark aware).
};

// Force the root layout (and therefore every page that doesn't opt into
// dynamic rendering itself) to be statically rendered. This eliminates
// per-request Vercel function invocations for the HTML shell.
// The /maintenance page overlays everything via `fixed inset-0 z-[9999]`,
// so we no longer need the runtime `headers()` check.
export const dynamic = "force-static";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // FOUC-prevention: resolve theme synchronously before first paint.
  // Reads `arena-theme` from localStorage; falls back to OS preference.
  const themeBootstrap = `(function(){try{var s=localStorage.getItem('arena-theme');var t=(s==='light'||s==='dark')?s:(window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');var r=document.documentElement;r.classList.remove('light','dark');r.classList.add(t);var m=document.querySelector('meta[name="theme-color"]');if(!m){m=document.createElement('meta');m.name='theme-color';document.head.appendChild(m);}m.content=(t==='light')?'#ffffff':'#050505';}catch(e){document.documentElement.classList.add('dark');}})();`;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Bootstrap MUST be the first child of <head> so it executes
            before any paint and before any other script touches the DOM. */}
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
        {/* theme-color meta: rendered dark by default; bootstrap script
            updates `content` to #ffffff when light mode is resolved.
            suppressHydrationWarning silences the attribute mismatch React
            would otherwise log when content has been mutated pre-hydration. */}
        <meta name="theme-color" content="#050505" suppressHydrationWarning />
        <link rel="preconnect" href="https://api.thearena.lk" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.thearena.lk" />
        {/* PWA / iOS */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="The Arena" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${jakartaSans.variable} ${syne.variable} antialiased bg-background text-foreground flex flex-col min-h-screen`}
        suppressHydrationWarning
      >
        <Providers>
          <SmoothScrolling>
            <Header />
            <MobileTopBar />
            <MobileMainWrapper>
              {children}
            </MobileMainWrapper>
            <Footer />
            <MobileBottomNav />
          </SmoothScrolling>
          <PWARegister />
        </Providers>
      </body>
    </html>
  );
}