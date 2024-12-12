import express from "express";
import { auth } from "express-oauth2-jwt-bearer";
import "dotenv/config";
import axios from "axios";
import env from "./env";
const app = express();

const issuerClient = axios.create({
  baseURL: env.ISSUER_BASE_URL,
  responseType: "json",
});

const port = process.env.PORT || 8080;

app.use(auth());
app.get("/api", (req, res) => {
  res.json({ message: "Hello" });
});

app.get("/api/authorized", async (req, res) => {
  const resp = await issuerClient.get("/userinfo", {
    headers: { Authorization: `Bearer ${req.auth?.token}` },
  });
  console.log(resp.data);
  res.send("Secured Resource");
});

app.listen(port);
console.log("Running on port ", port);
