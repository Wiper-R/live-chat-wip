"use client";
import { Sidebar } from "@/components/app/sidebar";
import { Loader } from "@/components/loader";
import { ChatsProvider } from "@/contexts/app/chats-provider";
import { SocketProvider } from "@/contexts/app/socket-provider";
import { useUser } from "@/contexts/app/user-provider";
import { CallProvider } from "@/contexts/app/call-provider";
import { PropsWithChildren } from "react";

export default function AppLayout({ children }: PropsWithChildren) {
  return (
    <SocketProvider>
      <CallProvider>
        <LayoutInternal>{children}</LayoutInternal>
      </CallProvider>
    </SocketProvider>
  );
}

function LayoutInternal({ children }: PropsWithChildren) {
  const { user } = useUser();
  if (!user)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  else {
    return (
      <ChatsProvider>
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex-grow">{children}</div>
        </div>
      </ChatsProvider>
    );
  }
}
