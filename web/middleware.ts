import {
  getSession,
  withMiddlewareAuthRequired,
} from "@auth0/nextjs-auth0/edge";

import { NextResponse } from "next/server";

export default withMiddlewareAuthRequired(async function middleware(req) {
  if (!req.nextUrl.pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const requestHeaders = new Headers(req.headers);
  const user = await getSession();
  requestHeaders.set("Authorization", `Bearer ${user?.idToken}`);
  const session = await getSession();
  const headers = new Headers(req.headers);

  if (session) {
    headers.append("Authorization", `Bearer ${session.accessToken}`);
  }

  return NextResponse.next({
    request: {
      headers,
    },
  });
});

export const config = {
  matcher: ["/private/:path*", "/api/:path*"],
};
