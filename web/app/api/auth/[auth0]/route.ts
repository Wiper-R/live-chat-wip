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
  console.log("I am getting called after callback", session);
  if (session.user) {
    console.log("user found", session.user);
  } else {
    console.log("user not found", session);
  }

  return session;
};

export const GET = handleAuth({
  async callback(req: NextRequest, ctx: AppRouteHandlerFnContext) {
    console.log(ctx);
    return await handleCallback(req, ctx, {
      afterCallback,
    });
  },
});
