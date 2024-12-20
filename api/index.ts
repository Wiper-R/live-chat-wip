import express, { NextFunction, Router, Request, Response } from "express";
import { auth } from "express-oauth2-jwt-bearer";
import "dotenv/config";
import { mountRouters } from "./routers";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import axios from "axios";
import { getUser } from "./routers/users";
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
  const res = await axios.get("http://localhost:5000/api/users", {
    headers: { Authorization: socket.handshake.headers.authorization },
  });
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

async function middleware(req: Request, res: Response, next: NextFunction) {
  if (req.path == "/users/finalize") {
    next();
    return;
  }

  const user = await getUser(req.auth.payload.sub);
  if (!user) {
    res.status(401).json({});
    return;
  }
  next();
}

const api = Router();
api.use(auth());
api.use(middleware);
app.use("/api", api);

mountRouters(api);

const port = process.env.PORT || 8080;

server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
