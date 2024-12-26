import { Socket } from "socket.io";
import axios, { AxiosInstance } from "axios";
import { UserManager } from "./user-manager";

type APIUser = {
  id: string;
  username: string;
  name: string;
};

export class SocketUser {
  socket: Socket;
  apiClient: AxiosInstance;
  user: APIUser;
  peerId: string | null;
  constructor(socket: Socket, apiClient: AxiosInstance, user: APIUser) {
    this.socket = socket;
    this.apiClient = apiClient;
    this.user = user;
    this.peerId = null;
    this.registerListeners();
  }

  static async create(socket: Socket): Promise<SocketUser> {
    const auth = socket.handshake.headers["authorization"];
    const apiClient = axios.create({
      baseURL: "http://localhost:5000/api/v1/",
      headers: { Authorization: auth },
    });
    const req = await apiClient.get("/users/@me");
    const user = req.data;
    console.log(`User ${user.username} connected to socket;`);
    const sm = new SocketUser(socket, apiClient, user);
    UserManager.getInstance().setUser(user.id, sm);
    return sm;
  }

  registerListeners() {
    this.socket.on("peer:connected", (peerId: string) => {
      this.peerId = peerId;
      console.log(
        `User (${this.user.username}) (Peer) is connected with id ${this.peerId}`,
      );
    });

    this.socket.on("peer:disconnected", () => {
      if (this.peerId == null) {
        return;
      }
      let peerId = this.peerId;
      console.log(
        `User (${this.user.username}) (Peer) is disconnected with id ${peerId}`,
      );
      this.peerId = null;
    });
  }

  async destroy() {
    console.log(`User ${this.user.username} disconnected from socket;`);
    UserManager.getInstance().deleteUser(this.user.id);
    this.socket.disconnect(true);
  }
}
