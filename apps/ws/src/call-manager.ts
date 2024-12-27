import { Call } from "./call";

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

  static removeCall(call: Call) {
    return this.getInstance().calls.delete(call.id);
  }
}
