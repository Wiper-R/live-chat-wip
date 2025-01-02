export type User = {
  id: string;
  username: string;
  name: string;
};

export type Chat = {
  id: string;
  Recipients: User[];
};

export type Message = {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  chatId: string;
  Chat: Chat;
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
