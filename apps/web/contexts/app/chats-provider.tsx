"use client";
import { apiClient } from "@/lib/api-client";
import queryKeyFactory from "@/lib/query-key-factory";
import { createContext } from "@/lib/utils";
import { PropsWithChildren, useState } from "react";
import { useQuery } from "react-query";

type Chat = any;

type ChatsContext = {
  chats: Chat[];
  selectedChat: Chat | null;
  selectedChatId: string | null;
  setSelectedChatId: React.Dispatch<React.SetStateAction<string | null>>;
};

const [Context, useChatsContext] = createContext<ChatsContext>();

export function ChatsProvider({ children }: PropsWithChildren) {
  const { data } = useQuery({
    async queryFn() {
      const res = await apiClient.get("/users/@me/chats");
      return res.data;
    },
    queryKey: queryKeyFactory.chats.all,
  });
  const [selectedChatId, setSelectedChatId] = useState<Chat | null>(null);

  const { data: selectedChat } = useQuery<Chat | null>({
    async queryFn() {
      if (!selectedChatId) return null;
      const res = await apiClient.get(`/users/@me/chats/${selectedChatId}`);
      return res.data;
    },
    queryKey: queryKeyFactory.chats.byId(selectedChatId),
  });

  return (
    <Context.Provider
      value={{
        chats: data || [],
        selectedChat,
        selectedChatId,
        setSelectedChatId,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export { useChatsContext };
