import { Sidebar } from "@/components/app/sidebar";
import { ChatsProvider } from "@/contexts/app/chats-provider";
import { SocketProvider } from "@/contexts/app/socket-provider";
import { UserProvider } from "@/contexts/app/user-provider";
import { PropsWithChildren } from "react";

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
