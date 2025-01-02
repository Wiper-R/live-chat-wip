"use client";
import { createContext } from "@/lib/utils";
import { PropsWithChildren, useEffect } from "react";
import { useQuery, useQueryClient } from "react-query";
import queryKeyFactory, { chats } from "@/lib/query-key-factory";
import { apiClient } from "@/lib/api-client";
import { useChatsContext } from "./chats-provider";
import { useSocket } from "./socket-provider";
import { Chat, Message } from "@repo/api-types";
import { useRouter } from "next/navigation";

type MessagesContext = {
  messages: Message[];
  selectedChatId: string;
  selectedChat?: Chat;
};

const [Context, useMessagesContext] = createContext<MessagesContext>();

type MessageProviderProps = PropsWithChildren & {
  chatId: string;
};

export function MessagesProvider({ chatId, children }: MessageProviderProps) {
  const { data: messages } = useQuery({
    async queryFn() {
      const res = await apiClient.get(`/users/@me/chats/${chatId}/messages`);
      return res.data;
    },
    queryKey: chats.messages(chatId),
  });
  const router = useRouter();
  const { data: selectedChat } = useQuery({
    async queryFn() {
      const res = await apiClient.get(`/users/@me/chats/${chatId}`);
      return res.data as Chat;
    },
    queryKey: chats.byId(chatId),
    onError() {
      router.push("/app");
    },
  });
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  function handleMessageCreate(message: Message) {
    queryClient.setQueryData(
      queryKeyFactory.chats.messages(message.chatId),
      (oldData: Message[] | undefined) => {
        if (!oldData) return [message];
        return [...oldData, message];
      },
    );
  }

  useEffect(() => {
    socket.on("message:create", handleMessageCreate);
    return () => {
      socket.off("message:create", handleMessageCreate);
    };
  }, []);

  return (
    <Context.Provider
      value={{ messages: messages || [], selectedChatId: chatId, selectedChat }}
    >
      {children}
    </Context.Provider>
  );
}

export { useMessagesContext };
