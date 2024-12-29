import { SocketUser } from "./user";

export class UserManager {
  static instance: UserManager;
  users: Map<string, SocketUser> = new Map();

  static getInstance() {
    if (!this.instance) {
      this.instance = new UserManager();
    }

    return this.instance;
  }

  static getUser(userId: string) {
    return this.getInstance().users.get(userId);
  }

  static setUser(userId: string, socketUser: SocketUser) {
    return this.getInstance().users.set(userId, socketUser);
  }

  static deleteUser(userId: string) {
    return this.getInstance().users.delete(userId);
  }

  static broadcast(userId: string, event: string, message: any) {
    const user = this.getUser(userId);
    if (!user || !user.socket.connected) return false;
    user.socket.emit(event, message);
    return true;
  }
}
