import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
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

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Arena | Premium Sports Booking",
  description: "Book high-end sports venues with ease.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read pathname forwarded from middleware so we can skip Header/Footer
  // on the standalone /maintenance page (which renders its own full-screen UI).
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const isStandalone = pathname === "/maintenance";

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground flex flex-col min-h-screen`}
        suppressHydrationWarning
      >
        <Providers>
          {isStandalone ? (
            children
          ) : (
            <SmoothScrolling>
              <Header />
              <MobileTopBar />
              <MobileMainWrapper>
                {children}
              </MobileMainWrapper>
              <Footer />
              <MobileBottomNav />
            </SmoothScrolling>
          )}
          <PWARegister />
        </Providers>
      </body>
    </html>
  );
}