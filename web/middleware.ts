import {
  withMiddlewareAuthRequired,
  getSession,
} from "@auth0/nextjs-auth0/edge";

import { NextResponse } from "next/server";

export default withMiddlewareAuthRequired({
  async middleware(req) {
    if (req.nextUrl.pathname.startsWith("/api/auth/")) {
      return NextResponse.next();
    }

    const res = NextResponse.next();

    const token = await getSession(req, res);

    if (token) {
      res.headers.append("Authorization", `Bearer ${token.accessToken}`);
    }
    return res;
  },
  returnTo: "/app",
});

export const config = {
  matcher: ["/:path*"],
};
