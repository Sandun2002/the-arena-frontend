import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js Proxy (formerly Middleware):
 * 1. Always attaches the request pathname as `x-pathname` header so that
 *    server components (e.g. the root layout) can conditionally render chrome.
 * 2. When MAINTENANCE_MODE=true, rewrites all non-maintenance requests to
 *    /maintenance. Static assets and Next internals are excluded via the
 *    matcher config below.
 *
 * To toggle on Vercel:
 *   Project Settings -> Environment Variables -> add MAINTENANCE_MODE=true
 *   Then redeploy. Remove the variable (or set to false) and redeploy to
 *   resume normal operation.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Forward pathname to server components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  const maintenanceMode = process.env.MAINTENANCE_MODE === "true";

  // Let the maintenance page itself render without rewrite loops
  const isMaintenancePath = pathname === "/maintenance";

  if (maintenanceMode && !isMaintenancePath) {
    const url = request.nextUrl.clone();
    url.pathname = "/maintenance";
    return NextResponse.rewrite(url, {
      request: { headers: requestHeaders },
    });
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
