import { Chat } from "@repo/api-types";
import { v4 as uuid } from "uuid";
import { SocketUser } from "./user";
import { UserManager } from "./user-manager";

export class Call {
  id: string;
  caller: SocketUser;
  recipient: SocketUser;
  chat: Chat;
  state: "ongoing" | "connecting";
  ended: boolean;

  constructor(caller: SocketUser, chat: Chat, recipient: SocketUser) {
    this.id = uuid();
    this.chat = chat;
    this.caller = caller;
    this.recipient = recipient;
    this.state = "connecting";
    this.ended = false;
  }

  static getRecipient(chat: Chat, caller: SocketUser) {
    const recipient_user = chat.Recipients.find((u) => u.id != caller.user.id);
    if (!recipient_user) return undefined;
    return UserManager.getUser(recipient_user.id);
  }
}
