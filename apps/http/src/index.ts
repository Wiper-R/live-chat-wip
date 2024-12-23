import express from "express";
import "dotenv/config";
import http from "http";
import prisma from "@repo/db/client";
import env from "./env";
const app = express();
const server = http.createServer(app);

app.use(express.json());
app.get("/", async (req, res) => {
  const users = await prisma.user.findMany({});
  res.json(users);
});

app.listen(env.SERVER_PORT, () => {
  console.log(`Server is live at ${env.SERVER_PORT}`);
});
