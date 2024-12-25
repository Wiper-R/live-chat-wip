"use client";

import { createCustomContext } from "@/lib/utils";
import { PropsWithChildren, useEffect, useState } from "react";

import { Socket, io } from "socket.io-client";

type SocketContext = {
  socket?: Socket;
};
const [Context, useSocket] = createCustomContext<SocketContext>();

export function SocketProvider({ children }: PropsWithChildren) {
  const [_socket, setSocket] = useState<Socket>();
  useEffect(() => {
    const socket = io();
    setSocket(socket);
    return () => {
      socket.disconnect();
      setSocket(_socket);
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
}

export { useSocket };
