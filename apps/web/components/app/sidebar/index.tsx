"use client";
import { Input } from "@/components/ui/input";
import { FriendsDialog } from "../friends-dialog";
import { useChatsContext } from "@/contexts/app/chats-provider";
import Link from "next/link";
import { useUser } from "@/contexts/app/user-provider";
import { ScrollArea } from "../../ui/scroll-area";
import { UserUI } from "./../user";

function SideToolbox() {
  const { user } = useUser();
  return (
    <div className="mt-auto border-t p-4">{user && <UserUI {...user} />}</div>
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
    <ScrollArea>
      {chats.map((chat) => {
        var chatUser = chat.Recipients.find((u) => u.User.id != user!.id)!;
        return (
          <Link
            key={chat.id}
            href={`/app/chats/${chat.id}`}
            className="p-4 flex items-center justify-between"
          >
            <UserUI {...chatUser.User} />
            {chatUser.unreadMessages > 0 && (
              <span className="text-xs flex items-center justify-center bg-red-600 rounded-full p-0.5 px-2 w-5 h-5 text-white">
                {chatUser.unreadMessages}
              </span>
            )}
          </Link>
        );
      })}
    </ScrollArea>
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
