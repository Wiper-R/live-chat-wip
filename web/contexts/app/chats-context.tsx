"use client";
import { createCustomContext } from "@/lib/utils";
import axios from "axios";
import { PropsWithChildren } from "react";
import { useQuery } from "react-query";

type ChatsContext = {
  chats: any[];
  loadMoreChats: () => void;
};

const [Context, useChatsContext] = createCustomContext<ChatsContext>();

export function ChatsProvider({ children }: PropsWithChildren) {
  const { data } = useQuery({
    async queryFn() {
      const res = await axios.get("/api/chats/");
      return res.data;
    },
    queryKey: "chats",
  });

  function loadMoreChats() {
    return null;
  }

  return (
    <Context.Provider value={{ chats: data || [], loadMoreChats }}>
      {children}
    </Context.Provider>
  );
}

export { useChatsContext };
