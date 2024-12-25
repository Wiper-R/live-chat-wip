import { Socket } from "socket.io";
import axios, { Axios } from "axios";

type User = {
  id: string;
  username: string;
  name: string;
};

export class UserManager {
  socket: Socket;
  apiClient: Axios;
  user: User;
  constructor(socket: Socket, apiClient: Axios, user: User) {
    this.socket = socket;
    this.apiClient = apiClient;
    this.user = user;
  }

  static async create(socket: Socket): Promise<UserManager> {
    const auth = socket.handshake.headers["authorization"];
    const apiClient = axios.create({
      baseURL: "http://localhost:5000/api/v1/",
      headers: { Authorization: auth },
    });
    try {
      const req = await apiClient.get("/users/@me");
      var user = req.data;
    } catch (e) {
      socket.disconnect(true);
      throw e;
    }
    console.log(`User ${user.username} connected to socket;`);
    const sm = new UserManager(socket, apiClient, user);
    return sm;
  }

  async destroy() {
    console.log(`User ${this.user.username} disconnected from socket;`);
    this.socket.disconnect(true);
  }
}
