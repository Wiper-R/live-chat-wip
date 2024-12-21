"use client";
import { createCustomContext } from "@/lib/utils";
import axios from "axios";
import { PropsWithChildren } from "react";
import { useQuery } from "react-query";
import { chat } from "@/lib/query-key-factory";
import { Message } from "@live-chat/shared/prisma";

type MessagesContext = {
  messages: Message[];
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
    queryKey: chat.messages(chatId),
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
