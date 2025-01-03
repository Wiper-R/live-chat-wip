import { Chat, User } from "@repo/api-types";
import { v4 as uuid } from "uuid";

export class Call {
  id: string;
  caller: User;
  recipient: User;
  chat: Chat;
  state: "ongoing" | "connecting";
  ended: boolean;

  constructor(caller: User, recipient: User, chat: Chat) {
    this.id = uuid();
    this.chat = chat;
    this.caller = caller;
    this.recipient = recipient;
    this.state = "connecting";
    this.ended = false;
  }

  static getRecipient(chat: Chat, caller: User) {
    return chat.Recipients.find((u) => u.User.id != caller.id);
  }
}
