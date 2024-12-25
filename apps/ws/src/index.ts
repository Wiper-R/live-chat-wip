import { Server } from "socket.io";
import { UserManager } from "./user-manager";

const io = new Server({ addTrailingSlash: false });
io.on("connection", async (socket) => {
  console.log(`Client connected ${socket.id}`);
  const user = await UserManager.create(socket);
  socket.on("disconnect", async () => {
    console.log(`Client disconnected ${socket.id}`);
    await user.destroy();
  });
});

io.listen(5001);
console.log("WS server is listening on port 5001");
