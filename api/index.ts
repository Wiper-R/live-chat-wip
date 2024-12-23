import express, { NextFunction, Router, Request, Response } from "express";
import { auth } from "express-oauth2-jwt-bearer";
import "dotenv/config";
import { mountRouters } from "./routers";
import cors from "cors";
import http from "http";
import { Server, Socket } from "socket.io";
import axios from "axios";
import { getUser } from "./routers/users";
const app = express();
const server = http.createServer(app);

const connections: Record<number, Socket> = {};
const peers: Record<number, string> = {};

// Socket.io setup
const io = new Server(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] },
  pingInterval: 1000,
  pingTimeout: 200,
  path: "/socket",
  addTrailingSlash: false,
});
io.on("connection", async (socket) => {
  try {
    const res = await axios.get("http://localhost:5000/api/users", {
      headers: { Authorization: socket.handshake.headers.authorization },
    });
    var user = res.data;
  } catch (e) {
    socket.disconnect(true);
    return;
  }
  console.log(`A client connected ${socket.id}`);
  connections[user.id] = socket;
  socket.on("peer:open", (id: string) => {
    peers[user.id] = id;
  });
  socket.on("call:request", async (userId: number) => {
    console.log("Server got call request");
    if (!(userId in peers)) {
      console.log("No peer found");
      return;
    }
    try {
      var chat = await prisma.chat.findFirstOrThrow({
        where: {
          AND: [
            {
              Users: {
                some: {
                  id: user.id,
                },
              },
            },
            {
              Users: {
                some: {
                  id: userId,
                },
              },
            },
          ],
        },
        include: { Users: true },
      });
    } catch (e) {
      return;
    }
    socket.emit("call:request", {
      peerId: peers[userId],
      userId,
      chat,
    });
  });
  socket.on("disconnect", () => {
    console.log(`A client disconnected ${socket.id}`);
    delete connections[user.id];
    delete peers[user.id];
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

export { connections, peers };
