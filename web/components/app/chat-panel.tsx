import { Input } from "../ui/input";
import { ChatUser } from "./chat-user";
import { Chats } from "./chats";

function ChatInput() {
  return (
    <div className="p-4">
      <Input placeholder="Enter a message" />
    </div>
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
