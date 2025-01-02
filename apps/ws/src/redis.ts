import redis from "@repo/redis/client";
import { Message, Relationship } from "@repo/api-types";
import { UserManager } from "./user-manager";

export class RedisHandler {
  constructor() {
    this.subscribeChannels();
    this.registerListeners();
  }

  subscribeChannels() {
    redis.subscribe("message:create", "relationship:new", (err, count) => {
      if (err) console.error(err);
      console.log(`Subsribed to ${count} channels`);
    });
  }

  registerListeners() {
    redis.on("message", (channel, rawMessage) => {
      const message = JSON.parse(rawMessage);
      switch (channel) {
        case "message:create":
          this.broadcastMessageCreate(message);
          break;
        case "relationship:new":
          this.broadcastIncomingRelationship(message);
          break;
      }
    });
  }
  broadcastMessageCreate(message: Message) {
    for (const recipient of message.Chat.Recipients) {
      UserManager.broadcast(recipient.id, "message:create", message);
    }
  }

  broadcastIncomingRelationship(relationship: Relationship) {
    const recipientId = relationship.recipientId;
    UserManager.broadcast(recipientId, "relationship:new", relationship);
  }
}
