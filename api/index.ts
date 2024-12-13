import express, { Router } from "express";
import { auth } from "express-oauth2-jwt-bearer";
import "dotenv/config";
import { mountRouters } from "./routers";
import cors from "cors";
const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" }));
app.use(auth());

const api = Router();
mountRouters(api);

app.use("/api", api);

api.get("/authorized", async (req, res) => {
  res.send("Secured Resource");
});

const port = process.env.PORT || 8080;

app.listen(port);
console.log("Running on port ", port);
