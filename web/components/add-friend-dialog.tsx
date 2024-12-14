"use client";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQuery } from "react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import useDebounced from "use-debounced";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area"; // Assuming you have a ScrollArea component

type User = { name?: string; email: string; username: string };

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
    enabled: search.length > 0, // Only fetch when there's a search term
  });

  useEffect(() => {
    refetch();
  }, [debouncedSearch, refetch]);

  return (
    <div className="flex flex-col h-full">
      <Input
        placeholder="Search by username eg. wiperr, sachin"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4"
      />
      <ScrollArea className="flex-grow pr-2">
        <div className="space-y-2">
          {new Array(6).fill(0).map((_, i) => {
            return (
              <div
                key={i}
                className="py-2 pr-2 flex gap-2 items-center bg-white rounded-lg"
              >
                <div className="w-12 h-12 rounded-full bg-gray-600" />
                <div>
                  <div>Shivang Rathore</div>
                  <div className="text-sm text-gray-500">@wiperr</div>
                </div>
                <Button className="ml-auto">Send Request</Button>
              </div>
            );
          })}
          {/* {users && users.length > 0 ? (
            users.map((user) => (
              <div
                key={user.username}
                className="py-2 pr-2 flex gap-2 items-center bg-white rounded-lg"
              >
                <div className="w-12 h-12 rounded-full bg-gray-600" />
                <div>
                  <div>{user.name || "Unset"}</div>
                  <div className="text-sm text-gray-500">@{user.username}</div>
                </div>
                <Button className="ml-auto">Send Request</Button>
              </div>
            ))
          ) : search.length > 0 ? (
            <div className="text-center text-gray-500">No Results</div>
          ) : (
            <div className="text-center text-gray-500">
              Search for users to add as friends
            </div>
          )} */}
        </div>
      </ScrollArea>
    </div>
  );
}

// Rest of the code remains the same as in the original implementation...

export function FriendsDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"outline"}>
          <PlusIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="h-[400px]">
        <Tabs defaultValue="friends" className="h-full">
          <DialogHeader className="mb-4">
            <TabsList className="w-fit">
              <TabsTrigger value="friends">Friends</TabsTrigger>
              <TabsTrigger value="pending-requests">Requests</TabsTrigger>
              <TabsTrigger value="add-friend">Add Friend</TabsTrigger>
            </TabsList>
          </DialogHeader>
          <TabsContent value="add-friend" className="h-full">
            <AddFriend />
          </TabsContent>
          {/* Other tab contents remain the same */}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function FriendEntry() {
  return <div className="w-full h-[60px] bg-white"></div>;
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
  }, [debouncedSearch]);
  return (
    <div className="flex flex-col h-full">
      <Input
        placeholder="Search by username eg. wiperr, sachin"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="my-4"
      />
      <div className="h-full overflow-hidden bg-orange-500">
        {/* {users && users.length ? ( */}
        <div className="overflow-auto h-full w-full space-y-2">
          {new Array(10).fill(0).map((v, idx) => (
            <FriendEntry key={idx} />
          ))}
        </div>
      </div>
      {/* ) : (
        <div className="text-center text-muted-foreground">
          We couldn't find anyone with that name
        </div>
      )} */}
    </div>
  );
}

function PendingRequests() {
  return <div></div>;
}
