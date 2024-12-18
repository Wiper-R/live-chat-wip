import { Sidebar } from "@/components/app/sidebar";
import { ChatsProvider } from "@/contexts/app/chats-context";
import { PropsWithChildren } from "react";

export default function AppLayout({ children }: PropsWithChildren) {
  return (
    <ChatsProvider>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-grow">{children}</div>
      </div>
    </ChatsProvider>
  );
}
