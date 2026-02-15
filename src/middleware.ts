import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/auth/:path*",
    "/api/competitors/:path*",
    "/api/products/:path*",
    "/api/alerts/:path*",
    "/api/alert-settings/:path*",
    "/api/scrape/:path*",
    "/api/ai/:path*",
  ],
};
