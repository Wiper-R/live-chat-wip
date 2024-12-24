import { Server } from "socket.io";

const io = new Server({ addTrailingSlash: false });
io.on("connection", (socket) => {
  console.log(`Client connected ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`Client disconnected ${socket.id}`);
  });
});
io.listen(5001);
console.log("WS server is listening on port 5001");
