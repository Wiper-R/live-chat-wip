"use client";
import { apiClient } from "@/lib/api-client";
import queryKeyFactory from "@/lib/query-key-factory";
import { createContext } from "@/lib/utils";
import { Chat } from "@repo/api-types";
import { PropsWithChildren } from "react";
import { useQuery } from "react-query";

type ChatsContext = {
  chats: Chat[];
};

const [Context, useChatsContext] = createContext<ChatsContext>();

export function ChatsProvider({ children }: PropsWithChildren) {
  const { data: chats } = useQuery({
    async queryFn() {
      const res = await apiClient.get("/users/@me/chats");
      return res.data as Chat[];
    },
    queryKey: queryKeyFactory.chats.all,
  });

  return (
    <Context.Provider value={{ chats: chats || [] }}>
      {children}
    </Context.Provider>
  );
}

export { useChatsContext };
