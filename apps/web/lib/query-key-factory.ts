export const chats = {
  all: ["chats"] as const,
  byId: (chatId: string) => [...chats.all, chatId] as const,
  messages: (chatId: string) => [...chats.all, "messages", +chatId] as const,
};

export const relationships = {
  all: ["relationships"] as const,
  list: (query: string) => [...relationships.all, "list", query] as const,
  requests: (query: string) =>
    [...relationships.all, "requests", query] as const,
  pendingCount: () => [...relationships.all, "pendingCount"],
};

export const users = {
  all: ["users"] as const,
  current: () => [...users.all, "@me"] as const,
  search: (query: string) => [...users.all, "search", query] as const,
};

export default { chats, relationships, users };
