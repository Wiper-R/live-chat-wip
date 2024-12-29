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
      // TODO: Implement error detection
      const res = await this.apiClient.get(`/users/@me/chats/${chatId}`);
      const chat: Chat = res.data;
      const recipient = Call.getRecipient(chat, this.user);
      if (!recipient) {
        console.log("Recipient is not connected");
        // this.socket.emit("call:initiate", {
        //   chatId,
        //   reason: "User is offline",
        //   status: "failed",
        // });
        return;
      }
      const call = new Call(this.user, recipient, chat);
      CallManager.addCall(call);
      CallManager.broadcast(call.id, "caller", "call:outgoing", {
        callId: call.id,
        caller: call.caller,
        chat,
      });
      CallManager.broadcast(call.id, "recipient", "call:incoming", {
        callId: call.id,
        caller: call.caller,
        chat,
      });
    });

    this.socket.on(
      "call:answered",
      async ({ callId, peerId }: { callId: string; peerId: string }) => {
        const call = CallManager.getCall(callId);
        if (!call) return;
        if (call.recipient.id != this.user.id) return;
        console.log("Call answered, emitting");
        CallManager.broadcast(call.id, "all", "call:answered", {
          peerId,
          callId,
        });
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
