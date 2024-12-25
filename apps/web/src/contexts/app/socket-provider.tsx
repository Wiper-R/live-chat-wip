"use client";

import { createCustomContext } from "@/lib/utils";
import { PropsWithChildren, useEffect, useRef } from "react";

import { Socket, io } from "socket.io-client";

type SocketContext = {
  socket?: Socket;
};
const [Context, useSocket] = createCustomContext<SocketContext>();

export function SocketProvider({ children }: PropsWithChildren) {
  const socketRef = useRef<Socket>();
  useEffect(() => {
    const socket = io();
    socketRef.current = socket;

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
