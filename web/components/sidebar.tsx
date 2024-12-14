import { Input } from "@/components/ui/input";
import { FriendsDialog } from "./add-friend-dialog";

function SideToolbox() {
  return (
    <div className="mt-auto w-full p-4 border-t">
      <div className="w-12 h-12 rounded-full bg-gray-600" />
    </div>
  );
}

function ChatSearch() {
  return (
    <div className="w-full p-4 flex gap-2">
      <Input placeholder="Search a chat" />
      <FriendsDialog />
    </div>
  );
}

function ChatList() {
  return (
    <div className="flex flex-col overflow-scroll w-full py-2">
      {new Array(20).fill(1).map((v, idx) => (
        <div className="px-5 py-2 space-x-3 flex items-center">
          <div className="w-10 h-10 rounded-full bg-gray-600" />
          <span>Shivang Rathore</span>
        </div>
      ))}
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="max-w-sm bg-background h-screen w-full border-r flex flex-col overflow-hidden">
      <ChatSearch />
      <ChatList />
      <SideToolbox />
    </aside>
  );
}
