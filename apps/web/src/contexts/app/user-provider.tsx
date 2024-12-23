"use client";
import { createCustomContext } from "@/src/lib/utils";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { PropsWithChildren, useEffect, useState } from "react";

type User = {
  id: number;
  email: string;
  name?: string;
  username: string;
};

const [Context, useUser] = createCustomContext<{
  user?: User;
  isLoading: boolean;
}>();

export function UserProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User>();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    async function getUser() {
      try {
        const res = await axios.get("/api/users/");
        setUser(res.data);
      } catch (e) {
        if (e instanceof AxiosError) {
          if (e.status == 401) {
            router.push("/final-steps");
          }
        }
      } finally {
        setIsLoading(false);
      }
    }
    getUser();
  }, []);
  return (
    <Context.Provider value={{ user, isLoading }}>{children}</Context.Provider>
  );
}

export { useUser };
