import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  try {
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

    return await updateSession(request);
  } catch (error) {
    console.error("[middleware]", error);
    // Never blank the site if auth/session middleware fails — continue the request.
    return NextResponse.next({ request });
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/account/:path*",
    "/login",
    "/signup",
    "/checkout",
    "/auth/callback",
  ],
};
