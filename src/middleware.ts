import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Coming-soon gate disabled on this branch: all storefront routes are live.
 */
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Skip Next internals and static assets.
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|backend-api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml)$).*)",
  ],
};
