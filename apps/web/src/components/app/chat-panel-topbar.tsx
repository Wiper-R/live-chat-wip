"use client";
import { useUser } from "@/src/contexts/app/user-provider";
import { Button } from "../ui/button";
import { VideoIcon } from "lucide-react";
import { useCallProvider } from "@/src/contexts/app/call-provider";
import { useChatProvider } from "@/src/contexts/app/chat-provider";

function VideoCallButton() {
  const { chat } = useChatProvider();
  const { initiateCall } = useCallProvider();
  return (
    <Button variant="outline" onClick={() => initiateCall(chat!.id)}>
      <VideoIcon />
    </Button>
  );
}

export function ChatPanelTopBar() {
  // FIXME: Display active chat user, not current user
  // TODO: Support multiple users (but not for now)
  const { chat } = useChatProvider();
  const { user } = useUser();
  const chatUser =
    user && chat ? chat.Users.find((u) => u.id != user.id) : undefined;
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
