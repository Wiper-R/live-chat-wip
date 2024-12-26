"use client";
import { Input } from "@/components/ui/input";
import { FriendsDialog } from "./friends-dialog";
import { useChatsContext } from "@/contexts/app/chats-provider";
import Link from "next/link";
import { useUser } from "@/contexts/app/user-provider";

function SideToolbox() {
  return (
    <div className="mt-auto w-full p-4 border-t">
      <div className="w-12 h-12 rounded-full bg-gray-600" />
    </div>
  );
}

function ChatSearch() {
  return (
    <div className="w-full p-4 flex gap-2">
      <Input placeholder="Search a chat" />
      <FriendsDialog />
    </div>
  );
}

function ChatList() {
  const { chats } = useChatsContext();
  const { user } = useUser();
  return (
    <div className="flex flex-col overflow-scroll w-full py-2">
      {chats.map((chat) => {
        var chatUser = chat.Recipients.find((u: any) => u.id != user!.id);
        return (
          <Link
            className="px-5 py-2 space-x-3 flex items-center"
            key={chat.id}
            href={`/app/chats/${chat.id}`}
          >
            <div className="w-10 h-10 rounded-full bg-gray-600" />
            <span>{chatUser.name}</span>
          </Link>
        );
      })}
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="max-w-sm bg-background h-screen w-full border-r flex flex-col overflow-hidden min-w-[300px]">
      <ChatSearch />
      <ChatList />
      <SideToolbox />
    </aside>
  );
}
