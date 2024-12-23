import { ChatPanel } from "@/src/components/app/chat-panel";
import { ChatProvider } from "@/src/contexts/app/chat-provider";
import { MessagesProvider } from "@/src/contexts/app/messages-provider";

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
