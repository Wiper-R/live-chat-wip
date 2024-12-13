import express from "express";
import { auth } from "express-oauth2-jwt-bearer";
import "dotenv/config";
import { mountRouters } from "./routers";
import cors from "cors";
const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" }));
app.use(auth());
mountRouters(app);

const port = process.env.PORT || 8080;

app.get("/api", (req, res) => {
  res.json({ message: "Hello" });
});

app.get("/api/authorized", async (req, res) => {
  res.send("Secured Resource");
});

app.listen(port);
console.log("Running on port ", port);
