import { Chat } from "@repo/api-types";
import { v4 as uuid } from "uuid";
import { SocketUser } from "./user";
import { UserManager } from "./user-manager";

type BroadcastTo = "both" | "caller" | "receiver";

type CallUser = {
  id: string;
  state: "idle" | "ready";
  peerId?: string;
};

export class Call {
  id: string;
  chat: Chat;
  caller: CallUser;
  receiver: CallUser;

  constructor(callerId: string, chat: Chat) {
    this.id = uuid();
    this.caller = {
      id: callerId,
      state: "idle",
    };
    // We know we have atleast 2 Recipients in chat and one of them is receiver
    this.receiver = {
      id: chat.Recipients.find((u) => u.id != callerId)!.id,
      state: "idle",
    };
    this.chat = chat;
  }

  broadCast(to: BroadcastTo, ev: string, message: any) {
    const clients: (SocketUser | undefined)[] = [];
    const caller = UserManager.getUser(this.caller.id);
    const receiver = UserManager.getUser(this.receiver.id);
    if (to == "caller") {
      clients.push(caller);
    } else if (to == "receiver") {
      clients.push(receiver);
    } else {
      clients.push(caller, receiver);
    }
    for (const client of clients) {
      client?.socket.emit(ev, message);
    }
  }

  ready(userId: string, peerId: string) {
    if (userId == this.caller.id) {
      this.caller.state = "ready";
      this.caller.peerId = peerId;
    } else {
      this.receiver.state = "ready";
      this.receiver.peerId = peerId;
    }

    if (this.caller.state == "ready" && this.receiver.state == "ready") {
      this.callStart();
    }
  }

  callStart() {
    console.log("Call should start");
    this.broadCast("caller", "call:receiverReady", {
      receiverPeerId: this.receiver.peerId,
    });
  }
}
