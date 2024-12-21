"use client";
import { createCustomContext } from "@/lib/utils";
import { PropsWithChildren, useEffect, useRef } from "react";
import { useQueryClient } from "react-query";
import io, { Socket } from "socket.io-client";
import { useUser } from "./user-provider";
import { messages } from "@/lib/query-key-factory";

type SocketContext = {};

const [Context, useContext] = createCustomContext<SocketContext>();

export function SocketProvider({ children }: PropsWithChildren) {
  const socketRef = useRef<Socket>();
  const { user } = useUser();
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!user) return;
    var socket = io({ path: "/socket", addTrailingSlash: false });
    socket.on("message", async (message: any) => {
      await queryClient.setQueryData(messages.chat(message.chatId), (prev) => {
        return [...((prev || []) as any[]), message];
      });
    });
    socketRef.current = socket;
    return () => {
      socket.disconnect();
      socketRef.current = undefined;
    };
  }, [user]);
  return <Context.Provider value={{}}>{children}</Context.Provider>;
}

export const useSocket = useContext;
