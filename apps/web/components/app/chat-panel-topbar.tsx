"use client";
import { useUser } from "@/contexts/app/user-provider";
import { Button } from "../ui/button";
import { VideoIcon } from "lucide-react";
import { useChatsContext } from "@/contexts/app/chats-provider";
import { useSocket } from "@/contexts/app/socket-provider";

function VideoCallButton() {
  const { call } = useSocket();
  const { selectedChat: chat } = useChatsContext();
  return (
    <Button variant="outline" onClick={() => call(chat)}>
      <VideoIcon />
    </Button>
  );
}

export function ChatPanelTopBar() {
  // TODO: Support multiple users (but not for now)
  const { user } = useUser();
  const { selectedChat } = useChatsContext();
  const chatUser = selectedChat?.Recipients.find((u: any) => user?.id != u.id);
  return (
    <div className="p-4 flex gap-2 items-center border-b ">
      <div className="w-10 h-10 rounded-full bg-gray-600" />
      <div className="flex flex-col">
        <span>{chatUser?.name}</span>
        <span className="text-sm text-gray-300 dark:text-gray-500">
          @{chatUser?.username}
        </span>
      </div>
      <div className="ml-auto">
        <VideoCallButton />
      </div>
    </div>
  );
}
