export const chat = {
  all: ["chat"] as const,
  messages: (chatId: number) => [...chat.all, "messages", +chatId] as const,
};

export const friends = {
  all: ["friends"] as const,
  list: (query: string) => [...friends.all, "list", query] as const,
  requests: (query: string) => [...friends.all, "requests", query] as const,
};

export const users = {
  all: ["users"] as const,
  search: (query: string) => [...users.all, "search", query],
};
