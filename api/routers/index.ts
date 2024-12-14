import { Router } from "express";
import friendsRouter from "./friends";
import usersRouter from "./users";

export function mountRouters(router: Router) {
  router.use("/friends", friendsRouter);
  router.use("/users", usersRouter);
}
