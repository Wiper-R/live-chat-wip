import { Socket } from "socket.io";
import axios, { AxiosInstance } from "axios";
import { UserManager } from "./user-manager";
import { Chat } from "@repo/api-types";

type APIUser = {
  id: string;
  username: string;
  name: string;
};

var current_call_id = 0;

type Call = {
  id: number;
  callerId: string;
  callerState: "idle" | "ready";
  receiverId: string;
  receiverState: "idle" | "ready";
  chat: Chat;
  receiverPeer?: string;
};

const calls: Map<number, Call> = new Map();

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
      this.peerId = peerId;
    });

    // Call Stuff
    this.socket.on("call:initiate", async (chatId: string) => {
      const res = await this.apiClient.get(`/users/@me/chats/${chatId}`);
      const chat: Chat = res.data;
      const receiver = chat.Recipients.find((u) => u.id != this.user.id)!;
      const call: Call = {
        id: ++current_call_id,
        callerState: "idle",
        receiverState: "idle",
        callerId: this.user.id,
        receiverId: receiver.id,
        chat,
      };
      for (const recipient of chat.Recipients) {
        const socketUser = UserManager.getInstance().getUser(recipient.id);
        if (!socketUser) continue;
        console.log(socketUser.user.id + " alerting");
        console.log(this.user);
        socketUser.socket.emit("call:initiate", this.user, chat, call.id);
      }
      calls.set(call.id, call);
      // Only receive chatId, fetch chat here, and then call each recipient
    });

    this.socket.on("call:ready", (peerId: string, callId: number) => {
      const call = calls.get(callId);
      if (!call) return console.log("Call doesn't exists");
      if (this.user.id == call.callerId) {
        call.callerState = "ready";
      } else if (call.receiverId == this.user.id) {
        call.receiverState = "ready";
        call.receiverPeer = peerId;
      }
      if (call.callerState == "ready" && call.receiverState == "ready") {
        const user = UserManager.getInstance().getUser(call.callerId);
        user?.socket.emit("call:start", call.receiverPeer);
      }
    });
  }

  async destroy() {
    console.log(`User ${this.user.username} disconnected from socket;`);
    UserManager.getInstance().deleteUser(this.user.id);
    this.socket.disconnect(true);
  }
}
