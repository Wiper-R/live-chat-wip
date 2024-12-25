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
