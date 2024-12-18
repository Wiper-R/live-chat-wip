import { ChatPanel } from "./chat-panel";

export function ChatsContainer() {
  return (
    <div className="flex-grow">
      <ChatPanel />
      {/* <NoChatSelected /> */}
    </div>
  );
}
