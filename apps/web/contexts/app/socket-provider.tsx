"use client";

import { createContext } from "@/lib/utils";
import { Chat, User } from "@repo/api-types";
import React, { useEffect, useRef, useState } from "react";
import { PropsWithChildren } from "react";
import { io, Socket } from "socket.io-client";
import { useUser } from "./user-provider";
import assert from "assert";

type SocketContext = {
  socket: Socket;
  call: (chat: Chat) => void;
  callState: CallState;
};

type CallState =
  | {
      state: "idle";
    }
  | {
      state: "calling";
      chat: Chat;
      callId: string;
    }
  | {
      state: "receiving_call";
      from: User;
      chat: Chat;
      callId: string;
    }
  | {
      state: "on_call";
      chat: Chat;
      callId: string;
    };

const [Context, useSocket] = createContext<SocketContext>();

export const SocketProvider = ({ children }: PropsWithChildren) => {
  const socketRef = useRef(io({ autoConnect: false }));
  const { user } = useUser();
  const [callState, setCallState] = useState<CallState>({
    state: "idle",
  });
  useEffect(() => {
    const socket = socketRef.current;
    socket.open();
    return () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    if (!user) return;
    socket.on("call:initiate", (from: User, chat: Chat, callId: string) => {
      if (from.id == user.id) {
        setCallState({ state: "calling", chat, callId });
      } else {
        setCallState({ state: "receiving_call", from, chat, callId });
      }
    });
  }, [user]);

  function call(chat: Chat) {
    const socket = socketRef.current;
    socket.open();
    socketRef.current.emit("call:initiate", chat.id);
  }

  return (
    <Context.Provider
      value={{
        socket: socketRef.current,
        call,
        callState,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export { useSocket };
