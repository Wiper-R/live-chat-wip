"use client";
import { createCustomContext } from "@/lib/utils";
import { PropsWithChildren, useEffect, useRef } from "react";
import io, { Socket } from "socket.io-client";

type SocketContext = {};

const [Context, useContext] = createCustomContext<SocketContext>();

export function SocketProvider({ children }: PropsWithChildren) {
  const socketRef = useRef<Socket>();
  useEffect(() => {
    var socket = io({ host: "http://localhost:5000" });
    socket.on("hello", (data) => {
      console.log(data);
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
