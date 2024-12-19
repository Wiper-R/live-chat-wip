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
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] },
  pingInterval: 1000,
  pingTimeout: 200,
  path: "/socket",
  addTrailingSlash: false,
});
io.on("connection", async (socket) => {
  socket.emit("hello", { message: "Data from socket" });
  let counter = 0;
  setInterval(() => {
    counter++;
    socket.emit("hello", { message: `My new message ${counter}` });
  }, 1000);
  console.log(`A client connected ${socket.id}`);
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
