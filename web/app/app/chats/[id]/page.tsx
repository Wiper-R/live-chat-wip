import { ChatPanel } from "@/components/app/chat-panel";
import { ChatProvider } from "@/contexts/app/chat-provider";
import { MessagesProvider } from "@/contexts/app/messages-provider";

export default function Chat({ params: { id } }: { params: { id: number } }) {
  id = +id;
  return (
    <MessagesProvider chatId={id}>
      <ChatProvider chatId={id}>
        <ChatPanel />
      </ChatProvider>
    </MessagesProvider>
  );
}
