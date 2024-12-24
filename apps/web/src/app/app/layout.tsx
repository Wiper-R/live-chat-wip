"use client";
import { Sidebar } from "@/components/app/sidebar";
import { Loader } from "@/components/loader";
import { ChatsProvider } from "@/contexts/app/chats-provider";
import { UserProvider, useUser } from "@/contexts/app/user-provider";
import { PropsWithChildren } from "react";

export default function AppLayout({ children }: PropsWithChildren) {
  return (
    <UserProvider>
      <LayoutInternal>{children}</LayoutInternal>
    </UserProvider>
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
