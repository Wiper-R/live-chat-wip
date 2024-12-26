"use client";

import { createCustomContext } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";
import { PropsWithChildren } from "react";

import { io, Socket } from "socket.io-client";

type SocketContext = {
  socket: Socket | null;
};
const [Context, useSocket] = createCustomContext<SocketContext>();

export const SocketProvider = React.memo(({ children }: PropsWithChildren) => {
  const [_socket, setSocket] = useState<Socket | null>(null);
  useEffect(() => {
    const socket = io();
    setSocket(socket);
    return () => {
      socket.disconnect();
      setSocket(null);
    };
  }, []);
  return (
    <Context.Provider
      value={{
        socket: _socket,
      }}
    >
      {children}
    </Context.Provider>
  );
});
export { useSocket };
