import { Sidebar } from "@/components/sidebar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function ChatsContainer() {
  return (
    <div className="flex-grow">
      <ChatPanel />
      {/* <NoChatSelected /> */}
    </div>
  );
}

function NoChatSelected() {
  return (
    <div className="flex items-center justify-center h-full flex-grow text-xl">
      Select a chat to start messaging
    </div>
  );
}

function ChatUser() {
  return (
    <div className="p-4 flex gap-2 items-center border-b">
      <div className="w-10 h-10 rounded-full bg-gray-600" />
      <span>Shivang Rathore</span>
    </div>
  );
}

function Chat({ isSender = false }: { isSender?: boolean }) {
  return (
    <div className={cn("max-w-[400px]", isSender && "ml-auto")}>
      Lorem ipsum, dolor sit amet consectetur adipisicing elit. Sed doloribus
      corrupti nobis voluptas tempora libero, illum quae deserunt animi
      perferendis exercitationem sit aperiam nihil dignissimos ab facilis
      praesentium error natus molestiae est veritatis non voluptatem sint.
      Dolorem reprehenderit consectetur laudantium facilis ipsam? Quod, fuga!
      Quidem nisi dolor exercitationem cumque at.
    </div>
  );
}

function Chats() {
  return (
    <div className="flex flex-col overflow-auto flex-grow w-full p-8">
      {new Array(20).fill(1).map((v, idx) => (
        <div key={idx} className="w-full flex">
          <Chat isSender={idx % 2 == 0} />
        </div>
      ))}
    </div>
  );
}

function ChatInput() {
  return (
    <div className="p-4">
      <Input placeholder="Enter a message" />
    </div>
  );
}

function ChatPanel() {
  return (
    <div className="flex flex-col overflow-hidden h-full">
      <ChatUser />
      <Chats />
      <ChatInput />
    </div>
  );
}

export default async function Home() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <ChatsContainer />
    </div>
  );
}
