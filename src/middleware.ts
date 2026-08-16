import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Temporary gate: only a subset of storefront routes are live.
 * Everything else rewrites to /coming-soon — page files stay in the repo.
 *
 * Flip off by deleting this file (or emptying the matcher) when ready.
 */
const LIVE: RegExp[] = [
  /^\/$/, // home
  /^\/events(\/.*)?$/, // events + event detail
  /^\/menu(\/.*)?$/, // menu + order flow
  /^\/cart\/?$/, // cart
  /^\/offers\/?$/, // offers
  /^\/favorites\/?$/, // favorites
  /^\/contact\/?$/, // contact
  /^\/swagger(\/.*)?$/, // API docs
  /^\/api\/openapi\/?$/, // API docs spec (fetched by /swagger)
  /^\/coming-soon\/?$/,
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (LIVE.some((re) => re.test(pathname))) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/coming-soon";
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    /*
     * Skip Next internals and static assets.
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|backend-api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml)$).*)",
  ],
};
