"use client";

import { createCustomContext } from "@/lib/utils";
import { PropsWithChildren, useEffect, useRef } from "react";
import { Message } from "@repo/api-types";

import { Socket, io } from "socket.io-client";
import { useQueryClient } from "react-query";
import queryKeyFactory from "@/lib/query-key-factory";

type SocketContext = {
  socket?: Socket;
};
const [Context, useSocket] = createCustomContext<SocketContext>();

export function SocketProvider({ children }: PropsWithChildren) {
  const socketRef = useRef<Socket>();
  const queryClient = useQueryClient();
  useEffect(() => {
    const socket = io();
    socketRef.current = socket;

    socket.on("message:create", (message: Message) => {
      queryClient.setQueryData(
        queryKeyFactory.chats.messages(message.chatId),
        (oldData: Message[] | undefined) => {
          if (!oldData) return [message];
          return [...oldData, message];
        },
      );
    });

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = undefined;
    };
  }, []);
  return (
    <Context.Provider
      value={{
        socket: socketRef.current,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export { useSocket };
