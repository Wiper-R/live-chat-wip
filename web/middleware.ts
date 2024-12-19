import {
  getAccessToken,
  getSession,
  withMiddlewareAuthRequired,
} from "@auth0/nextjs-auth0/edge";

import { NextResponse } from "next/server";

export default withMiddlewareAuthRequired(async function middleware(req) {
  if (req.nextUrl.pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  const token = await getAccessToken();
  const headers = new Headers(req.headers);

  if (token) {
    headers.append("Authorization", `Bearer ${token.accessToken}`);
  } else {
  }

  return NextResponse.next({
    request: {
      headers,
    },
  });
});

export const config = {
  matcher: ["/:path*"],
};
