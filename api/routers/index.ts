import { Router } from "express";
import friendsRouter from "./friends";
import usersRouter from "./users";
import chatsRouter from "./chats";

export function mountRouters(router: Router) {
  router.use("/friends", friendsRouter);
  router.use("/users", usersRouter);
  router.use("/chats", chatsRouter);
}
