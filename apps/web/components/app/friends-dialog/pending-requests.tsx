"use client";

import { Loader } from "@/components/loader";
import { Input } from "@/components/ui/input";
import { useUser } from "@/contexts/app/user-provider";
import { apiClient } from "@/lib/api-client";
import queryKeyFactory from "@/lib/query-key-factory";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Relationship, User } from "@repo/api-types";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import useDebounced from "use-debounced";
import { Entry } from "./entry";
import { UserUI } from "../user";
import { Button } from "@/components/ui/button";
import { CheckIcon, XIcon } from "lucide-react";

export function PendingRequests() {
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
    queryKey: queryKeyFactory.relationships.requests(search),
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
