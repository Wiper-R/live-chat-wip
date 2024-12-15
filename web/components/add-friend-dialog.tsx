"use client";
import { Button } from "@/components/ui/button";
import { CheckIcon, CrossIcon, PlusIcon, XIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useMutation, useQuery } from "react-query";
import axios from "axios";
import { PropsWithChildren, useEffect, useState } from "react";
import { Input } from "./ui/input";
import useDebounced from "use-debounced";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";

type User = { name?: string; email: string; username: string; id: number };

// TODO: Add tooltips to buttons

function UserComponent({
  name,
  username,
  avatar,
}: {
  name: string;
  username: string;
  avatar: string;
}) {
  // TODO: Use avtar
  return (
    <div className="flex items-center gap-2">
      <div className="w-12 h-12 rounded-full bg-gray-600" />
      <div>
        <div>{name}</div>
        <div className="text-sm text-gray-500">@{username}</div>
      </div>
    </div>
  );
}

function Entry({ children }: PropsWithChildren) {
  return (
    <div
      className="p-2 flex gap-2 items-center bg-background rounded-lg focus:ring-1 ring-ring outline-none border-none"
      tabIndex={0}
    >
      {children}
    </div>
  );
}

export function FriendsDialog() {
  const tabs = {
    "add-friend": AddFriend,
    "pending-requests": PendingRequests,
    friends: FriendList,
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"outline"}>
          <PlusIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="h-[400px] overflow-hidden">
        <Tabs
          defaultValue="friends"
          className="flex flex-col h-full overflow-hidden"
        >
          <DialogHeader className="pb-4">
            <TabsList className="w-fit">
              <TabsTrigger value="friends">Friends</TabsTrigger>
              <TabsTrigger value="pending-requests">Requests</TabsTrigger>
              <TabsTrigger value="add-friend">Add Friend</TabsTrigger>
            </TabsList>
          </DialogHeader>
          {Object.entries(tabs).map(([value, Content]) => (
            <TabsContent
              value={value}
              className="grow flex-col overflow-hidden p-1 data-[state=active]:flex"
              key={value}
            >
              <Content />
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
function FriendList() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounced(search, 200);
  const { data: users, refetch } = useQuery<User[]>({
    queryFn: async () => {
      const res = await axios.get("/api/friends", {
        params: { q: search },
      });
      return res.data;
    },
  });

  useEffect(() => {
    refetch();
  }, [debouncedSearch, refetch]);
  // TODO: Add loading state
  return (
    <>
      <Input
        placeholder="Search by username eg. wiperr, sachin"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4"
      />
      <ScrollArea>
        <div className="space-y-2 p-1 pr-4">
          {users && users.length > 0 ? (
            users.map((user) => (
              <Entry>
                <UserComponent
                  avatar=""
                  name={user.name || "Undefined"}
                  username={user.username}
                />
                <Button>Message</Button>
              </Entry>
            ))
          ) : (
            <div className="text-center text-gray-500">No Results</div>
          )}
        </div>
      </ScrollArea>
    </>
  );
}

type FriendRequest = {
  id: number;
  sender: User;
  receiver: User;
  isSender: boolean;
};

function PendingRequests() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounced(search, 200);
  const { data: requests, refetch } = useQuery<FriendRequest[]>({
    queryFn: async () => {
      const res = await axios.get("/api/friends/requests", {
        params: { q: search },
      });
      return res.data;
    },
  });

  useEffect(() => {
    refetch();
  }, [debouncedSearch, refetch]);
  return (
    <>
      <Input
        placeholder="Search by username eg. wiperr, sachin"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4"
      />
      <ScrollArea>
        <div className="space-y-2 p-1 pr-4">
          {requests && requests.length > 0 ? (
            requests.map((request) => {
              const me = request.isSender ? request.sender : request.receiver;
              const other = request.isSender
                ? request.receiver
                : request.sender;
              return (
                <Entry>
                  <UserComponent
                    avatar=""
                    name={other.name || "Undefined"}
                    username={other.username}
                  />
                  <div className="flex gap-1 ml-auto">
                    {!request.isSender && (
                      <Button size={"icon"} variant="outline">
                        <CheckIcon />
                      </Button>
                    )}
                    <Button size={"icon"} variant="outline">
                      <XIcon />
                    </Button>
                  </div>
                </Entry>
              );
            })
          ) : search.length > 0 ? (
            <div className="text-center text-gray-500">No Results</div>
          ) : (
            <div className="text-center text-gray-500">
              Search for pending friend requests
            </div>
          )}
        </div>
      </ScrollArea>
    </>
  );
}

function SendFriendRequestButton({ username }: { username: string }) {
  const {
    mutateAsync: sendFriendRequest,
    isSuccess,
    isIdle,
    isLoading,
  } = useMutation({
    async mutationFn(username: string) {
      await axios.post("/api/friends/requests", {
        username,
      });
    },
  });

  return (
    <Button
      onClick={() => sendFriendRequest(username)}
      disabled={isLoading || isSuccess}
    >
      Send Request
    </Button>
  );
}

function AddFriend() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounced(search, 200);
  const { data: users, refetch } = useQuery<User[]>({
    queryFn: async () => {
      const res = await axios.get("/api/users/search", {
        params: { q: search },
      });
      return res.data;
    },
    enabled: search.length > 0,
  });

  useEffect(() => {
    refetch();
  }, [debouncedSearch, refetch]);

  return (
    <>
      <Input
        placeholder="Search by username eg. wiperr, sachin"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4"
      />
      <ScrollArea>
        <div className="space-y-2 p-1 pr-4">
          {users && users.length > 0 ? (
            users.map((user) => (
              <Entry>
                <UserComponent
                  avatar=""
                  name={user.name || "Undefined"}
                  username={user.username}
                />
                <SendFriendRequestButton username={user.username} />
              </Entry>
            ))
          ) : search.length > 0 ? (
            <div className="text-center text-gray-500">No Results</div>
          ) : (
            <div className="text-center text-gray-500">
              Search for users to add as friends
            </div>
          )}
        </div>
      </ScrollArea>
    </>
  );
}
