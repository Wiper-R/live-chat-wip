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
  offer: RTCSessionDescriptionInit;
  callId: string;
  caller: User;
  chat: Chat;
};

export type CallAnswerRequest = {
  answer: RTCSessionDescriptionInit;
  callId: string;
};

export type CallAnswerResponse = {
  answer: RTCSessionDescriptionInit;
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
