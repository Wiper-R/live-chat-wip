import { Server } from "socket.io";
import { SocketUser } from "./user";
import redis from "@repo/redis/client";
import { Message } from "@repo/api-types";
import { UserManager } from "./user-manager";

const io = new Server({ addTrailingSlash: false });
io.on("connection", async (socket) => {
  console.log(`Client connected ${socket.id}`);
  try {
    var user = await SocketUser.create(socket);
  } catch (e) {
    console.error(e);
    return;
  }
  socket.on("disconnect", async () => {
    console.log(`Client disconnected ${socket.id}`);
    await user.destroy();
  });
});

redis.subscribe("message:create", (err, count) => {
  if (err) console.error(err);
  console.log(`Subsribed to ${count} channels`);
});

function broadcastMessageCreate(message: Message) {
  for (const recipient of message.Chat.Recipients) {
    UserManager.broadCast(recipient.id, "message:create", message);
  }
}

redis.on("message", (channel, message) => {
  switch (channel) {
    case "message:create":
      broadcastMessageCreate(JSON.parse(message) as Message);
      break;
  }
});

io.listen(5001);
console.log("WS server is listening on port 5001");
