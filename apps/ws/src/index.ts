import { Server } from "socket.io";
import { SocketUser } from "./user";
import { RedisHandler } from "./redis";

const io = new Server({ addTrailingSlash: false });

// Initialize redis handler, for the notifications sytem
new RedisHandler();

io.on("connection", async (socket) => {
  try {
    var user = await SocketUser.create(socket);
  } catch (e) {
    console.error(e);
    return;
  }
  socket.on("disconnect", async () => {
    await user.destroy();
  });
});

io.listen(5001);
console.log("WS server is listening on port 5001");
