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

  getUser(userId: string) {
    return this.users.get(userId);
  }

  setUser(userId: string, socketUser: SocketUser) {
    return this.users.set(userId, socketUser);
  }

  deleteUser(userId: string) {
    return this.users.delete(userId);
  }

  static async broadCast(userId: string, event: string, message: any) {
    const user = this.getInstance().getUser(userId);
    if (!user) return;
    user.socket.emit(event, message);
  }
}
