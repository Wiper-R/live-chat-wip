"use client";
import { createCustomContext } from "@/lib/utils";
import { PropsWithChildren, useEffect } from "react";
import { useQuery } from "react-query";
import { chats } from "@/lib/query-key-factory";
import { apiClient } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useChatsContext } from "./chats-provider";

type Message = any;

type MessagesContext = {
  messages: Message[];
  chatId: string;
};

const [Context, useMessagesContext] = createCustomContext<MessagesContext>();

type MessageProviderProps = PropsWithChildren & {
  chatId: string;
};

export function MessagesProvider({ chatId, children }: MessageProviderProps) {
  const { data } = useQuery({
    async queryFn() {
      const res = await apiClient.get(`/users/@me/chats/${chatId}/messages`);
      return res.data;
    },
    queryKey: chats.messages(chatId),
  });
  const { setSelectedChatId } = useChatsContext();
  useEffect(() => {
    setSelectedChatId(chatId);

    return () => {
      setSelectedChatId(null);
    };
  }, []);
  return (
    <Context.Provider value={{ messages: data || [], chatId }}>
      {children}
    </Context.Provider>
  );
}

export { useMessagesContext };
