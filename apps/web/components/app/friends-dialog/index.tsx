"use client";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import {
  DialogTitle,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQuery } from "react-query";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import queryKeyFactory from "@/lib/query-key-factory";
import { apiClient } from "@/lib/api-client";
import { FriendsDialogState } from "@/contexts/app/friends-dialog-state-provider";
import { FriendList } from "./friend-list";
import { PendingRequests } from "./pending-requests";
import { AddFriend } from "./add-friend";

export function FriendsDialog() {
  const tabs = {
    "add-friend": AddFriend,
    "pending-requests": PendingRequests,
    friends: FriendList,
  };
  const [open, setOpen] = useState(false);
  const { data: pending } = useQuery<number>({
    async queryFn() {
      const res = await apiClient.get("/users/@me/relationships/pending-count");
      return res.data.pending;
    },
    queryKey: queryKeyFactory.relationships.pendingCount(),
  });
  return (
    <FriendsDialogState.Provider value={{ setOpen }}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant={"outline"}
            onClick={() => setOpen(true)}
            className="relative"
          >
            <PlusIcon />
            {pending ? (
              <span className="w-4 h-4 rounded-full bg-red-600 text-white  absolute -right-2 -bottom-2 p-0.5 text-xs flex items-center justify-center">
                {pending}
              </span>
            ) : null}
          </Button>
        </DialogTrigger>
        <DialogContent className="h-[400px] overflow-hidden">
          <Tabs
            defaultValue="friends"
            className="flex flex-col h-full overflow-hidden"
          >
            <DialogHeader className="pb-4">
              <VisuallyHidden>
                <DialogTitle>Friends</DialogTitle>
              </VisuallyHidden>
              <TabsList className="w-fit">
                <TabsTrigger value="friends">Friends</TabsTrigger>
                <TabsTrigger value="pending-requests">Requests</TabsTrigger>
                <TabsTrigger value="add-friend">Add Friend</TabsTrigger>
              </TabsList>
            </DialogHeader>
            {Object.entries(tabs).map(([value, Content]) => (
              <TabsContent
                value={value}
                className="hidden grow flex-col overflow-hidden p-1 data-[state=active]:flex"
                key={value}
              >
                <Content />
              </TabsContent>
            ))}
          </Tabs>
        </DialogContent>
      </Dialog>
    </FriendsDialogState.Provider>
  );
}
