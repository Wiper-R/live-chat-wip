"use client";

import { Loader } from "@/components/loader";
import { Input } from "@/components/ui/input";
import { useFriendDialogState } from "@/contexts/app/friends-dialog-state-provider";
import { useUser } from "@/contexts/app/user-provider";
import { apiClient } from "@/lib/api-client";
import queryKeyFactory from "@/lib/query-key-factory";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Chat, Relationship, User } from "@repo/api-types";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import useDebounced from "use-debounced";

import { Entry } from "./entry";
import { UserUI } from "../user";
import { Button } from "@/components/ui/button";

export function FriendList() {
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
    queryKey: queryKeyFactory.relationships.list(search),
  });

  const context = useFriendDialogState();
  const { user } = useUser();

  useEffect(() => {
    refetch();
  }, [debouncedSearch, refetch]);
  // TODO: Add loading state

  async function createChat(recipient_id: string) {
    const res = await apiClient.post("/users/@me/chats", {
      recipient_id,
    });
    const chat: Chat = res.data;
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
