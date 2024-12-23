"use client";
import { useMessagesContext } from "@/src/contexts/app/messages-provider";
import { useUser } from "@/src/contexts/app/user-provider";
import { cn } from "@/src/lib/utils";
import moment from "moment";

function Message({
  content,
  createdAt,
  senderId,
}: {
  senderId: number;
  content: string;
  createdAt: string;
}) {
  const { user } = useUser();
  const isSender = user?.id == senderId;
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
          {moment(createdAt).format("hh:mm a")}
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
            content={message.content}
            createdAt={message.createdAt}
            senderId={message.senderId}
          />
        </div>
      ))}
    </div>
  );
}
