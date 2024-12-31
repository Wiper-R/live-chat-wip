import { Socket } from "socket.io";
import axios, { AxiosInstance } from "axios";
import { UserManager } from "./user-manager";
import {
  CallInitiateResponse,
  Chat,
  User,
  CallAnswerRequest,
  CallAnswerResponse,
  CallConnectedResponse,
  CallConnectedRequest,
} from "@repo/api-types";
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
    this.socket.on(
      "call:start",
      async ({
        offer,
        chatId,
      }: {
        offer: RTCSessionDescriptionInit;
        chatId: string;
      }) => {
        const res = await this.apiClient.get(`/users/@me/chats/${chatId}`);
        const chat: Chat = res.data;
        const recipient = Call.getRecipient(chat, this.user);
        if (!recipient) {
          UserManager.broadcast(this.user.id, "call:failed", {
            message: "Recipient is offline",
          });
          return;
        }
        const call = new Call(this.user, recipient, chat);
        const response: CallInitiateResponse = {
          chat,
          offer,
          callId: call.id,
          caller: call.caller,
        };
        CallManager.addCall(call);
        CallManager.broadcast(call.id, "all", "call:initiate", response);
      },
    );

    this.socket.on(
      "call:answer:accepted",
      ({ callId, answer }: CallAnswerRequest) => {
        const call = CallManager.getCall(callId);
        if (!call) return;
        // TODO: Return a error to accepter that call is already dropped
        const response: CallAnswerResponse = {
          answer,
          callId,
        };
        CallManager.broadcast(callId, "caller", "call:answer", response);
      },
    );

    this.socket.on("call:connected", ({ callId }: CallConnectedRequest) => {
      const call = CallManager.getCall(callId);
      if (!call) return;
      // TODO: Return a error to accepter that call is already dropped
      const response: CallConnectedResponse = {
        callId,
        chat: call.chat,
        caller: call.caller,
      };
      CallManager.broadcast(callId, "all", "call:connected", response);
    });
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
