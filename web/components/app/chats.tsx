"use client";
import { useMessagesContext } from "@/contexts/app/messages-context";
import { cn } from "@/lib/utils";

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

export function Chats() {
  const { messages } = useMessagesContext();
  return (
    <div className="flex flex-col overflow-auto flex-grow w-full p-8">
      {messages.map((message) => (
        <div key={message.id} className="w-full flex">
          <Chat isSender={message.Sender} />
        </div>
      ))}
    </div>
  );
}
