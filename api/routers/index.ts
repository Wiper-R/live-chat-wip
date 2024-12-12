import { Router, Express } from "express";
import friendsRouter from "./friends";

export function mountRouters(app: Express) {
  const router = Router();
  app.use("/api", router);
  router.use("/friends", friendsRouter);
}
