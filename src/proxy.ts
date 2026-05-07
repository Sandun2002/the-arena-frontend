import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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
