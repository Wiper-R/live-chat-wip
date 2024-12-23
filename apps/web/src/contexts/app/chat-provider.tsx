"use client";

import { createCustomContext } from "@/src/lib/utils";
import { PropsWithChildren } from "react";
import { useQuery } from "react-query";
import * as queryFactory from "@/src/lib/query-key-factory";
import axios from "axios";
import { ChatWithUsers } from "@live-chat/shared/types";

type ChatContext = {
  chat?: ChatWithUsers;
};
const [Context, useChatProvider] = createCustomContext<ChatContext>();

type ChatProviderProps = {
  chatId: number;
} & PropsWithChildren;

function ChatProvider({ children, chatId }: ChatProviderProps) {
  const { data } = useQuery<ChatWithUsers>({
    async queryFn() {
      const res = await axios.get(`/api/chats/${chatId}`);
      return res.data;
    },
    queryKey: queryFactory.chat.byId(chatId),
  });
  return (
    <Context.Provider
      value={{
        chat: data,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export { ChatProvider, useChatProvider };
