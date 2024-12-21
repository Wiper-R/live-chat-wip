"use client";
import { useState } from "react";
import { Input } from "../ui/input";
import { ChatUser } from "./chat-user";
import { Chats } from "./chats";
import axios from "axios";
import { useMessagesContext } from "@/contexts/app/messages-provider";

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
        e.stopPropagation();
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
  return (
    <div className="flex flex-col overflow-hidden h-full">
      <ChatUser />
      <Chats />
      <ChatInput />
    </div>
  );
}
