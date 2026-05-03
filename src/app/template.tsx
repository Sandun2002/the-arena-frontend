"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Animate the page in
    gsap.fromTo(
      ".page-transition",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", clearProps: "transform" }
    );
  }, [pathname]);

  return (
    <div className="page-transition" suppressHydrationWarning>
      {children}
    </div>
  );
}