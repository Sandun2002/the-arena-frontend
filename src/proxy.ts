import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = [
  "/dashboard",
  "/bookings",
  "/profile",
  "/settings",
  "/challenges",
  "/reviews",
  "/venue-dashboard",
  "/checkout",
];

function isProtected(pathname: string): boolean {
  return PROTECTED_PATHS.some((p) => pathname.startsWith(p));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  const maintenanceMode = process.env.MAINTENANCE_MODE === "true";

  const isMaintenancePath = pathname === "/maintenance";

  if (maintenanceMode && !isMaintenancePath) {
    const url = request.nextUrl.clone();
    url.pathname = "/maintenance";
    return NextResponse.rewrite(url, {
      request: { headers: requestHeaders },
    });
  }

  if (isProtected(pathname)) {
    const refreshCookie = request.cookies.get("arena_refresh");

    if (!refreshCookie?.value) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

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
