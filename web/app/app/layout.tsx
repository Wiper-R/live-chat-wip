import { Sidebar } from "@/components/app/sidebar";
import { ChatsProvider } from "@/contexts/app/chats-context";
import { SocketProvider } from "@/contexts/app/socket-provider";
import { PropsWithChildren } from "react";
import { UserProvider } from "@auth0/nextjs-auth0/client";

export default function AppLayout({ children }: PropsWithChildren) {
  return (
    <UserProvider>
      <SocketProvider>
        <ChatsProvider>
          <div className="flex h-screen">
            <Sidebar />
            <div className="flex-grow">{children}</div>
          </div>
        </ChatsProvider>
      </SocketProvider>
    </UserProvider>
  );
}
