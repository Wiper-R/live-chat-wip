export type User = {
  id: string;
  username: string;
  name: string;
};

export type ChatUser = {
  id: string;
  chatId: string;
  lastSeenAt: Date;
  userId: string;
  User: User;
  unreadMessages: number;
};

export type Chat = {
  id: string;
  Recipients: ChatUser[];
};

export type Message = {
  id: string;
  content: string;
  senderId: string;
  chatId: string;
  Chat: Chat;
  createdAt: Date;
};

export type Relationship = {
  id: string;
  recipientId: string;
  senderId: string;
  status: "pending" | "accepted";
  createdAt: Date;
  updatedAt: Date;
  Sender: User;
  Recipient: User;
  userIds: string[];
};

export type CallInitiateResponse = {
  callId: string;
  caller: User;
  chat: Chat;
};

export type CallAnswerRequest = {
  callId: string;
};

export type CallAnswerResponse = {
  callId: string;
};

export type CallConnectedRequest = {
  callId: string;
};

export type CallConnectedResponse = {
  callId: string;
  chat: Chat;
  caller: User;
};
