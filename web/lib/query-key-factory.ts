export const messages = {
  all: ["messages"] as const,
  chat: (chatId: number) => [...messages.all, +chatId] as const,
};
