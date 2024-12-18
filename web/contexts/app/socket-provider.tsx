"use client";
import { createCustomContext } from "@/lib/utils";
import { PropsWithChildren, useEffect, useRef } from "react";
import { useQueryClient } from "react-query";
import io, { Socket } from "socket.io-client";
import { useUser } from "@auth0/nextjs-auth0/client";

type SocketContext = {};

const [Context, useContext] = createCustomContext<SocketContext>();

export function SocketProvider({ children }: PropsWithChildren) {
  const socketRef = useRef<Socket>();
  const queryClient = useQueryClient();
  useEffect(() => {
    var socket = io({ path: "/socket", addTrailingSlash: false });
    socket.on("hello", (data) => {
      console.log(data);
    });
    socket.on("message", (data: any) => {
      queryClient.setQueryData(
        ["messages", data.message.chatId],
        (prev?: any[]) => {
          if (prev) {
            return [...prev, data.message];
          }
          return [data.message];
        }
      );
    });
    socketRef.current = socket;
    return () => {
      socket.disconnect();
      socketRef.current = undefined;
    };
  }, []);
  return <Context.Provider value={{}}>{children}</Context.Provider>;
}

export const useSocket = useContext;
