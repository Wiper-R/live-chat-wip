import { Router } from "express";
import friendsRouter from "./friends";
import userRouter from "./user";

export function mountRouters(router: Router) {
  router.use("/friends", friendsRouter);
  router.use("/user", userRouter);
}
