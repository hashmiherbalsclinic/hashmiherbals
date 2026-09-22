import { type NextRequest, NextResponse } from "next/server";
import {
  fetchMaintenanceModeEdge,
  isMaintenanceBypassPath,
} from "@/lib/maintenance";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  try {
    const path = request.nextUrl.pathname;

    // Server Actions / RSC POSTs break if middleware redirects or replaces the body.
    // Refresh cookies only — auth is enforced inside each admin server action.
    const isServerAction =
      request.method === "POST" &&
      (request.headers.has("next-action") ||
        request.headers.get("content-type")?.includes(
          "multipart/form-data; boundary="
        ));

    if (isServerAction) {
      return await updateSession(request, { skipRedirects: true });
    }

    // Lock the public storefront when maintenance mode is on.
    // Admin + auth + the construction page itself always stay reachable.
    if (!isMaintenanceBypassPath(path)) {
      const locked = await fetchMaintenanceModeEdge();
      if (locked) {
        const redirect = request.nextUrl.clone();
        redirect.pathname = "/under-construction";
        redirect.search = "";
        return NextResponse.redirect(redirect);
      }
    }

    // Auth session refresh only needed on protected / auth routes
    const needsAuth =
      path.startsWith("/admin") ||
      path.startsWith("/account") ||
      path === "/login" ||
      path === "/signup" ||
      path === "/checkout" ||
      path.startsWith("/auth/");

    if (needsAuth) {
      return await updateSession(request);
    }

    return NextResponse.next({ request });
  } catch (error) {
    console.error("[middleware]", error);
    // Never blank the site if auth/session middleware fails — continue the request.
    return NextResponse.next({ request });
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
