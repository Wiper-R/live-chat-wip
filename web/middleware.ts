import {
  getSession,
  withMiddlewareAuthRequired,
} from "@auth0/nextjs-auth0/edge";

import { NextResponse } from "next/server";

export default withMiddlewareAuthRequired(async function middleware(req) {
  if (req.nextUrl.pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  const session = await getSession();
  const headers = new Headers(req.headers);

  if (session) {
    console.log("Session exists");
    console.log(session.user);
    headers.append("Authorization", `Bearer ${session.accessToken}`);
  } else {
    console.log("Session doesn't exists");
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
