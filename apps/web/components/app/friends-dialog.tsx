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
import {
  createContext,
  FormEvent,
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
import queryKeyFactory, * as queryFactory from "@/lib/query-key-factory";
import { apiClient } from "@/lib/api-client";
import { useUser } from "@/contexts/app/user-provider";
import { UserUI } from "./user";
import { Relationship, User } from "@repo/api-types";
import { FieldValues, Form, useForm } from "react-hook-form";

// TODO: Add tooltips to buttons

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
  undefined,
);

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
    <FriendsDialogContext.Provider value={{ setOpen }}>
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
    </FriendsDialogContext.Provider>
  );
}
function FriendList() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounced(search, 200);
  const {
    data: relationships,
    refetch,
    isLoading,
  } = useQuery<Relationship[]>({
    queryFn: async () => {
      const res = await apiClient.get("/users/@me/relationships?type=friends", {
        params: { q: search },
      });
      return res.data;
    },
    queryKey: queryFactory.relationships.list(search),
  });

  const context = useContext(FriendsDialogContext)!;
  const { user } = useUser();

  useEffect(() => {
    refetch();
  }, [debouncedSearch, refetch]);
  // TODO: Add loading state

  async function createChat(recipient_id: string) {
    // TODO: Make prisma shared dep (so we can import types here)
    const res = await apiClient.post("/users/@me/chats", {
      recipient_id,
    });
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
          ) : relationships && relationships.length > 0 ? (
            relationships.map((relationship) => {
              const otherUser: User =
                relationship.senderId == user?.id
                  ? relationship.Recipient
                  : relationship.Sender;
              return (
                <Entry key={otherUser.id}>
                  <UserUI {...otherUser} />
                  <Button
                    className="ml-auto"
                    onClick={() => createChat(otherUser.id)}
                  >
                    Message
                  </Button>
                </Entry>
              );
            })
          ) : (
            <div className="text-center text-gray-500">No Results</div>
          )}
        </div>
      </ScrollArea>
    </>
  );
}

function PendingRequests() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounced(search, 200);
  const {
    data: requests,
    refetch,
    isLoading,
  } = useQuery<Relationship[]>({
    queryFn: async () => {
      const res = await apiClient.get("/users/@me/relationships?type=pending", {
        params: { q: search },
      });
      return res.data;
    },
    queryKey: queryFactory.relationships.requests(search),
  });

  useEffect(() => {
    refetch();
  }, [debouncedSearch, refetch]);

  async function acceptFriendRequest(requestId: string) {
    await apiClient.patch(
      `/users/@me/relationships/${requestId}?action=accept`,
    );
    refetch();
  }

  async function rejectFriendRequest(requestId: string) {
    await apiClient.patch(
      `/users/@me/relationships/${requestId}?action=reject`,
    );
    refetch();
  }

  const { user } = useUser();

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
                const isSender = request.senderId == user!.id;
                const other: User =
                  request.senderId == user!.id
                    ? request.Recipient
                    : request.Sender;
                return (
                  <Entry key={request.id}>
                    <UserUI {...other} />
                    <div className="flex gap-1 ml-auto">
                      {/* TODO: Separate button components for better state management */}
                      {!isSender && (
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

function AddFriend() {
  const [relationship, setRelationship] = useState<Relationship>();
  const { mutateAsync } = useMutation({
    async mutationFn(username: string) {
      const res = await apiClient.post("/users/@me/relationships", {
        username,
      });
      return res.data as Relationship;
    },
    onSuccess(data) {
      setRelationship(data);
    },
  });

  const [search, setSearch] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await mutateAsync(search);
    setSearch("");
  }

  return (
    <>
      <form className="flex gap-2" onSubmit={onSubmit}>
        <Input
          placeholder="Search by username eg. wiperr, sachin"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4 flex-grow items-center"
        />
        <Button type="submit" className="w-full max-w-[100px]">
          Add
        </Button>
      </form>
      {relationship && (
        <span className="text-lime-500 text-sm">
          Friend request sent to @{relationship.Recipient.username} (
          {relationship.Recipient.name})
        </span>
      )}
    </>
  );
}
