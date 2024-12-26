export const chats = {
  all: ["chats"] as const,
  byId: (chatId: string) => [...chats.all, chatId] as const,
  messages: (chatId: string) => [...chats.all, "messages", +chatId] as const,
};

export const friends = {
  all: ["friends"] as const,
  list: (query: string) => [...friends.all, "list", query] as const,
  requests: (query: string) => [...friends.all, "requests", query] as const,
};

export const users = {
  all: ["users"] as const,
  current: () => [...users.all, "@me"] as const,
  search: (query: string) => [...users.all, "search", query] as const,
};

export default { chats, friends, users };
