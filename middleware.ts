import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  try {
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
