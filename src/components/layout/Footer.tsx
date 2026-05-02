"use client";

import Link from "next/link";
import { InstagramLogo, TwitterLogo, LinkedinLogo } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const isVenueContext = pathname?.startsWith("/venue-dashboard");

  return (
    <footer className={`w-full border-t border-default bg-surface-base pt-12 pb-28 md:pb-12 text-secondary${isVenueContext ? " hidden" : ""}`}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-primary">
              THE <span className="text-brand-accent">ARENA</span>
            </h3>
            <p className="text-sm">
              Premium sports venue booking for athletes who demand the best.
            </p>
          </div>

          {/* Links Column 1 */}
          <div>
            <h4 className="mb-4 font-semibold text-primary">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-brand-accent-hover">About Us</Link></li>
              <li><Link href="/partner" className="hover:text-brand-accent-hover">Partner</Link></li>
              <li><Link href="/careers" className="hover:text-brand-accent-hover">Careers</Link></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h4 className="mb-4 font-semibold text-primary">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/help" className="hover:text-brand-accent-hover">Help Center</Link></li>
              <li><Link href="/terms" className="hover:text-brand-accent-hover">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-brand-accent-hover">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Socials Column */}
          <div>
            <h4 className="mb-4 font-semibold text-primary">Follow Us</h4>
            <div className="flex gap-4">
              <Link href="#" aria-label="Follow us on Instagram" className="hover:text-brand-accent-hover transition-colors">
                <InstagramLogo size={20} weight="duotone" />
              </Link>
              <Link href="#" aria-label="Follow us on Twitter" className="hover:text-brand-accent-hover transition-colors">
                <TwitterLogo size={20} weight="duotone" />
              </Link>
              <Link href="#" aria-label="Follow us on LinkedIn" className="hover:text-brand-accent-hover transition-colors">
                <LinkedinLogo size={20} weight="duotone" />
              </Link>
            </div>
          </div>
        </div>
        
        <div className="mt-12 border-t border-default pt-8 text-center text-xs">
          &copy; <span suppressHydrationWarning>{new Date().getFullYear()}</span> The Arena. All rights reserved.
        </div>
      </div>
    </footer>
  );
}