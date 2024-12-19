"use client";
import { useMessagesContext } from "@/contexts/app/messages-context";
import { cn } from "@/lib/utils";
import moment from "moment";

function Message({
  isSender = false,
  content,
  createdAt,
}: {
  isSender?: boolean;
  content: string;
  createdAt: string;
}) {
  return (
    <div
      className={cn(
        "max-w-[400px] p-2 border-border border rounded relative",
        isSender && "ml-auto"
      )}
    >
      <p className="text-sm">
        {content}

        <span className="text-xs text-gray-200 dark:text-gray-600 float-end mt-2 ml-2 select-none">
          {moment(createdAt).format("hh:mm")}
        </span>
      </p>
    </div>
  );
}

export function Chats() {
  const { messages } = useMessagesContext();
  return (
    <div className="flex flex-col overflow-auto flex-grow w-full p-8 gap-2">
      {messages.map((message) => (
        <div key={message.id} className="w-full flex">
          <Message
            isSender={message.isSender}
            content={message.content}
            createdAt={message.createdAt}
          />
        </div>
      ))}
    </div>
  );
}
