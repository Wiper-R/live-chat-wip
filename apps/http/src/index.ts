import express from "express";
import "dotenv/config";
import { router } from "./api/v1";
import env from "./env";
import cookieParser from "cookie-parser";
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use("/api/v1", router);

app.listen(env.PORT, () => {
  console.log(`Server is live at ${env.PORT}`);
});
