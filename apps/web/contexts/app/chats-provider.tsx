"use client";
import { apiClient } from "@/lib/api-client";
import queryKeyFactory from "@/lib/query-key-factory";
import { createContext } from "@/lib/utils";
import { Chat } from "@repo/api-types";
import { PropsWithChildren, useState } from "react";
import { useQuery } from "react-query";

type ChatsContext = {
  chats: Chat[];
  selectedChat?: Chat;
  selectedChatId: string;
  setSelectedChatId: React.Dispatch<React.SetStateAction<string>>;
};

const [Context, useChatsContext] = createContext<ChatsContext>();

export function ChatsProvider({ children }: PropsWithChildren) {
  const { data } = useQuery({
    async queryFn() {
      const res = await apiClient.get("/users/@me/chats");
      return res.data as Chat[];
    },
    queryKey: queryKeyFactory.chats.all,
  });
  const [selectedChatId, setSelectedChatId] = useState<string>("");

  const { data: selectedChat } = useQuery({
    async queryFn() {
      const res = await apiClient.get(`/users/@me/chats/${selectedChatId}`);
      return res.data as Chat;
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
