"use client";
import { useMessagesContext } from "@/contexts/app/messages-provider";
import { useUser } from "@/contexts/app/user-provider";
import { cn } from "@/lib/utils";
import moment from "moment";
import { ScrollArea } from "../ui/scroll-area";
import { useEffect, useRef } from "react";
import { Message as MessageAPI } from "@repo/api-types";

function Message({ content, createdAt, senderId }: MessageAPI) {
  const { user } = useUser();
  const isSender = user?.id == senderId;
  return (
    <div
      className={cn(
        "max-w-[400px] p-2 border-border border rounded relative",
        isSender && "ml-auto",
      )}
    >
      <p className="text-sm">
        {content}

        <span className="text-xs text-gray-200 dark:text-gray-600 float-end mt-2 ml-2 select-none">
          {moment(createdAt).format("hh:mm a")}
        </span>
      </p>
    </div>
  );
}

export function Chats() {
  const { messages } = useMessagesContext();
  const divRef = useRef<HTMLDivElement>(null!);
  useEffect(() => {
    divRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  return (
    <ScrollArea>
      <div className="flex flex-col overflow-auto flex-grow w-full p-8 gap-2">
        {messages.map((message) => (
          <div key={message.id} className="w-full flex">
            <Message {...message} />
          </div>
        ))}
      </div>
      <div ref={divRef} />
    </ScrollArea>
  );
}
