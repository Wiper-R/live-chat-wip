import { ChatPanel } from "@/components/app/chat-panel";
import { MessagesProvider } from "@/contexts/app/messages-provider";

export default function Chat({ params: { id } }: { params: { id: number } }) {
  return (
    <MessagesProvider chatId={id}>
      <ChatPanel />
    </MessagesProvider>
  );
}
