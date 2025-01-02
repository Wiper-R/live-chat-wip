"use client";
import { apiClient } from "@/lib/api-client";
import { createContext } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { PropsWithChildren } from "react";
import { useQuery } from "react-query";
import queryFactory from "@/lib/query-key-factory";
import { User } from "@repo/api-types";

const [Context, useUser] = createContext<{
  user?: User;
  isLoading: boolean;
}>();

export function UserProvider({ children }: PropsWithChildren) {
  const router = useRouter();
  const { data: user, isLoading } = useQuery({
    async queryFn() {
      const res = await apiClient.get("/users/@me");
      return res.data as User;
    },
    queryKey: queryFactory.users.current(),
    onError() {
      router.push("/signin");
    },
    retry: false,
  });
  return (
    <Context.Provider value={{ user, isLoading }}>{children}</Context.Provider>
  );
}

export { useUser };
