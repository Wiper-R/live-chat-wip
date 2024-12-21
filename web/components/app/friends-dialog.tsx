"use client";
import { Button } from "@/components/ui/button";
import { CheckIcon, PlusIcon, XIcon } from "lucide-react";
import {
  DialogTitle,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useMutation, useQuery } from "react-query";
import axios from "axios";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { Input } from "@/components/ui/input";
import useDebounced from "use-debounced";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Loader } from "../loader";
import * as queryFactory from "@/lib/query-key-factory";

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

type FriendDialogContext = {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const FriendsDialogContext = createContext<FriendDialogContext | undefined>(
  undefined
);

export function FriendsDialog() {
  const tabs = {
    "add-friend": AddFriend,
    "pending-requests": PendingRequests,
    friends: FriendList,
  };
  const [open, setOpen] = useState(false);
  return (
    <FriendsDialogContext.Provider value={{ setOpen }}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant={"outline"} onClick={() => setOpen(true)}>
            <PlusIcon />
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
    </FriendsDialogContext.Provider>
  );
}
function FriendList() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounced(search, 200);
  const {
    data: users,
    refetch,
    isLoading,
  } = useQuery<User[]>({
    queryFn: async () => {
      const res = await axios.get("/api/friends", {
        params: { q: search },
      });
      return res.data;
    },
    queryKey: queryFactory.friends.list(search),
  });

  const context = useContext(FriendsDialogContext)!;

  useEffect(() => {
    refetch();
  }, [debouncedSearch, refetch]);
  // TODO: Add loading state

  async function createChat(userId: number) {
    // TODO: Make prisma shared dep (so we can import types here)
    const res = await axios.post("/api/chats", { userId });
    const chat = res.data;
    context.setOpen(false);
    router.push(`/app/chats/${chat.id}`);
  }
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
          {isLoading ? (
            <Loader />
          ) : users && users.length > 0 ? (
            users.map((user) => (
              <Entry key={user.id}>
                <UserComponent
                  avatar=""
                  name={user.name || "Undefined"}
                  username={user.username}
                />
                <Button className="ml-auto" onClick={() => createChat(user.id)}>
                  Message
                </Button>
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
  const {
    data: requests,
    refetch,
    isLoading,
  } = useQuery<FriendRequest[]>({
    queryFn: async () => {
      const res = await axios.get("/api/friends/requests", {
        params: { q: search },
      });
      return res.data;
    },
    queryKey: queryFactory.friends.requests(search),
  });

  useEffect(() => {
    refetch();
  }, [debouncedSearch, refetch]);

  async function acceptFriendRequest(requestId: number) {
    await axios.post(`/api/friends/requests/${requestId}/accept`);
    refetch();
  }

  async function rejectFriendRequest(requestId: number) {
    await axios.post(`/api/friends/requests/${requestId}/reject`);
    refetch();
  }

  return (
    <>
      <Input
        placeholder="Search by username eg. wiperr, sachin"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4"
      />
      <ScrollArea>
        {isLoading ? (
          <Loader />
        ) : (
          <div className="space-y-2 p-1 pr-4">
            {requests && requests.length > 0 ? (
              requests.map((request) => {
                const other = request.isSender
                  ? request.receiver
                  : request.sender;
                return (
                  <Entry key={request.id}>
                    <UserComponent
                      avatar=""
                      name={other.name || "Undefined"}
                      username={other.username}
                    />
                    <div className="flex gap-1 ml-auto">
                      {/* TODO: Separate button components for better state management */}
                      {!request.isSender && (
                        <Button
                          size={"icon"}
                          variant="outline"
                          onClick={() => acceptFriendRequest(request.id)}
                        >
                          <CheckIcon />
                        </Button>
                      )}
                      <Button
                        size={"icon"}
                        variant="outline"
                        onClick={() => rejectFriendRequest(request.id)}
                      >
                        <XIcon />
                      </Button>
                    </div>
                  </Entry>
                );
              })
            ) : (
              <div className="text-center text-gray-500">No Results</div>
            )}
          </div>
        )}
      </ScrollArea>
    </>
  );
}

function SendFriendRequestButton({ username }: { username: string }) {
  const {
    mutateAsync: sendFriendRequest,
    isSuccess,
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
    queryKey: queryFactory.users.search(search),
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
              <Entry key={user.id}>
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
