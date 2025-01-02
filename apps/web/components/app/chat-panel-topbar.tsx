"use client";
import { useUser } from "@/contexts/app/user-provider";
import { Button } from "../ui/button";
import { VideoIcon } from "lucide-react";
import { useCall } from "@/contexts/app/call-provider";
import { useMessagesContext } from "@/contexts/app/messages-provider";
import { UserUI } from "./user";

function VideoCallButton() {
  const { call } = useCall();
  const { selectedChat: chat } = useMessagesContext();
  return (
    <Button variant="outline" onClick={() => call(chat!.id)} disabled={!chat}>
      <VideoIcon />
    </Button>
  );
}

export function ChatPanelTopBar() {
  const { user } = useUser();
  const { selectedChat } = useMessagesContext();
  if (!selectedChat) return null;
  const chatUser = selectedChat.Recipients.find((u: any) => user?.id != u.id)!;
  return (
    <div className="p-4 flex gap-2 items-center border-b ">
      <UserUI {...chatUser} />
      <div className="ml-auto">
        <VideoCallButton />
      </div>
    </div>
  );
}
