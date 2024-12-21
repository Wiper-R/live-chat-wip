import { useUser } from "@/contexts/app/user-provider";
import { Button } from "../ui/button";
import { VideoIcon } from "lucide-react";

export function ChatPanelTopBar() {
  // FIXME: Display active chat user, not current user
  const { user } = useUser();
  return (
    <div className="p-4 flex gap-2 items-center border-b ">
      <div className="w-10 h-10 rounded-full bg-gray-600" />
      <div className="flex flex-col">
        <span>{user?.name}</span>
        <span className="text-sm text-gray-300 dark:text-gray-500">
          @{user?.username}
        </span>
      </div>
      <div className="ml-auto">
        <Button variant="outline">
          <VideoIcon />
        </Button>
      </div>
    </div>
  );
}
