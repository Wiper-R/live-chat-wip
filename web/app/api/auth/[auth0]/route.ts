import {
  AppRouteHandlerFnContext,
  handleAuth,
  handleCallback,
  Session,
} from "@auth0/nextjs-auth0";
import { NextRequest } from "next/server";

const afterCallback = async (
  req: NextRequest,
  session: Session,
  state?: { [key: string]: any }
) => {
  if (session.user) {
    const headers = new Headers();
    headers.append("Authorization", `Bearer ${session.accessToken}`);
    // TODO: Change this backend url
    await fetch("http://localhost:5000/api/user", {
      method: "POST",
      headers,
    });
  } else {
  }

  return session;
};

export const GET = handleAuth({
  async callback(req: NextRequest, ctx: AppRouteHandlerFnContext) {
    return await handleCallback(req, ctx, {
      afterCallback,
    });
  },
});
