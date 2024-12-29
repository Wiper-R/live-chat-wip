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

  static broadCast(
    callId: string,
    type: CallManagerBroadcastType,
    ev: string,
    message: Record<string, any>,
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

    const clients: SocketUser[] = [];
    if (type == "caller" || type == "all") {
      clients.push(call.caller);
    }

    if (type == "recipient" || type == "all") {
      clients.push(call.recipient);
    }

    var success = false;
    for (const client of clients) {
      success = success && UserManager.broadCast(client.user.id, ev, message);
    }

    return success;
  }

  static endCall(call: Call, reason: string) {
    this.broadCast(call.id, "all", "call:ended", { reason });
    this.removeCall(call.id);
    call.ended = true;
  }
}
