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
