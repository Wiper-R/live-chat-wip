"use client";
import { createCustomContext } from "@/lib/utils";
import axios from "axios";
import { PropsWithChildren } from "react";
import { useQuery } from "react-query";

type MessagesContext = {
  messages: any[];
  loadMoreMessages: () => void;
  chatId: number;
};

const [Context, useMessagesContext] = createCustomContext<MessagesContext>();

type MessageProviderProps = PropsWithChildren & {
  chatId: number;
};

export function MessagesProvider({ chatId, children }: MessageProviderProps) {
  const { data } = useQuery({
    async queryFn() {
      const res = await axios.get(`/api/chats/${chatId}/messages`);
      return res.data;
    },
    queryKey: ["messages", chatId],
  });
  function loadMoreMessages() {}
  return (
    <Context.Provider
      value={{ messages: data || [], loadMoreMessages, chatId }}
    >
      {children}
    </Context.Provider>
  );
}

export { useMessagesContext };
