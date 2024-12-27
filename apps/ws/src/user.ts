import { Socket } from "socket.io";
import axios, { AxiosInstance } from "axios";
import { UserManager } from "./user-manager";
import { Chat, User } from "@repo/api-types";
import { Call } from "./call";
import { CallManager } from "./call-manager";

export class SocketUser {
  socket: Socket;
  apiClient: AxiosInstance;
  user: User;
  constructor(socket: Socket, apiClient: AxiosInstance, user: User) {
    this.socket = socket;
    this.apiClient = apiClient;
    this.user = user;
    this.registerListeners();
  }

  static async create(socket: Socket): Promise<SocketUser> {
    const auth = socket.handshake.headers["authorization"];
    const apiClient = axios.create({
      baseURL: "http://localhost:5000/api/v1/",
      headers: { Authorization: auth },
    });
    const req = await apiClient.get("/users/@me");
    const user: User = req.data;
    console.log(`User ${user.username} connected to socket;`);
    const sm = new SocketUser(socket, apiClient, user);
    UserManager.setUser(user.id, sm);
    return sm;
  }

  registerCallListeners() {
    this.socket.on("call:initiate", async ({ chatId }: { chatId: string }) => {
      const res = await this.apiClient.get(`/users/@me/chats/${chatId}`);
      const chat: Chat = res.data;
      const call = new Call(this.user.id, chat);
      CallManager.addCall(call);
      console.log(`Call with ${call.id} created`);
      call.broadCast("both", "call:initiate", {
        from: this.user,
        chat,
        callId: call.id,
      });
    });

    this.socket.on(
      "call:ready",
      ({ peerId, callId }: { peerId: string; callId: string }) => {
        const call = CallManager.getCall(callId);
        if (!call) {
          console.log(`Call with ${callId} don't exists`);
          return;
        }
        call.ready(this.user.id, peerId);
      },
    );
  }

  registerListeners() {
    this.registerCallListeners();
  }

  async destroy() {
    console.log(`User ${this.user.username} disconnected from socket;`);
    UserManager.deleteUser(this.user.id);
    this.socket.disconnect(true);
  }
}
