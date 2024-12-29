import { User } from "@repo/api-types";
import { Call } from "./call";
import { SocketUser } from "./user";
import { UserManager } from "./user-manager";

export type CallManagerBroadcastType = "caller" | "recipient" | "all";

export class CallManager {
  static instance: CallManager;
  calls: Map<string, Call> = new Map();

  static getInstance() {
    if (!this.instance) {
      this.instance = new CallManager();
    }
    return this.instance;
  }

  static getCall(callId: string) {
    return this.getInstance().calls.get(callId);
  }

  static addCall(call: Call) {
    this.getInstance().calls.set(call.id, call);
  }

  static removeCall(callId: string) {
    return this.getInstance().calls.delete(callId);
  }

  static broadcast(
    callId: string,
    type: CallManagerBroadcastType,
    ev: string,
    message: Record<string, any>,
    autoEnd: boolean = true,
  ): boolean {
    const call = this.getCall(callId);

    if (!call) {
      console.log(`Error: Can't broadcast to ${callId} doesn't exist`);
      return false;
    }

    if (call.ended) {
      console.log("Error: Call is already ended, can't broadcast");
      return false;
    }

    const users: User[] = [];
    if (type == "caller" || type == "all") {
      users.push(call.caller);
    }

    if (type == "recipient" || type == "all") {
      users.push(call.recipient);
    }

    var success = true;
    for (let user of users) {
      if (!success) continue;
      success = UserManager.broadcast(user.id, ev, message);
    }

    if (!success && autoEnd) {
      this.endCall(call, "One of the client is disconnected");
    }

    return success;
  }

  static endCall(call: Call, reason: string) {
    this.broadcast(call.id, "all", "call:ended", { reason }, false);
    this.removeCall(call.id);
    call.ended = true;
  }
}
