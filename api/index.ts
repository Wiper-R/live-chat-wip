import express, { Router } from "express";
import { auth } from "express-oauth2-jwt-bearer";
import "dotenv/config";
import { mountRouters } from "./routers";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: { origin: "http://localhost:3000" },
  pingInterval: 1000,
  pingTimeout: 200,
});
io.on("connection", (socket) => {
  console.log(`A client connected ${socket.id}`);

  socket.emit("hello", { message: "Data from socket" });

  socket.on("disconnect", () => {
    console.log(`A client disconnected ${socket.id}`);
  });
});

app.use(express.json());
app.use(cors({ origin: ["http://localhost:3000"] }));

const api = Router();
app.use("/api", api);
api.use(auth());

mountRouters(api);

api.get("/authorized", async (req, res) => {
  res.send("Secured Resource");
});

const port = process.env.PORT || 8080;

server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
