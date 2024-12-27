"use client";
import { useState } from "react";
import { Input } from "../ui/input";
import { Chats } from "./chats";
import { useMessagesContext } from "@/contexts/app/messages-provider";
import { ChatPanelTopBar } from "./chat-panel-topbar";
import { apiClient } from "@/lib/api-client";
import { useSocket } from "@/contexts/app/socket-provider";
import { VideoChat } from "./video-chat";

function ChatInput() {
  const [content, setContent] = useState<string>("");
  const { chatId } = useMessagesContext();

  async function createMessage() {
    await apiClient.post(`/users/@me/chats/${chatId}/messages`, { content });
    setContent("");
  }

  return (
    <form
      className="p-4"
      onSubmit={async (e) => {
        e.preventDefault();
        await createMessage();
      }}
    >
      <Input
        placeholder="Enter a message"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
    </form>
  );
}

export function ChatPanel() {
  const { callState } = useSocket();

  return (
    <div className="flex flex-col overflow-hidden h-full min-w-[400px]">
      <ChatPanelTopBar />
      {callState.state == "idle" ? <Chats /> : <VideoChat />}
      <ChatInput />
    </div>
  );
}
