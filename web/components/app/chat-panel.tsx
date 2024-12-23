"use client";
import { useState } from "react";
import { Input } from "../ui/input";
import { Chats } from "./chats";
import axios from "axios";
import { useMessagesContext } from "@/contexts/app/messages-provider";
import { ChatPanelTopBar } from "./chat-panel-topbar";
import PeerPage from "@/app/peer/peer";
import { useCallProvider } from "@/contexts/app/call-provider";
import { CallWindow } from "./call-window";

function ChatInput() {
  const [content, setContent] = useState<string>("");
  const { chatId } = useMessagesContext();

  async function createMessage() {
    await axios.post(`/api/chats/${chatId}/messages`, { content });
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
  const { callType } = useCallProvider();
  return (
    <div className="flex flex-col overflow-hidden h-full min-w-[400px]">
      <ChatPanelTopBar />
      {callType != "idle" ? (
        <CallWindow />
      ) : (
        <>
          <Chats />
          <ChatInput />
        </>
      )}
    </div>
  );
}
