"use client";

import { createContext } from "@/lib/utils";
import React, { useEffect, useRef } from "react";
import { PropsWithChildren } from "react";

import { io, Socket } from "socket.io-client";

type SocketContext = {
  socket: Socket;
};
const [Context, useSocket] = createContext<SocketContext>();

export const SocketProvider = ({ children }: PropsWithChildren) => {
  const socketRef = useRef(io({ autoConnect: false }));

  useEffect(() => {
    socketRef.current.open();
    return () => {
      socketRef.current.close();
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
};

export { useSocket };
