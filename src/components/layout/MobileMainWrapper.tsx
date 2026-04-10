"use client";

import { usePathname } from "next/navigation";

export default function MobileMainWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isVenueContext = pathname?.startsWith("/venue-dashboard");

  return (
    <main className={`flex-grow${isVenueContext ? "" : " pb-28 md:pb-0"}`}>
      {children}
    </main>
  );
}
