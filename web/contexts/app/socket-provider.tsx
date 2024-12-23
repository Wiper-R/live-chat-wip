"use client";
import { createCustomContext } from "@/lib/utils";
import { PropsWithChildren, useEffect, useRef, useState } from "react";
import { useQueryClient } from "react-query";
import io, { Socket } from "socket.io-client";
import { useUser } from "./user-provider";
import { chat } from "@/lib/query-key-factory";
import { Message } from "@live-chat/shared/prisma";

type SocketContext = {
  socket?: Socket;
};

const [Context, useContext] = createCustomContext<SocketContext>();

export function SocketProvider({ children }: PropsWithChildren) {
  const [_socket, setSocket] = useState<Socket | undefined>();
  const { user } = useUser();
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!user) return;
    var socket = io({ path: "/socket", addTrailingSlash: false });
    setSocket(socket);
    socket.on("message:create", async (message: Message) => {
      await queryClient.setQueryData(chat.messages(message.chatId), (prev) => {
        return [...((prev || []) as any[]), message];
      });
    });
    socket.on("connect", () => {
      console.log("Socket connected");
    });

    // TODO:  Handle disconnection

    return () => {
      socket.disconnect();
      setSocket(undefined);
    };
  }, [user]);
  return (
    <Context.Provider value={{ socket: _socket }}>{children}</Context.Provider>
  );
}

export const useSocket = useContext;
