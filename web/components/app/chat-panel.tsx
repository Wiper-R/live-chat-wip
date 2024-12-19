"use client";
import { useState } from "react";
import { Input } from "../ui/input";
import { ChatUser } from "./chat-user";
import { Chats } from "./chats";
import { useMutation, useQueryClient } from "react-query";
import axios from "axios";
import { useMessagesContext } from "@/contexts/app/messages-context";

function ChatInput() {
  const [content, setContent] = useState<string>("");
  const client = useQueryClient();
  const { chatId } = useMessagesContext();
  const { mutate } = useMutation({
    async mutationFn({ content }: { content: string }) {
      await axios.post(`/api/chats/${chatId}/messages`, { content });
      client.invalidateQueries(["messages", chatId]);
      setContent("");
    },
  });

  async function createMessage() {
    mutate({ content });
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
  return (
    <div className="flex flex-col overflow-hidden h-full">
      <ChatUser />
      <Chats />
      <ChatInput />
    </div>
  );
}
