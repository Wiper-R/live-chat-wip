"use client";
import { apiClient } from "@/lib/api-client";
import { createCustomContext } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { PropsWithChildren } from "react";
import { useQuery } from "react-query";
import queryFactory from "@/lib/query-key-factory";

type User = {
  id: number;
  email: string;
  name?: string;
  username: string;
};

const [Context, useUser] = createCustomContext<{
  user?: User;
}>();

export function UserProvider({ children }: PropsWithChildren) {
  const router = useRouter();
  const { data: user } = useQuery({
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
  return <Context.Provider value={{ user }}>{children}</Context.Provider>;
}

export { useUser };
