import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const { pathname } = url;

  // 1. Setup request headers (preserve original behavior)
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  // 2. Maintenance Mode Check (preserve original behavior)
  const maintenanceMode = process.env.MAINTENANCE_MODE === "true";
  const isMaintenancePath = pathname === "/maintenance";

  if (maintenanceMode && !isMaintenancePath) {
    url.pathname = "/maintenance";
    return NextResponse.rewrite(url, {
      request: { headers: requestHeaders },
    });
  }

  // 3. Subdomain Routing Logic
  const hostname = request.headers.get("host") || "";
  const host = hostname.split(":")[0]; // Exclude port if any (e.g. localhost:3000)

  // Local development bypass
  if (host === "localhost" || host === "127.0.0.1") {
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  const MAIN_DOMAIN = process.env.NEXT_PUBLIC_MAIN_DOMAIN || "thearena.lk";
  const VENUE_DOMAIN = process.env.NEXT_PUBLIC_VENUE_DOMAIN || "centers.thearena.lk";

  // Handle subdomain host (centers.thearena.lk)
  if (host === VENUE_DOMAIN) {
    // 1. Rewrite root '/' to '/partner'
    if (pathname === "/") {
      url.pathname = "/partner";
      return NextResponse.rewrite(url, {
        request: { headers: requestHeaders },
      });
    }

    // 2. Rewrite '/signup' to '/signup/venue'
    if (pathname === "/signup") {
      url.pathname = "/signup/venue";
      return NextResponse.rewrite(url, {
        request: { headers: requestHeaders },
      });
    }

    // 3. Redirect '/signup/player' to main domain
    if (pathname === "/signup/player") {
      return NextResponse.redirect(new URL("/signup", `https://${MAIN_DOMAIN}`));
    }

    // 4. Redirect player-only paths to the main domain
    const playerPaths = [
      "/venues",
      "/book",
      "/bookings",
      "/challenges",
      "/profile",
      "/search",
    ];
    if (playerPaths.some(path => pathname === path || pathname.startsWith(path + "/"))) {
      return NextResponse.redirect(new URL(pathname + url.search, `https://${MAIN_DOMAIN}`));
    }

    // 5. Allow other paths (dashboard, login, assets, settings, etc.)
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // Handle main domain host (thearena.lk, www.thearena.lk, or any other host)
  if (host === MAIN_DOMAIN || host === `www.${MAIN_DOMAIN}`) {
    // 1. Redirect '/partner' to subdomain root
    if (pathname === "/partner") {
      return NextResponse.redirect(new URL("/" + url.search, `https://${VENUE_DOMAIN}`));
    }

    // 2. Redirect '/signup/venue' to subdomain '/signup'
    if (pathname === "/signup/venue") {
      return NextResponse.redirect(new URL("/signup" + url.search, `https://${VENUE_DOMAIN}`));
    }

    // 3. Redirect '/venue-dashboard/*' to subdomain
    if (pathname === "/venue-dashboard" || pathname.startsWith("/venue-dashboard/")) {
      return NextResponse.redirect(new URL(pathname + url.search, `https://${VENUE_DOMAIN}`));
    }

    // 4. Everything else on main domain passes through
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // Fallback next() with headers
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - /_next/static (static files)
     * - /_next/image (image optimization files)
     * - favicon.ico, robots.txt, sitemap.xml
     * - any file with an extension (png, jpg, svg, css, js, webmanifest, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
