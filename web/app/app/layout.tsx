"use client";
import { Sidebar } from "@/components/app/sidebar";
import { ChatsProvider } from "@/contexts/app/chats-context";
import { SocketProvider } from "@/contexts/app/socket-provider";
import { PropsWithChildren, useEffect } from "react";

export default function AppLayout({ children }: PropsWithChildren) {
  return (
    <SocketProvider>
      <ChatsProvider>
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex-grow">{children}</div>
        </div>
      </ChatsProvider>
    </SocketProvider>
  );
}
