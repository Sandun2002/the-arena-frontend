"use client";

import Link from "next/link";
import { Instagram, Twitter, Linkedin } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const isVenueContext = pathname?.startsWith("/venue-dashboard");

  return (
    <footer className={`w-full border-t border-zinc-800 bg-black py-12 text-zinc-400${isVenueContext ? "" : " hidden md:block"}`}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">
              THE <span className="text-emerald-500">ARENA</span>
            </h3>
            <p className="text-sm">
              Premium sports venue booking for athletes who demand the best.
            </p>
          </div>

          {/* Links Column 1 */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-emerald-400">About Us</Link></li>
              <li><Link href="/partner" className="hover:text-emerald-400">Partner</Link></li>
              <li><Link href="/careers" className="hover:text-emerald-400">Careers</Link></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/help" className="hover:text-emerald-400">Help Center</Link></li>
              <li><Link href="/terms" className="hover:text-emerald-400">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-emerald-400">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Socials Column */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Follow Us</h4>
            <div className="flex gap-4">
              <Link href="#" aria-label="Follow us on Instagram" className="hover:text-emerald-400 transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" aria-label="Follow us on Twitter" className="hover:text-emerald-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" aria-label="Follow us on LinkedIn" className="hover:text-emerald-400 transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
        
        <div className="mt-12 border-t border-zinc-800 pt-8 text-center text-xs">
          &copy; <span suppressHydrationWarning>{new Date().getFullYear()}</span> The Arena. All rights reserved.
        </div>
      </div>
    </footer>
  );
}