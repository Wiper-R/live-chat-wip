"use client";
import { createCustomContext } from "@/lib/utils";
import { PropsWithChildren, useEffect } from "react";
import { useQuery, useQueryClient } from "react-query";
import queryKeyFactory, { chats } from "@/lib/query-key-factory";
import { apiClient } from "@/lib/api-client";
import { useChatsContext } from "./chats-provider";
import { useSocket } from "./socket-provider";
import { Message } from "@repo/api-types";

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
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  useEffect(() => {
    setSelectedChatId(chatId);

    return () => {
      setSelectedChatId(null);
    };
  }, []);

  function handleMessageCreate(message: Message) {
    queryClient.setQueryData(
      queryKeyFactory.chats.messages(message.chatId),
      (oldData: Message[] | undefined) => {
        if (!oldData) return [message];
        return [...oldData, message];
      }
    );
  }

  useEffect(() => {
    if (!socket) return;
    socket.on("message:create", handleMessageCreate);
    return () => {
      socket.off("message:create", handleMessageCreate);
    };
  }, [socket]);

  return (
    <Context.Provider value={{ messages: data || [], chatId }}>
      {children}
    </Context.Provider>
  );
}

export { useMessagesContext };
